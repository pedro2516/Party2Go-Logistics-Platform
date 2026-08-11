/**
 * shared/composables/useOrderTracking.js
 *
 * Reusable composable for real-time order tracking via Socket.io + Mapbox GL JS.
 * Shared across: Customer Frontoffice, Business Frontoffice, PWA Courier.
 *
 * Handles:
 *  - Fetching order data from Strapi (address fields, status, metadata)
 *  - Geocoding collection_address & address via Mapbox Geocoding API
 *  - Initializing Mapbox GL map on a given container ref
 *  - Drawing the dashed route polyline from Socket.io `route_calculated`
 *  - Placing Pickup / Destination / Courier markers
 *  - Animating the courier marker along the exact route coordinates (rAF-based, no CSS transform)
 *  - Updating progress percentage and remaining duration from `location_update`
 *  - Advancing the stepper from `notification` events
 *  - Cleaning up map, socket and animation frame on unmount
 *
 * Usage:
 *   const tracking = useOrderTracking(mapEl, { steps, currentStep });
 *   // Access: tracking.isLoading, tracking.orderMeta, tracking.progressPercentage, etc.
 *
 * The UI layer (markers HTML, route colour, map style) is customisable via `options`.
 */

import { ref, computed } from 'vue';
import mapboxgl from 'mapbox-gl';
import { io } from 'socket.io-client';
import { strapiGet, mapOrder } from '@shared/utils/strapi';

// ── Bounding box for Continental Portugal (excludes Azores & Madeira) ──────
const PT_CONTINENTAL_BBOX = '-9.5,36.9,-6.2,42.2';

// ── Company HQ address — courier always departs from here ───────────────────
const COMPANY_HQ_ADDRESS = 'Av. da Universidade, 4800-058 Guimarães';

// ── Status key normalisation map ─────────────────────────────────────────
const STATUS_KEY_MAP = {
  pending:      'aceite',
  aceite:       'aceite',
  assigned:     'aceite',
  'em trânsito':'transito',
  'em transito':'transito',
  transito:     'transito',
  'a caminho':  'transito',
  in_traffic:   'transito',
  em_recolha:   'em_recolha',
  collecting:   'em_recolha',
  completed:    'concluida',
  'concluída':  'concluida',
  concluido:    'concluida',
  concluida:    'concluida',
  delivered:    'concluida',
  entregue:     'concluida',
  arrived:      'arrived',
};

/**
 * @param {import('vue').Ref<HTMLElement|null>} mapEl  - template ref for the map container div
 * @param {object} stepState                           - { steps: Ref, currentStep: Ref }
 * @param {object} [options]                           - customisation options
 * @param {string} [options.mapStyle]                  - Mapbox style URI (default: streets-v12)
 * @param {string} [options.routeColor]                - hex colour for the dashed line
 * @param {number} [options.routeWidth]                - line width in pixels
 * @param {string} [options.socketUrl]                 - Socket.io server URL
 * @param {number} [options.stepIntervalMs]            - marker animation duration per step (ms)
 * @param {Function} [options.createCourierEl]         - factory returning the courier marker HTMLElement
 * @param {Function} [options.createPickupEl]          - factory returning the pickup marker HTMLElement
 * @param {Function} [options.createDestinationEl]     - factory returning the destination marker HTMLElement
 */
export function useOrderTracking(mapEl, stepState, options = {}) {
  const {
    mapStyle      = 'mapbox://styles/mapbox/streets-v12',
    routeColor    = '#FD5E3A',
    routeWidth    = 5,
    socketUrl     = 'http://localhost:1337',
    stepIntervalMs = 2800,
    createCourierEl     = _defaultCourierEl,
    createPickupEl      = _defaultPickupEl,
    createDestinationEl = _defaultDestinationEl,
  } = options;

  const { steps, currentStep } = stepState;

  // ── Public reactive state ─────────────────────────────────────────────
  const isLoading          = ref(true);
  const simulationReady    = ref(false); // true once map is loaded and ready to start
  const simulationStarted  = ref(false); // true once courier starts moving
  const progressPercentage = ref(0);
  const remainingDuration  = ref(15 * 60);
  const totalDuration      = ref(15 * 60);
  const timeMinutes        = computed(() => Math.max(0, Math.round(remainingDuration.value / 60)));

  /** Metadata extracted from Strapi — available after load */
  const orderMeta = ref({
    documentId:         '',
    order_id:           '',
    clientName:         '',
    productName:        '',
    status:             '',
    clientType:         'personal', // 'business' | 'personal'
    pickupAddress:      '',
    destinationAddress: '',
  });

  // ── Internal mutable state (NOT reactive — mutated by rAF / socket) ──
  let _map            = null;
  let _socket         = null;
  let _courierMarker  = null;
  let _routeCoords    = [];   // full [lng,lat] array from Mapbox Directions
  let _prevIdx        = 0;    // last animated route index
  let _rafHandle      = null; // requestAnimationFrame handle
  // Stored for deferred startSimulation() call
  let _pendingSimArgs = null; // { orderId, hqCoord, pickupCoord, destCoord, clientType }

  // ── Mapbox token ────────────────────────────────────────────────────
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // ────────────────────────────────────────────────────────────────────
  // Geocoding helper — resolves an address string to [lng, lat]
  // ────────────────────────────────────────────────────────────────────
  async function geocode(address) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !address) return null;

    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(address)}.json` +
      `?access_token=${token}` +
      `&bbox=${PT_CONTINENTAL_BBOX}` +
      `&types=address,place,locality&language=pt&limit=1`;

    try {
      const res = await fetch(url).then(r => r.json());
      const feat = res.features?.[0];
      if (feat) {
        console.log(`[useOrderTracking] ✅ geocode("${address}") →`, feat.place_name, feat.center);
        return feat.center; // [lng, lat]
      }
      console.warn(`[useOrderTracking] ⚠️  No geocoding result for: "${address}"`);
    } catch (e) {
      console.error('[useOrderTracking] geocode error:', e);
    }
    return null;
  }

  // ────────────────────────────────────────────────────────────────────
  // Animate the courier marker along route coordinates using rAF
  // Decoupled from CSS transform — Mapbox GL handles positioning
  // ────────────────────────────────────────────────────────────────────
  function _animateMarkerTo(targetIdx) {
    if (!_courierMarker || _routeCoords.length === 0) return;

    const endIdx   = Math.min(targetIdx, _routeCoords.length - 1);
    const startIdx = _prevIdx;
    if (endIdx <= startIdx) return;

    if (_rafHandle) cancelAnimationFrame(_rafHandle);

    const totalSteps = endIdx - startIdx;
    let   startTime  = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / stepIntervalMs, 1);
      const idx      = Math.min(
        Math.floor(startIdx + progress * totalSteps),
        _routeCoords.length - 1
      );
      const [lng, lat] = _routeCoords[idx];
      // setLngLat uses geographic coords — Mapbox GL re-projects on every frame
      // so panning/zooming never displaces the marker from its real position
      _courierMarker.setLngLat([lng, lat]);

      if (progress < 1) {
        _rafHandle = requestAnimationFrame(frame);
      } else {
        _prevIdx   = endIdx;
        _rafHandle = null;
      }
    }

    _rafHandle = requestAnimationFrame(frame);
  }

  // ────────────────────────────────────────────────────────────────────
  // Draw the dashed route polyline on the Mapbox map
  // ────────────────────────────────────────────────────────────────────
  function _drawRoute(coordinates) {
    if (!_map || _map.getSource('route')) return; // idempotent

    _map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates },
      },
    });

    _map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color':     routeColor,
        'line-width':     routeWidth,
        'line-dasharray': [1, 2],
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // Socket connection — joins the order room. Does NOT start simulation.
  // Call startSimulation() to begin the courier movement.
  // ────────────────────────────────────────────────────────────────────
  function _connectSocket({ orderId, hqCoord, pickupCoord, destCoord, clientType }) {
    _socket = io(socketUrl);

    // Join the order room so we receive notifications
    _socket.emit('join_order_room', orderId);

    // Store args so startSimulation() can fire them later
    _pendingSimArgs = { orderId, hqCoord, pickupCoord, destCoord, clientType };

    // Route received → draw polyline + store coords for rAF interpolation
    _socket.on('route_calculated', (data) => {
      _routeCoords             = data.coordinates;
      _prevIdx                 = 0;
      totalDuration.value      = data.durationSeconds;
      remainingDuration.value  = data.durationSeconds;
      progressPercentage.value = 0;
      _drawRoute(data.coordinates);
    });

    // Location tick → update progress + animate marker along real route
    _socket.on('location_update', (data) => {
      if (!data.lat || !data.lng) return;

      if (data.totalCoordinates > 0) {
        const ratio             = data.currentIndex / (data.totalCoordinates - 1);
        progressPercentage.value = Math.min(100, ratio * 100);
        remainingDuration.value  = Math.max(0, totalDuration.value * (1 - ratio));
      }

      _animateMarkerTo(data.currentIndex);
    });

    // Status notification → advance stepper
    _socket.on('notification', (data) => {
      const rawKey  = STATUS_KEY_MAP[data.status?.toLowerCase()];
      const stepKey = rawKey || 'aceite';
      
      const idx = steps.value.findIndex(s => s.key === stepKey);
      if (idx !== -1) currentStep.value = idx;
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // Manually start the courier simulation (called from UI button)
  // ────────────────────────────────────────────────────────────────────
  function startSimulation() {
    if (!_pendingSimArgs || !_socket) {
      console.warn('[useOrderTracking] startSimulation called but not ready yet.');
      return;
    }
    if (simulationStarted.value) return; // idempotent

    const { orderId, hqCoord, pickupCoord, destCoord, clientType } = _pendingSimArgs;
    simulationStarted.value = true;

    // Route: HQ → pickup → destination (business) or HQ → destination (personal)
    _socket.emit('start_simulation', {
      orderId,
      origin:      { lng: hqCoord[0],   lat: hqCoord[1]   },
      pickup:      pickupCoord && clientType === 'business'
        ? { lng: pickupCoord[0], lat: pickupCoord[1] }
        : null,
      destination: { lng: destCoord[0], lat: destCoord[1] },
    });
  }

  // ────────────────────────────────────────────────────────────────────
  // Main initialisation — called from onMounted with the Strapi documentId
  // ────────────────────────────────────────────────────────────────────
  async function init(documentId) {
    if (!documentId) {
      console.error('[useOrderTracking] ❌ documentId is required');
      isLoading.value = false;
      return;
    }

    try {
      // 1. Fetch order from Strapi
      const res   = await strapiGet(`/api/orders/${documentId}?populate=*`);
      const order = mapOrder(res.data);

      console.log('[useOrderTracking] ✅ Strapi order data:', {
        documentId:          order.documentId,
        order_id:            order.order_id,
        status:              order.status,
        address:             order.address,
        collection_address:  order.collection_address,
        clientName:          order.clientName,
      });

      // 2. Populate metadata
      const clientType = order.collection_address ? 'business' : 'personal';
      let productName  = 'Encomenda Personalizada';
      if (order.products?.length > 0) {
        productName = order.products[0].name || order.products[0].title || productName;
      } else if (order.combos?.length > 0) {
        productName = order.combos[0].name  || order.combos[0].title  || productName;
      }

      orderMeta.value = {
        documentId:         order.documentId,
        order_id:           order.order_id,
        clientName:         order.clientName,
        productName,
        status:             order.status,
        clientType,
        pickupAddress:      order.collection_address,
        destinationAddress: order.address,
      };

      // 3. Resolve initial stepper position from DB status
      const rawKey   = STATUS_KEY_MAP[order.status?.toLowerCase()];
      const stepKey  = rawKey || 'aceite';
      const stepIdx  = steps.value.findIndex(s => s.key === stepKey);
      if (stepIdx !== -1) currentStep.value = stepIdx;

      // 4. Guard: destination address required
      if (!order.address) {
        console.error('[useOrderTracking] ❌ Missing destination address — map will not initialise.');
        isLoading.value = false;
        return;
      }

      // 5. Geocode: HQ (always origin), destination, and optionally pickup
      const [hqCoord, destCoord, pickupCoord] = await Promise.all([
        geocode(COMPANY_HQ_ADDRESS),
        geocode(order.address),
        order.collection_address ? geocode(order.collection_address) : Promise.resolve(null),
      ]);

      if (!hqCoord) {
        console.error('[useOrderTracking] ❌ HQ geocoding failed — check COMPANY_HQ_ADDRESS.');
        isLoading.value = false;
        return;
      }

      if (!destCoord) {
        console.error('[useOrderTracking] ❌ Destination geocoding failed — map will not initialise.', { destCoord });
        isLoading.value = false;
        return;
      }

      // Courier always starts at HQ
      const originCoord = hqCoord;

      isLoading.value = false;

      // 6. Initialise map after DOM has rendered (v-if="!isLoading" needs a tick)
      await new Promise(r => setTimeout(r, 100));

      _map = new mapboxgl.Map({
        container: mapEl.value,
        style:     mapStyle,
        center:    originCoord,
        zoom:      14,
        attributionControl: false,
      });
      _map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

      _map.on('load', () => {
        // Courier marker — always starts at HQ
        _courierMarker = new mapboxgl.Marker({ element: createCourierEl(), anchor: 'center' })
          .setLngLat(originCoord)
          .addTo(_map);

        // HQ / company origin marker (always shown)
        new mapboxgl.Marker({ element: _defaultCompanyEl(), anchor: 'bottom' })
          .setLngLat(hqCoord)
          .addTo(_map);

        // Pickup marker (business only — the collection point)
        if (clientType === 'business' && pickupCoord) {
          new mapboxgl.Marker({ element: createPickupEl(), anchor: 'bottom' })
            .setLngLat(pickupCoord)
            .addTo(_map);
        }

        // Destination marker
        new mapboxgl.Marker({ element: createDestinationEl(), anchor: 'bottom' })
          .setLngLat(destCoord)
          .addTo(_map);

        // Fit camera to show HQ + destination (and pickup if business)
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(hqCoord);
        if (clientType === 'business' && pickupCoord) bounds.extend(pickupCoord);
        bounds.extend(destCoord);
        _map.fitBounds(bounds, { padding: 60 });

        // Connect socket (joins room) but DO NOT start simulation yet
        _connectSocket({ orderId: order.documentId, hqCoord, pickupCoord, destCoord, clientType });

        // Signal that the map is ready and the UI can show the start button
        simulationReady.value = true;
      });

    } catch (err) {
      console.error('[useOrderTracking] Unexpected error:', err);
      isLoading.value = false;
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Cleanup
  // ────────────────────────────────────────────────────────────────────
  function destroy() {
    if (_rafHandle) { cancelAnimationFrame(_rafHandle); _rafHandle = null; }
    if (_socket)    { _socket.disconnect();              _socket    = null; }
    if (_map)       { _map.remove();                     _map       = null; }
  }

  // Map controls (exposed for the UI layer)
  const zoomIn   = () => _map?.zoomIn();
  const zoomOut  = () => _map?.zoomOut();
  const locateMe = () => {
    if (!navigator.geolocation || !_map) return;
    navigator.geolocation.getCurrentPosition(
      pos => _map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 }),
      err => console.warn('[useOrderTracking] geolocation error:', err)
    );
  };

  return {
    // State
    isLoading,
    simulationReady,
    simulationStarted,
    progressPercentage,
    remainingDuration,
    totalDuration,
    timeMinutes,
    orderMeta,
    // Methods
    init,
    destroy,
    startSimulation,
    zoomIn,
    zoomOut,
    locateMe,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Default marker factories — override via options.createCourierEl etc.
// ────────────────────────────────────────────────────────────────────────────

function _defaultCompanyEl() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:48px;height:48px;background:#103841;border:2px solid white;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);margin-bottom:6px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div style="background:#103841;color:white;font-family:'Public Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:3px 10px;border-radius:9999px;white-space:nowrap;">SEDE</div>
    </div>`;
  return el;
}

function _defaultCourierEl() {
  const el = document.createElement('div');
  el.className = 'smooth-marker';
  el.innerHTML = `
    <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(253,94,58,0.25);animation:pulse 2s infinite;"></div>
      <div style="position:relative;width:44px;height:44px;background:var(--primary-color,#FD5E3A);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(253,94,58,0.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" class="bi bi-truck" viewBox="0 0 16 16">
          <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
        </svg>
      </div>
    </div>`;
  return el;
}

function _defaultPickupEl() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:48px;height:48px;background:white;border:2px solid var(--primary-color,#FD5E3A);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.12);margin-bottom:6px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color,#FD5E3A)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div style="background:var(--primary-color,#FD5E3A);color:white;font-family:'Public Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:3px 10px;border-radius:9999px;white-space:nowrap;">RECOLHA</div>
    </div>`;
  return el;
}

function _defaultDestinationEl() {
  const el = document.createElement('div');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:48px;height:48px;background:white;border:2px solid var(--dark-text,#1a1a2e);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.12);margin-bottom:6px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--dark-text,#1a1a2e)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="background:var(--dark-text,#1a1a2e);color:white;font-family:'Public Sans',sans-serif;font-size:9px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;padding:3px 10px;border-radius:9999px;white-space:nowrap;">DESTINO</div>
    </div>`;
  return el;
}
