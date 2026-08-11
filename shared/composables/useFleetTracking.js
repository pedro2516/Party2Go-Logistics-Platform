/**
 * shared/composables/useFleetTracking.js
 *
 * Reusable composable for the Backoffice fleet-monitoring map.
 * Unlike useOrderTracking (single order), this composable tracks
 * ALL active couriers + pending orders simultaneously.
 *
 * Handles:
 *  - Fetching all couriers + orders from Strapi
 *  - Geocoding each order's destination address → real marker positions
 *  - Placing courier markers on Mapbox GL
 *  - Real-time KPIs: kpiAtivos, kpiPendentes
 *  - Listening to global Socket.io location_update events to move markers live
 *  - refresh() to re-fetch on demand
 *  - Full cleanup via destroy()
 */

import { ref, computed } from 'vue';
import mapboxgl from 'mapbox-gl';
import { io } from 'socket.io-client';
import { strapiGet, mapCourier, mapOrder } from '@shared/utils/strapi';

// Portugal centroid — fallback when geocoding fails
const PT_CENTER = [-8.224454, 39.399872];
const PT_CONTINENTAL_BBOX = '-9.5,36.9,-6.2,42.2';
const COMPANY_HQ_ADDRESS = 'Av. da Universidade, 4800-058 Guimarães';

/**
 * @param {import('vue').Ref<HTMLElement|null>} mapEl
 * @param {object} [options]
 * @param {string} [options.mapStyle]
 * @param {string} [options.socketUrl]
 */
export function useFleetTracking(mapEl, options = {}) {
  const {
    mapStyle  = 'mapbox://styles/mapbox/streets-v12',
    socketUrl = 'http://localhost:1337',
  } = options;

  // ── Public reactive state ─────────────────────────────────────────────
  const isLoading  = ref(true);
  const error      = ref(null);
  const couriers   = ref([]);
  const orders     = ref([]);

  const kpiAtivos    = computed(() => couriers.value.filter(c => c.isActive).length);
  // Count both 'pending' (awaiting assignment) and 'assigned' (courier en-route) as pending deliveries
  const kpiPendentes = computed(() => orders.value.filter(o => o.status === 'pending' || o.status === 'assigned').length);

  // ── Internal mutable state ────────────────────────────────────────────
  let _map            = null;
  let _socket         = null;
  // Map of orderId → Mapbox Marker (for live location_update)
  const _courierMarkers = new Map();

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // ── Geocoding helper ──────────────────────────────────────────────────
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
      const res  = await fetch(url).then(r => r.json());
      const feat = res.features?.[0];
      if (feat) return feat.center;
    } catch (e) {
      console.warn('[useFleetTracking] geocode error:', e);
    }
    return null;
  }

  // ── Marker factories ──────────────────────────────────────────────────
  function _courierEl(courier) {
    const el = document.createElement('div');
    el.className = 'smooth-marker';
    el.innerHTML = `
      <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(253,94,58,0.22);animation:pulse 2s infinite;"></div>
        <div style="position:relative;width:44px;height:44px;background:#FD5E3A;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(253,94,58,0.4);" title="${courier.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" class="bi bi-truck" viewBox="0 0 16 16">
            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
          </svg>
        </div>
      </div>`;
    return el;
  }

  function _destinationEl(label) {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:40px;height:40px;background:white;border:2px solid #64748b;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.12);margin-bottom:4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="background:#64748b;color:white;font-family:'Public Sans',sans-serif;font-size:8px;font-weight:600;letter-spacing:0.4px;text-transform:uppercase;padding:2px 8px;border-radius:9999px;white-space:nowrap;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${label}</div>
      </div>`;
    return el;
  }

  // ── Load data + place markers ─────────────────────────────────────────
  async function fetchData() {
    if (!_map) return;
    error.value   = null;

    // Clear existing markers
    _courierMarkers.forEach(m => m.remove());
    _courierMarkers.clear();

    // Remove existing destination markers (non-courier)
    if (_map.getLayer && _map.getLayer('destinations')) {
      _map.removeLayer('destinations');
      _map.removeSource('destinations');
    }

    try {
      const [couriersJson, ordersJson] = await Promise.all([
        strapiGet('/api/couriers?populate=*'),
        strapiGet('/api/orders?populate=*&filters[order_status][$notIn][0]=delivered&filters[order_status][$notIn][1]=cancelled'),
      ]);

      couriers.value = (couriersJson.data ?? []).map(mapCourier);
      orders.value   = (ordersJson.data   ?? []).map(mapOrder);

      const hqCoord = await geocode(COMPANY_HQ_ADDRESS) || PT_CENTER;

      // Place active courier markers — geocode from their active order's collection_address
      // For now, distribute around HQ if no address available
      const activeCouriers = couriers.value.filter(c => c.isActive);

      for (let i = 0; i < activeCouriers.length; i++) {
        const courier = activeCouriers[i];
        // Try to find their active order for a real position
        const activeOrder = orders.value.find(
          o => o.courierId === courier.id || o.courierDocumentId === courier.documentId
        );
        let coord = null;
        if (activeOrder?.pickupAddress) {
          coord = await geocode(activeOrder.pickupAddress);
        }
        // Fallback: place exactly at HQ
        if (!coord) {
          coord = hqCoord;
        }

        const marker = new mapboxgl.Marker({ element: _courierEl(courier), anchor: 'center' })
          .setLngLat(coord)
          .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(
            `<strong style="font-family:'Public Sans',sans-serif;">${courier.name}</strong>` +
            `<br/><span style="font-size:12px;color:#64748b;">${courier.vehicleBrand || '—'} · ${courier.licencePlate || '—'}</span>`
          ))
          .addTo(_map);

        _courierMarkers.set(courier.documentId || String(i), marker);
      }

      // Place destination markers for all pending/active orders
      const destPromises = orders.value
        .filter(o => o.destinationAddress)
        .map(async o => {
          const coord = await geocode(o.destinationAddress);
          if (!coord) return;
          const label = o.order_id ? `#${o.order_id}` : 'DESTINO';
          new mapboxgl.Marker({ element: _destinationEl(label), anchor: 'bottom' })
            .setLngLat(coord)
            .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(
              `<strong style="font-family:'Public Sans',sans-serif;">${label}</strong>` +
              `<br/><span style="font-size:12px;color:#64748b;">${o.destinationAddress}</span>`
            ))
            .addTo(_map);
        });

      await Promise.allSettled(destPromises);

      // Fit map to show all active couriers (if any)
      if (activeCouriers.length > 0 && _map) {
        const bounds = new mapboxgl.LngLatBounds();
        _courierMarkers.forEach(m => bounds.extend(m.getLngLat()));
        if (!bounds.isEmpty()) {
          _map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
        }
      }

    } catch (err) {
      console.error('[useFleetTracking] fetchData error:', err);
      error.value = 'Erro ao carregar dados da frota.';
    }
  }

  // ── Socket — global fleet location updates ────────────────────────────
  function _connectSocket() {
    _socket = io(socketUrl);

    _socket.on('location_update', (data) => {
      if (!data.orderId || !data.lat || !data.lng) return;
      // Find which courier is handling this order and move their marker
      const order   = orders.value.find(o => o.documentId === data.orderId || o.order_id === data.orderId);
      if (!order) return;
      const courier = couriers.value.find(c => c.id === order.courierId || c.documentId === order.courierDocumentId);
      if (!courier) return;
      const marker  = _courierMarkers.get(courier.documentId || String(courier.id));
      if (marker) marker.setLngLat([data.lng, data.lat]);
    });
  }

  // ── Main initialisation ───────────────────────────────────────────────
  async function init() {
    await new Promise(r => setTimeout(r, 100)); // wait for DOM

    // Guard: missing Mapbox token
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      error.value = 'Token do Mapbox não configurado. Adicione VITE_MAPBOX_TOKEN ao ficheiro .env do backoffice.';
      isLoading.value = false;
      return;
    }

    _map = new mapboxgl.Map({
      container: mapEl.value,
      style:     mapStyle,
      center:    PT_CENTER,
      zoom:      7,
      attributionControl: false,
    });
    _map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    _map.on('load', async () => {
      await fetchData();
      _connectSocket();
      isLoading.value = false;
    });

    // Guard: surface any Mapbox initialization errors (e.g. invalid token)
    _map.on('error', (e) => {
      console.error('[useFleetTracking] Mapbox error:', e);
      if (isLoading.value) {
        error.value = 'Erro ao inicializar o mapa. Verifique o token Mapbox.';
        isLoading.value = false;
      }
    });
  }

  // ── Refresh ────────────────────────────────────────────────────────────
  async function refresh() {
    if (_map) {
      _map.invalidateSize?.();
      await fetchData();
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────
  function destroy() {
    if (_socket) { _socket.disconnect(); _socket = null; }
    _courierMarkers.forEach(m => m.remove());
    _courierMarkers.clear();
    if (_map) { _map.remove(); _map = null; }
  }

  // ── Map controls ──────────────────────────────────────────────────────
  const zoomIn   = () => _map?.zoomIn();
  const zoomOut  = () => _map?.zoomOut();
  const locateMe = () => {
    if (!navigator.geolocation || !_map) return;
    navigator.geolocation.getCurrentPosition(
      pos => _map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 13 }),
      err => console.warn('[useFleetTracking] geolocation error:', err)
    );
  };

  return {
    isLoading,
    error,
    kpiAtivos,
    kpiPendentes,
    couriers,
    orders,
    init,
    refresh,
    destroy,
    zoomIn,
    zoomOut,
    locateMe,
  };
}
