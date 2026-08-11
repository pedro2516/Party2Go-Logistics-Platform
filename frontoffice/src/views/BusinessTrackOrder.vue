<template>
  <div class="bto-container">
    <!-- Business Header -->
    <BusinessHeader />

    <!-- Map Section -->
    <div class="to-map-section">
      <div class="to-map-outer">
        <div class="to-map-wrapper" v-if="!isLoading">
          <!-- Mapbox Map -->
          <div ref="mapEl" class="to-map"></div>

          <!-- Left Panel: Status Card + Time Banner -->
          <div
            class="to-left-panel"
            :class="{ 'to-left-panel--hidden': !panelOpen }"
          >
            <!-- Order Status Card -->
            <div class="to-status-card">
              <div class="to-card-top-row">
                <div class="to-card-title-block">
                  <p class="to-estado-label">ENTREGA CORPORATIVA</p>
                  <h2 class="to-order-id">Pedido #{{ orderIdLabel }}</h2>
                </div>
                <div class="to-card-top-actions">
                  <button
                    class="to-collapse-btn"
                    @click="panelOpen = false"
                    title="Ocultar painel"
                    v-if="panelOpen"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="to-product-row">

                <div class="to-product-info">
                  <p class="to-product-name">{{ productName }}</p>
                  <p class="to-product-recipient">Destinatário: {{ recipientName }}</p>
                </div>
              </div>

              <!-- Progress Stepper (Read-only) -->
              <div class="to-stepper">
                <div class="to-track-wrap">
                  <div class="to-track-bg"></div>
                  <div class="to-track-fill" :style="{ width: trackFillWidth }"></div>
                  <div class="to-dots-row">
                    <button
                      v-for="(step, i) in steps"
                      :key="step.key"
                      class="to-dot-btn"
                      :title="step.label"
                      disabled
                    >
                      <span
                        class="to-dot"
                        :class="{
                          'to-dot-done':    i < currentStep,
                          'to-dot-active':  i === currentStep,
                          'to-dot-pending': i > currentStep,
                        }"
                      ></span>
                    </button>
                  </div>
                </div>
                <div class="to-step-labels">
                  <div
                    v-for="(step, i) in steps"
                    :key="step.key"
                    class="to-step-lbl"
                    :class="{
                      'to-lbl-done':    i < currentStep,
                      'to-lbl-active':  i === currentStep,
                      'to-lbl-pending': i > currentStep,
                    }"
                  >
                    {{ step.label }}
                  </div>
                </div>
              </div>
            </div>


          </div>
          <!-- /.to-left-panel -->

          <!-- FAB to re-open panel -->
          <button
            v-show="!panelOpen"
            class="to-panel-fab"
            @click="panelOpen = true"
            title="Ver detalhes da entrega"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="13" x2="13" y2="13" />
            </svg>
          </button>

          <!-- Map Controls -->
          <div class="to-map-controls">
            <button class="to-ctrl-btn" @click="locateMe" title="Localização atual">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--dark-text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </button>
            <div class="to-zoom-group">
              <button class="to-ctrl-btn to-zoom-btn to-zoom-top" @click="zoomIn" title="Zoom in">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--dark-text)" stroke-width="2" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button class="to-ctrl-btn to-zoom-btn" @click="zoomOut" title="Zoom out">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--dark-text)" stroke-width="2" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="to-loading-overlay">
          <div class="spinner"></div>
          <p>A obter coordenadas reais da entrega corporativa...</p>
        </div>
      </div>
    </div>

    <!-- Business Bottom Nav -->
    <BusinessBottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import BusinessHeader from '@/components/business/BusinessHeader.vue'
import BusinessBottomNav from '@/components/business/BusinessBottomNav.vue'
import { useRoute } from 'vue-router'
import { useOrderTracking } from '@shared/composables/useOrderTracking'

const route = useRoute()

// ── Map container ref ──────────────────────────────────────────────────────
const mapEl = ref(null)

// ── Panel visibility (UI-only state) ──────────────────────────────────────
const panelOpen = ref(true)

// ── Stepper state — business always has 4 steps ───────────────────────────
const steps = computed(() => [
  { key: 'aceite',     label: 'Atribuído'  },
  { key: 'em_recolha', label: 'Em Recolha' },
  { key: 'transito',   label: 'Em Trânsito'  },
  { key: 'arrived',    label: 'No Destino'   },
])
const currentStep = ref(0)

// ── Composable — owns all data, socket, map, and animation logic ───────────
const tracking = useOrderTracking(mapEl, { steps, currentStep })
const { isLoading, progressPercentage, timeMinutes, orderMeta } = tracking

// ── Derived UI values ──────────────────────────────────────────────────────
const trackFillWidth = computed(() => `${progressPercentage.value}%`)
const orderIdLabel   = computed(() => orderMeta.value.order_id)
const productName    = computed(() => orderMeta.value.productName)
const recipientName  = computed(() => orderMeta.value.clientName)

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  const documentId = route.params.id
  if (!documentId) return
  await tracking.init(documentId)
})

onUnmounted(() => tracking.destroy())

// ── Map controls (delegated to composable) ────────────────────────────────
const zoomIn   = () => tracking.zoomIn()
const zoomOut  = () => tracking.zoomOut()
const locateMe = () => tracking.locateMe()
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@700;800&display=swap");

:deep(.smooth-marker) { transition: opacity 0.2s ease; }

/* ── Page shell ─────────────────────────────────────────────────────── */
.bto-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Public Sans", sans-serif;
  background: white;
}

/* ── Map section ────────────────────────────────────────────────────── */
.to-map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.to-map-outer {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Left panel ─────────────────────────────────────────────────────── */
.to-left-panel {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column-reverse;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.to-left-panel--hidden {
  transform: translateY(110%);
  opacity: 0;
  pointer-events: none;
}

/* ── Card top actions ───────────────────────────────────────────────── */
.to-card-top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.to-collapse-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid var(--bg-light, #e2e8f0);
  background: var(--bg-lightest, #f8fafc);
  color: var(--secondary-light, #64748b);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.to-collapse-btn svg { width: 16px; height: 16px; }
.to-collapse-btn:hover {
  background: var(--bg-light-orange, #fff0eb);
  color: var(--primary-color, #FD5E3A);
  border-color: var(--primary-color, #FD5E3A);
}

/* ── FAB ────────────────────────────────────────────────────────────── */
.to-panel-fab {
  position: absolute; left: 16px; bottom: 24px; z-index: 20;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--primary-color, #FD5E3A);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(253,94,58,0.35);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.to-panel-fab svg { width: 22px; height: 22px; }
.to-panel-fab:hover { background: #e94f2b; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(253,94,58,0.4); }
.to-panel-fab:active { transform: translateY(0); }

/* ── Map wrapper ────────────────────────────────────────────────────── */
.to-map-wrapper { flex: 1; position: relative; overflow: hidden; min-height: 400px; }
.to-map { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }

/* ── Status card ────────────────────────────────────────────────────── */
.to-status-card {
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 10px 10px 50px rgba(44,47,49,0.35);
  padding: 22px;
  display: flex; flex-direction: column; gap: 20px;
  border-radius: 20px 20px 0 0;
  max-height: 65dvh;
  overflow-y: auto;
}
.to-card-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.to-card-title-block { display: flex; flex-direction: column; gap: 4px; }
.to-estado-label {
  font-size: 10px; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase; color: var(--primary-color, #FD5E3A); margin: 0 0 4px 0;
}
.to-order-id {
  font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
  color: var(--dark-text, #103841); margin: 0; white-space: nowrap;
}

/* ── Product row ────────────────────────────────────────────────────── */
.to-product-row { display: flex; align-items: center; gap: 14px; }
.to-product-thumb-wrap { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.to-product-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.to-product-name { font-size: 15px; font-weight: 700; color: var(--dark-text, #103841); margin: 0 0 3px 0; }
.to-product-recipient { font-size: 13px; font-weight: 400; color: var(--secondary-light, #64748b); margin: 0; }

/* ── Stepper ────────────────────────────────────────────────────────── */
.to-stepper { display: flex; flex-direction: column; gap: 10px; }
.to-track-wrap { position: relative; height: 16px; display: flex; align-items: center; }
.to-track-bg { position: absolute; left: 0; right: 0; height: 4px; background: var(--bg-light, #e2e8f0); border-radius: 9999px; }
.to-track-fill { position: absolute; left: 0; height: 4px; background: var(--primary-color, #FD5E3A); border-radius: 9999px; }
.to-dots-row { position: relative; z-index: 2; width: 100%; display: flex; align-items: center; justify-content: space-between; }
.to-dot-btn { background: none; border: none; padding: 0; margin: 0; cursor: default; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
.to-dot { display: block; width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; transition: box-shadow 0.2s, background 0.2s; }
.to-dot-done    { background: var(--primary-color, #FD5E3A); border: 3px solid rgba(253,94,58,0.25); box-sizing: border-box; }
.to-dot-active  { background: var(--primary-color, #FD5E3A); box-shadow: 0 0 0 4px rgba(253,94,58,0.22); }
.to-dot-pending { background: var(--bg-light, #e2e8f0); }
.to-step-labels { display: flex; justify-content: space-between; }
.to-step-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; min-height: 44px; display: flex; align-items: center; text-align: center; padding: 10px 4px; flex: 1; justify-content: center; }
.to-lbl-done    { color: var(--secondary-light, #64748b); }
.to-lbl-active  { color: var(--primary-color, #FD5E3A); }
.to-lbl-pending { color: var(--secondary-light, #64748b); opacity: 0.45; }

/* ── Time banner ────────────────────────────────────────────────────── */
.to-time-banner {
  background: var(--dark-text, #103841);
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  cursor: pointer; user-select: none; transition: background 0.2s; border-radius: 0;
}
.to-time-banner:hover { background: #0c2d35; }
.to-clock-svg { width: 34px; height: 34px; flex-shrink: 0; }
.to-time-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 3px 0; }
.to-time-value { font-size: 18px; font-weight: 800; color: white; margin: 0; letter-spacing: -0.2px; }
.to-time-content { display: flex; flex-direction: column; gap: 0; }

/* ── Map controls ───────────────────────────────────────────────────── */
.to-map-controls {
  position: absolute; z-index: 10; right: 16px; bottom: 200px;
  display: flex; flex-direction: column; gap: 10px; align-items: center;
}
.to-ctrl-btn {
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border: none; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: background 0.2s, transform 0.15s; padding: 0;
}
.to-ctrl-btn svg { width: 20px; height: 20px; }
.to-ctrl-btn:hover { background: white; transform: scale(1.05); }
.to-ctrl-btn:active { transform: scale(0.97); }
.to-zoom-group {
  background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  display: flex; flex-direction: column;
}
.to-zoom-btn { width: 44px; height: 44px; background: transparent; box-shadow: none; border-radius: 0; }
.to-zoom-btn:hover { background: rgba(0,0,0,0.04); transform: none; }
.to-zoom-top { border-bottom: 1px solid rgba(0,0,0,0.08); }

/* ── Loading ────────────────────────────────────────────────────────── */
.to-loading-overlay {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: calc(100vh - 140px); width: 100%;
  gap: 16px; font-family: 'Public Sans', sans-serif;
  color: var(--dark-text, #103841); font-weight: 600;
}
.spinner {
  border: 4px solid rgba(253,94,58,0.1);
  border-left-color: var(--primary-color, #FD5E3A);
  border-radius: 50%; width: 40px; height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 0.3; } 100% { transform: scale(0.95); opacity: 0.8; } }

/* ── Responsive desktop ─────────────────────────────────────────────── */
@media (min-width: 768px) {
  .to-map-section { padding: 24px 0 32px; }
  .to-map-outer { max-width: 1440px; width: 100%; margin: 0 auto; padding: 0 24px; }
  .to-map-wrapper { height: 75vh; min-height: 650px; flex: none; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.14); }
  .to-left-panel { position: absolute; top: 24px; left: 24px; width: 360px; z-index: 10; display: flex; flex-direction: column; gap: 16px; bottom: auto; right: auto; }
  .to-status-card { border-radius: 16px; max-height: none; overflow: visible; }
  .to-time-banner { border-radius: 14px; }
  .to-left-panel--hidden { transform: translateX(calc(-100% - 48px)); opacity: 0; }
  .to-panel-fab { left: 24px; bottom: auto; top: 50%; transform: translateY(-50%); }
  .to-panel-fab:hover { transform: translateY(calc(-50% - 2px)); }
  .to-panel-fab:active { transform: translateY(-50%); }
  .to-map-controls { right: 24px; bottom: 80px; }
}
@media (min-width: 1200px) { .to-left-panel { width: 390px; } }
</style>
