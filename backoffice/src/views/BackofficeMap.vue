<template>
  <div class="backoffice-map">
    <!-- Header -->
    <Header />

    <!-- Mobile Bottom Nav -->
    <BackofficeBottomNav />

    <!-- Main Content -->
    <main class="map-main">
      <div class="container-fluid" style="max-width: 1440px; margin: 0 auto; padding: 40px 24px">

        <!-- Page Title Section -->
        <div v-if="!isExpanded" class="page-title-section mb-5">
          <h1 class="page-title">Monitorização em Tempo Real</h1>
          <p class="page-subtitle">
            Acompanhe a localização das entregas e o movimento da frota no mapa.
          </p>
        </div>

        <!-- Map Container with Floating Overlays -->
        <div class="row">
          <div class="col-12">
            <div class="map-container" :class="{ 'map-container--expanded': isExpanded }" style="position: relative;">

          <!-- Loading State Overlay -->
          <div v-if="isLoading" class="state-message" style="position: absolute; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="bm-spinner"></div>
            <span style="font-family:'Public Sans',sans-serif;font-weight:600;color:#103841;margin-top:12px;">A carregar mapa...</span>
          </div>

          <!-- Error State Overlay -->
          <div v-else-if="error" class="state-message state-error" style="position: absolute; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FD5E3A" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style="font-family:'Public Sans',sans-serif;font-size:14px;color:#64748b;">{{ error }}</span>
            <button class="btn-retry" @click="tracking.refresh()">Tentar novamente</button>
          </div>

          <!-- Mapbox GL Map -->
          <div ref="mapEl" class="map-element"></div>

          <!-- Left Info Card (Top-Left) -->
          <div class="overlay-left-card">
            <div class="info-header">
              <div class="info-header-left">
                <span class="status-dot"></span>
                <span class="header-text">MONITORIZAÇÃO ATIVA</span>
              </div>
              <button
                class="info-toggle-btn"
                @click="isMonitorizacaoOpen = !isMonitorizacaoOpen"
                :title="isMonitorizacaoOpen ? 'Ocultar detalhes' : 'Ver detalhes'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: isMonitorizacaoOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s ease' }">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
            </div>
            <div class="info-collapsible" :class="{ 'info-collapsible--open': isMonitorizacaoOpen }">
              <div class="info-collapsible-inner">
                <div class="info-row">
                  <span class="label">Veículos Ativos</span>
                  <span class="value active-vehicles">{{ kpiAtivos }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Entregas Pendentes</span>
                  <span class="value pending-deliveries">{{ kpiPendentes }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Refresh Button (Top-Right) -->
          <button
            class="bm-ctrl-btn"
            style="position: absolute; top: 24px; right: 24px; z-index: 400;"
            @click="refreshMap"
            title="Atualizar mapa"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>

          <!-- Expand / Collapse Button (Below Refresh) -->
          <button
            class="bm-ctrl-btn"
            style="position: absolute; top: 76px; right: 24px; z-index: 400;"
            @click="toggleExpand"
            :title="isExpanded ? 'Minimizar mapa' : 'Expandir mapa'"
          >
            <svg v-if="!isExpanded" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/>
            </svg>
          </button>

          <!-- Custom Map Controls (zoom + locate) -->
          <div class="bm-map-controls">
            <button class="bm-ctrl-btn" @click="locateMe" title="Localização atual">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/>
              </svg>
            </button>
            <div class="bm-zoom-group">
              <button class="bm-ctrl-btn bm-zoom-btn bm-zoom-top" @click="zoomIn" title="Zoom in">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="bm-ctrl-btn bm-zoom-btn" @click="zoomOut" title="Zoom out">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
        </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import "mapbox-gl/dist/mapbox-gl.css";
import Header from "@/components/Header.vue";
import BackofficeBottomNav from "@/components/BackofficeBottomNav.vue";
import { useFleetTracking } from "@shared/composables/useFleetTracking";

const mapEl = ref(null);
const isMonitorizacaoOpen = ref(true);
const isExpanded = ref(false);

// ── Fleet composable — owns all map/socket/data logic ─────────────────────
const tracking = useFleetTracking(mapEl);
const { isLoading, error, kpiAtivos, kpiPendentes } = tracking;

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => tracking.init());
onUnmounted(() => {
  document.body.classList.remove("no-scroll");
  document.documentElement.classList.remove("no-scroll");
  tracking.destroy();
});

// ── Expanded mode — lock scroll ────────────────────────────────────────────
watch(isExpanded, (val) => {
  document.body.classList.toggle("no-scroll", val);
  document.documentElement.classList.toggle("no-scroll", val);
});

// ── Controls delegated to composable ──────────────────────────────────────
function refreshMap() { tracking.refresh(); }
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
const zoomIn   = () => tracking.zoomIn();
const zoomOut  = () => tracking.zoomOut();
const locateMe = () => tracking.locateMe();
</script>

<style scoped>
/* Main Content */
.map-main {
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

/* Page Title Section */
.page-title-section { text-align: left; }
.page-title {
  font-size: 40px; font-weight: 800; color: #103841;
  margin: 0 0 12px 0; font-family: "Public Sans", sans-serif; line-height: 52px;
}
.page-subtitle {
  font-size: 16px; font-weight: 500; color: #64748b; margin: 0;
  font-family: "Public Sans", sans-serif; line-height: 24px;
}

/* Map Container */
.map-container {
  position: relative; width: 100%; min-height: 700px;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); background-color: #e8e8e8;
}
.map-element { width: 100%; height: 100%; min-height: 700px; }

/* Floating Overlays */
.overlay-left-card {
  position: absolute; top: 24px; left: 24px;
  background-color: white; border-radius: 12px; padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12); border: 1px solid #e0e7ff;
  z-index: 400; font-family: "Public Sans", sans-serif; width: 280px;
}
.info-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.info-header-left { display: flex; align-items: center; gap: 8px; }
.info-toggle-btn {
  background: none; border: none; cursor: pointer; color: #64748b;
  padding: 4px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; transition: color 0.2s, background 0.2s;
}
.info-toggle-btn:hover { color: #103841; background: #f1f5f9; }
.info-collapsible {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease, margin-top 0.25s ease, padding-top 0.25s ease, border-top-color 0.25s ease;
  overflow: hidden; margin-top: 0; padding-top: 0; border-top: 1px solid transparent;
}
.info-collapsible-inner { min-height: 0; overflow: hidden; }
.info-collapsible--open { grid-template-rows: 1fr; margin-top: 12px; padding-top: 12px; border-top-color: #e0e7ff; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; background-color: #22c55e; flex-shrink: 0; }
.header-text { font-size: 12px; font-weight: 700; color: #103841; text-transform: uppercase; letter-spacing: 0.3px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 13px; }
.info-row .label { color: #64748b; font-weight: 500; }
.info-row .value { font-weight: 700; color: #103841; }
.pending-deliveries { color: #fd5e3a; }
.active-vehicles { color: #22c55e; }

/* Custom Map Controls */
.bm-map-controls {
  position: absolute; z-index: 400; right: 24px; bottom: 24px;
  display: flex; flex-direction: column; gap: 8px; align-items: center;
}
.bm-ctrl-btn {
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: background 0.2s, transform 0.15s; padding: 0;
}
.bm-ctrl-btn:hover { background: #fff; transform: scale(1.05); }
.bm-ctrl-btn:active { transform: scale(0.97); }
.bm-zoom-group {
  background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  display: flex; flex-direction: column;
}
.bm-zoom-btn { width: 44px; height: 44px; background: transparent; box-shadow: none; border-radius: 0; }
.bm-zoom-btn:hover { background: rgba(0,0,0,0.04); transform: none; }
.bm-zoom-top { border-bottom: 1px solid rgba(0,0,0,0.08); }

/* Spinner */
.bm-spinner {
  border: 4px solid rgba(16,56,65,0.1);
  border-left-color: #103841;
  border-radius: 50%; width: 40px; height: 40px;
  animation: bm-spin 1s linear infinite;
}
@keyframes bm-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Retry button */
.btn-retry {
  padding: 10px 24px; background: #fd5e3a; color: white;
  border: none; border-radius: 8px; font-family: "Public Sans", sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s;
}
.btn-retry:hover { background: #e94f2b; }

/* Pulse animation (for courier markers injected by composable) */
@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .page-title { font-size: 28px; line-height: 36px; }
  .page-subtitle { font-size: 14px; }
  .map-container { min-height: 500px; }
  .map-element { min-height: 500px; }
  .overlay-left-card { top: 16px; left: 16px; width: 240px; padding: 12px; }
}

/* Expanded (full-screen) */
.map-container--expanded {
  position: fixed !important; inset: 0 !important;
  width: 100vw !important; height: 100vh !important;
  border-radius: 0 !important; z-index: 9999 !important; box-shadow: none !important;
}
.map-container--expanded .map-element { height: 100vh !important; min-height: 100vh !important; }
</style>

<style>
/* Global — must stay unscoped for body class manipulation */
body.no-scroll, html.no-scroll {
  overflow: hidden !important; width: 100vw !important; height: 100vh !important;
  scrollbar-gutter: auto !important;
}
body.no-scroll::-webkit-scrollbar, html.no-scroll::-webkit-scrollbar { display: none !important; }
body.no-scroll, html.no-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
</style>
