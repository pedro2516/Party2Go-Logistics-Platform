<template>
  <div class="dm-page">
    <div class="dm-map-section">
      <div class="dm-map-outer">
        <div class="dm-map-wrapper" style="position: relative;">

          <!-- No Order State (checked first — no route param means no need to load) -->
          <div v-if="!hasOrder" class="dm-loading">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <p style="font-family:'Public Sans',sans-serif;font-weight:600;color:#64748b;margin-top:12px;">Nenhuma entrega ativa atribuída.</p>
          </div>

          <!-- Loading Overlay (only when an order ID exists but map isn't ready yet) -->
          <div v-else-if="isLoading" class="dm-loading">
            <div class="dm-spinner"></div>
            <p>A carregar entrega...</p>
          </div>

          <!-- Mapbox Map -->
          <div ref="mapEl" class="dm-map" v-if="!isLoading && hasOrder"></div>

          <!-- Left Panel: Status Card + Time Banner -->
          <div
            v-show="!isLoading && hasOrder"
            class="dm-left-panel"
            :class="{ 'dm-left-panel--hidden': !panelOpen }"
          >
            <div class="dm-status-card">
              <div class="dm-card-top-row">
                <div class="dm-card-title-block">
                  <p class="dm-estado-label">ESTADO</p>
                  <h2 class="dm-order-id">Pedido #{{ orderIdLabel }}</h2>
                </div>
                <div class="dm-card-top-actions">
                  <span class="dm-em-rota-badge">{{ statusBadgeLabel }}</span>
                  <button class="dm-collapse-btn" @click="panelOpen = false" title="Ocultar painel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                </div>
              </div>

              <div class="dm-product-row">
                <div class="dm-product-info">
                  <p class="dm-product-name">{{ productName }}</p>
                  <p class="dm-product-recipient">Destinatário: {{ recipientName }}</p>
                </div>
              </div>

              <!-- Progress Stepper -->
              <div class="dm-stepper">
                <div class="dm-track-wrap">
                  <div class="dm-track-bg"></div>
                  <div class="dm-track-fill" :style="{ width: trackFillWidth }"></div>
                  <div class="dm-dots-row">
                    <button
                      v-for="(step, i) in steps"
                      :key="step.key"
                      class="dm-dot-btn"
                      :title="step.label"
                      @click="setStep(i)"
                    >
                      <span class="dm-dot" :class="{
                        'dm-dot-done':    i < currentStep,
                        'dm-dot-active':  i === currentStep,
                        'dm-dot-pending': i > currentStep,
                      }"></span>
                    </button>
                  </div>
                </div>
                <div class="dm-step-labels">
                  <button
                    v-for="(step, i) in steps"
                    :key="step.key"
                    class="dm-step-lbl-btn"
                    :class="{
                      'dm-lbl-done':    i < currentStep,
                      'dm-lbl-active':  i === currentStep,
                      'dm-lbl-pending': i > currentStep,
                    }"
                    @click="setStep(i)"
                  >{{ step.label }}</button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="dm-action-btns">
                <button class="dm-btn-outline" @click="$router.push('/chat')">CONTACTAR CLIENTE</button>
                <button class="dm-btn-solid" @click="goToDeliveryDetails">CONCLUIR ENTREGA</button>
              </div>

              <!-- ATUALIZAR button: shown when courier has changed step but not yet saved -->
              <Transition name="dm-update">
                <button
                  v-if="currentStep !== dbStep"
                  class="dm-btn-update"
                  :disabled="updatingStatus"
                  @click="updateStatus"
                >
                  <svg v-if="updatingStatus" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  {{ updatingStatus ? 'A ATUALIZAR...' : 'ATUALIZAR ESTADO' }}
                </button>
              </Transition>
            </div>

          </div>

          <!-- FAB to re-open panel -->
          <button v-show="!isLoading && hasOrder && !panelOpen" class="dm-panel-fab" @click="panelOpen = true" title="Ver detalhes">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>
          </button>

          <!-- Top Right Controls -->
          <div class="dm-top-controls" v-show="!isLoading && hasOrder">
            <button class="dm-ctrl-btn" @click="refreshMap" title="Atualizar mapa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>

          <!-- INICIAR TRAJETO overlay button -->
          <Transition name="dm-start">
            <div
              v-if="simulationReady && !simulationStarted"
              class="dm-start-overlay"
            >
              <button class="dm-btn-start" @click="handleStartSimulation">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                INICIAR TRAJETO
              </button>
            </div>
          </Transition>

          <!-- Bottom Right Controls -->
          <div class="dm-bottom-controls" v-show="!isLoading && hasOrder">
            <button class="dm-ctrl-btn" @click="locateMe" title="Localização atual">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg>
            </button>
            <div class="dm-zoom-group">
              <button class="dm-ctrl-btn dm-zoom-btn dm-zoom-top" @click="zoomIn" title="Zoom in">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button class="dm-ctrl-btn dm-zoom-btn" @click="zoomOut" title="Zoom out">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#103841" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useRoute, useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { useOrderTracking } from '@shared/composables/useOrderTracking'
import { useCourierStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { strapiGet, strapiPut } from '@shared/utils/strapi'

const route  = useRoute()
const router = useRouter()
const courierStore = useCourierStore()
const { courierProfile } = storeToRefs(courierStore)

// ── Map container ref ──────────────────────────────────────────────────────
const mapEl = ref(null)

// ── Panel & time editor (UI-only) ──────────────────────────────────────────
const panelOpen   = ref(true)

// ── Courier-specific stepper (courier can advance steps) ──────────────────
const steps = computed(() => [
  { key: 'aceite',     label: 'Atribuído'  },
  { key: 'em_recolha', label: 'Em Recolha' },
  { key: 'transito',   label: 'Em Trânsito' },
  { key: 'arrived',    label: 'No Destino' },
])
const currentStep = ref(0)

// ── Composable — owns all data, socket, map, and animation logic ───────────
const tracking = useOrderTracking(mapEl, { steps, currentStep })
const { isLoading, progressPercentage, timeMinutes, orderMeta, simulationReady, simulationStarted } = tracking

// ── Derived UI ─────────────────────────────────────────────────────────────
const activeOrderId = ref(route.params.id || null)
const hasOrder   = computed(() => !!activeOrderId.value)

const trackFillWidth   = computed(() => {
  if (steps.value.length <= 1) return '0%';
  return `${(currentStep.value / (steps.value.length - 1)) * 100}%`;
})
const statusBadgeLabel = computed(() => steps.value[currentStep.value]?.label.toUpperCase() ?? '')
const orderIdLabel     = computed(() => orderMeta.value.order_id)
const productName      = computed(() => orderMeta.value.productName)
const recipientName    = computed(() => orderMeta.value.clientName)

// ── Status update (ATUALIZAR button) ─────────────────────────────────────────
const dbStep        = ref(0)  // last saved step index (mirrors DB)
const updatingStatus = ref(false)

// Map step index → Strapi order_status key
const STEP_TO_STATUS = ['assigned', 'collecting', 'in_traffic', 'arrived']

async function updateStatus() {
  const docId = orderMeta.value?.documentId
  if (!docId || updatingStatus.value) return
  updatingStatus.value = true
  const newStatus = STEP_TO_STATUS[currentStep.value] || 'assigned'
  try {
    await strapiPut(`/api/orders/${docId}`, { order_status: newStatus })
    dbStep.value = currentStep.value
    // Also emit to socket so the client tracking page updates
    if (_socket && activeOrderId.value) {
      const stepKey = steps.value[currentStep.value]?.key
      _socket.emit('status_transition', {
        orderId:        activeOrderId.value,
        status:         stepKey,
        messageContent: `Pedido #${orderIdLabel.value} — ${steps.value[currentStep.value]?.label}`,
      })
    }
  } catch (err) {
    console.error('[DeliveryMap] updateStatus error:', err)
    alert('Erro ao atualizar estado. Tente novamente.')
  } finally {
    updatingStatus.value = false
  }
}



// ── Courier step advance — emits status_transition to backend ──────────────
let _socket = null

function setStep(i) {
  if (i < 0 || i >= steps.value.length) return
  currentStep.value = i
  // Note: socket emission happens via updateStatus() button, not automatically
}

// ── Start simulation (INICIAR TRAJETO button) ──────────────────────────────
function handleStartSimulation() {
  tracking.startSimulation()
  // Advance step to 'em_recolha' automatically when starting
  if (currentStep.value === 0) {
    currentStep.value = 1
  }
}

// Automatically advance to 'No Destino' when simulation finishes
watch(progressPercentage, (newVal) => {
  if (newVal >= 100 && currentStep.value < 3) {
    currentStep.value = 3
  }
})

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!activeOrderId.value && courierProfile.value?.documentId) {
    try {
      const url = `/api/orders?filters[courier_id][documentId][$eq]=${courierProfile.value.documentId}&filters[order_status][$notIn][0]=delivered&filters[order_status][$notIn][1]=cancelled&populate=*`
      const json = await strapiGet(url)
      if (json.data && json.data.length > 0) {
        const sorted = [...json.data].sort((a, b) => {
          const pA = a.priority ?? 1;
          const pB = b.priority ?? 1;
          if (pB !== pA) return pB - pA;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        activeOrderId.value = sorted[0].documentId
        router.replace({ params: { id: activeOrderId.value } }).catch(() => {})
      }
    } catch (err) {
      console.error('Failed to fetch active order', err)
    }
  }

  if (!activeOrderId.value) {
    // No assigned order — ensure loading state is cleared so the empty-state renders
    tracking.isLoading.value = false
    return
  }
  
  await tracking.init(activeOrderId.value)
  // Initialise dbStep from currentStep once loading completes
  dbStep.value = currentStep.value
  // Separate socket just for emitting courier-side events
  _socket = io('http://localhost:1337')
})

onUnmounted(() => {
  if (_socket) { _socket.disconnect(); _socket = null }
  tracking.destroy()
})

// ── Map controls ───────────────────────────────────────────────────────────
function goToDeliveryDetails() {
  const docId = tracking.orderMeta.value?.documentId
  if (docId) {
    router.push({ path: '/deliveries', query: { orderId: docId } })
  }
}

function refreshMap() { /* map handles its own state via composable */ }
const zoomIn   = () => tracking.zoomIn()
const zoomOut  = () => tracking.zoomOut()
const locateMe = () => tracking.locateMe()
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap");

:deep(.smooth-marker) { transition: opacity 0.2s ease; }

.dm-page { width: 100%; flex: 1; display: flex; flex-direction: column; font-family: "Public Sans", sans-serif; background: #fff; overflow: hidden; }
.dm-map-section { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.dm-map-outer { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.dm-map-wrapper { flex: 1; position: relative; overflow: hidden; height: 100%; }
.dm-map { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }

/* Loading */
.dm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; min-height: 400px; gap: 0; }
.dm-spinner { border: 4px solid rgba(253,94,58,0.1); border-left-color: var(--primary-color); border-radius: 50%; width: 40px; height: 40px; animation: dm-spin 1s linear infinite; }
@keyframes dm-spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 0.3; } }

/* Left panel */
.dm-left-panel { position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; display: flex; flex-direction: column-reverse; transition: transform 0.3s ease, opacity 0.3s ease; }
.dm-left-panel--hidden { transform: translateY(110%); opacity: 0; pointer-events: none; }

/* Card */
.dm-status-card { background: rgba(255,255,255,0.94); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 10px 10px 50px rgba(44,47,49,0.35); padding: 20px; display: flex; flex-direction: column; gap: 18px; border-radius: 20px 20px 0 0; max-height: 55dvh; overflow-y: auto; overflow-x: hidden; }
.dm-card-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; width: 100%; }
.dm-card-title-block { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.dm-estado-label { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--dark-text); margin: 0 0 2px 0; }
.dm-order-id { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: var(--dark-text); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.dm-card-top-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.dm-em-rota-badge { background: var(--primary-color); color: white; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; white-space: nowrap; flex-shrink: 0; }
.dm-collapse-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--bg-light); background: var(--bg-lightest); color: var(--secondary-light); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; flex-shrink: 0; transition: background 0.2s, color 0.2s; }
.dm-collapse-btn svg { width: 16px; height: 16px; }
.dm-collapse-btn:hover { background: var(--bg-light-orange); color: var(--primary-color); border-color: var(--primary-color); }

/* Product row */
.dm-product-row { display: flex; align-items: center; gap: 14px; }
.dm-product-thumb-wrap { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: var(--bg-lightest); }
.dm-product-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.dm-product-name { font-size: 15px; font-weight: 700; color: var(--dark-text); margin: 0 0 3px 0; }
.dm-product-recipient { font-size: 13px; color: var(--secondary-light); margin: 0; }

/* Stepper */
.dm-stepper { display: flex; flex-direction: column; gap: 10px; }
.dm-track-wrap { position: relative; height: 16px; display: flex; align-items: center; }
.dm-track-bg { position: absolute; left: 0; right: 0; height: 4px; background: var(--bg-light); border-radius: 9999px; }
.dm-track-fill { position: absolute; left: 0; height: 4px; background: var(--primary-color); border-radius: 9999px; transition: width 0.5s ease-in-out; }
.dm-dots-row { position: relative; z-index: 2; width: 100%; display: flex; align-items: center; justify-content: space-between; }
.dm-dot-btn { background: none; border: none; padding: 0; margin: 0; cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
.dm-dot { display: block; width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; transition: box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease; }
.dm-dot-done    { background: var(--primary-color); border: 3px solid rgba(253,94,58,0.25); box-sizing: border-box; }
.dm-dot-active  { background: var(--primary-color); box-shadow: 0 0 0 4px rgba(253,94,58,0.22); }
.dm-dot-pending { background: var(--bg-light); }
.dm-step-labels { display: flex; justify-content: space-between; }
.dm-step-lbl-btn { background: none; border: none; font-family: "Public Sans", sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; min-height: 44px; display: flex; align-items: center; text-align: center; padding: 10px 4px; flex: 1; justify-content: center; cursor: pointer; }
.dm-lbl-done    { color: var(--secondary-light); }
.dm-lbl-active  { color: var(--primary-color); }
.dm-lbl-pending { color: var(--secondary-light); opacity: 0.45; }

/* Action buttons */
.dm-action-btns { display: flex; gap: 10px; }
.dm-btn-outline { flex: 1; padding: 12px; background: transparent; border: 1.5px solid var(--primary-color); color: var(--primary-color); font-family: "Public Sans", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.dm-btn-outline:hover { background: rgba(253,94,58,0.06); }
.dm-btn-solid { flex: 1; padding: 12px; background: var(--primary-color); border: none; color: white; font-family: "Public Sans", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.dm-btn-solid:hover { background: var(--primary-dark); }

/* ATUALIZAR ESTADO button */
.dm-btn-update {
  width: 100%;
  padding: 13px 16px;
  background: #103841;
  border: none;
  color: white;
  font-family: "Public Sans", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s, transform 0.15s;
}
.dm-btn-update:hover { background: #1a5264; transform: translateY(-1px); }
.dm-btn-update:active { transform: translateY(0); }
.dm-btn-update:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.dm-update-enter-active, .dm-update-leave-active { transition: all 0.25s ease; }
.dm-update-enter-from, .dm-update-leave-to { opacity: 0; transform: translateY(6px); }

/* INICIAR TRAJETO overlay */
.dm-start-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background: linear-gradient(to top, rgba(16,56,65,0.85) 0%, transparent 100%);
  pointer-events: auto;
}
.dm-btn-start {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: var(--primary-color, #FD5E3A);
  border: none;
  color: white;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(253,94,58,0.45);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.dm-btn-start:hover { background: var(--primary-dark, #e04a28); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(253,94,58,0.5); }
.dm-btn-start:active { transform: translateY(0); }
.dm-start-enter-active, .dm-start-leave-active { transition: all 0.35s ease; }
.dm-start-enter-from, .dm-start-leave-to { opacity: 0; transform: translateY(20px); }

/* Time banner */
.dm-time-banner { background: var(--dark-text); display: flex; align-items: center; gap: 14px; padding: 16px 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); cursor: pointer; user-select: none; border-radius: 0; transition: background 0.2s; }
.dm-time-banner:hover { background: var(--primary-dark); }
.dm-time-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.dm-time-label { font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0; }
.dm-time-value { font-size: 16px; font-weight: 800; color: white; margin: 0; }
.dm-time-editor { display: flex; gap: 6px; }
.dm-time-adj { width: 36px; height: 36px; background: rgba(255,255,255,0.15); border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dm-time-adj:hover { background: rgba(255,255,255,0.25); }
.dm-banner-enter-active, .dm-banner-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.dm-banner-enter-from, .dm-banner-leave-to { transform: translateY(100%); opacity: 0; }

/* FAB */
.dm-panel-fab { position: absolute; left: 16px; bottom: 24px; z-index: 20; width: 52px; height: 52px; border-radius: 50%; background: var(--primary-color); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(253,94,58,0.35); transition: background 0.2s, transform 0.2s; }
.dm-panel-fab svg { width: 22px; height: 22px; }
.dm-panel-fab:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(253, 94, 58, 0.4); }
.dm-panel-fab:active { transform: translateY(0); }

/* Controls */
.dm-top-controls { position: absolute; top: 16px; right: 16px; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
.dm-bottom-controls { position: absolute; right: 16px; bottom: 200px; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
.dm-ctrl-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: background 0.2s, transform 0.15s; padding: 0; }
.dm-ctrl-btn svg { stroke: var(--dark-text); }
.dm-ctrl-btn:hover { background: white; transform: scale(1.05); }
.dm-ctrl-btn:active { transform: scale(0.97); }
.dm-zoom-group { background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.12); display: flex; flex-direction: column; }
.dm-zoom-btn { width: 44px; height: 44px; background: transparent; box-shadow: none; border-radius: 0; }
.dm-zoom-btn:hover { background: rgba(0,0,0,0.04); transform: none; }
.dm-zoom-top { border-bottom: 1px solid rgba(0,0,0,0.08); }

/* ==================================================
   RESPONSIVE — TABLET & DESKTOP (768px+)
   ================================================== */
@media (min-width: 768px) {
  .dm-map-section {
    padding: 24px 0 32px;
    background: transparent;
  }

  .dm-map-outer {
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    padding: 0 24px;
  }

  .dm-map-wrapper {
    height: 75vh;
    min-height: 650px;
    flex: none;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.14);
  }

  .dm-left-panel {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 380px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 16px;
    bottom: auto;
    right: auto;
  }

  .dm-status-card {
    border-radius: 16px;
    max-height: none;
    overflow: visible;
  }

  .dm-time-banner {
    border-radius: 14px;
  }

  .dm-left-panel--hidden {
    transform: translateX(calc(-100% - 48px));
    opacity: 0;
  }

  .dm-panel-fab {
    left: 24px;
    bottom: auto;
    top: 50%;
    transform: translateY(-50%);
  }

  .dm-panel-fab:hover {
    transform: translateY(calc(-50% - 2px));
  }

  .dm-panel-fab:active {
    transform: translateY(-50%);
  }

  .dm-bottom-controls {
    right: 24px;
    bottom: 80px;
  }
}

@media (min-width: 1200px) {
  .dm-left-panel {
    width: 420px;
  }
}
</style>
