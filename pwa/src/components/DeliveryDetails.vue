<template>
  <div>
    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <i class="bi bi-check-circle-fill" style="font-size: 18px; flex-shrink: 0;"></i>
        <span>Entrega confirmada com sucesso!</span>
      </div>
    </transition>

    <!-- DESKTOP (hidden on mobile) -->
    <div class="show-desktop">
      <div class="dd">
        <!-- Back Button -->
        <div class="dd-back-btn-wrapper">
          <button class="dd-back-btn" @click="$emit('go-back')">
            <i class="bi bi-arrow-left"></i>
            Voltar
          </button>
        </div>

        <main class="dd-main">
          <div class="dd-body">

            <div v-if="loading" style="text-align: center; padding: 4rem;">
              <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #ff6b35;"></i>
              <p>A carregar pedido...</p>
            </div>
            
            <template v-else-if="orderData">
              <div class="dd-order-hdr">
                <h1 class="dd-order-title">Entrega {{ orderData.order_id ? '#' + orderData.order_id : '#' + orderData.id }}</h1>
                <p class="dd-order-status">{{ statusLabel(orderData.order_status) }}</p>
              </div>



            <div class="dd-tl">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <p class="dd-tl-head" style="margin-bottom: 0;">ESTADO DA ENTREGA</p>
              </div>
              <div class="dd-tl-row">
                <div class="dd-tl-bg-line"></div>
                <div class="dd-tl-orange-line" :style="{ right: desktopLineRight }"></div>
                <div
                  v-for="(step, index) in steps"
                  :key="step"
                  class="dd-step"
                  style="cursor: pointer;"
                  @click="selectStatus(index)"
                >
                  <div
                    :class="[
                      'dd-circ',
                      index < selectedStepIndex ? 'dd-circ-done' :
                      index === selectedStepIndex ? 'dd-circ-active' :
                      'dd-circ-pending'
                    ]"
                  >
                    <template v-if="index < selectedStepIndex">
                      <i class="bi bi-check" style="color: white; font-size: 12px;"></i>
                    </template>
                    <template v-else-if="index === selectedStepIndex">
                      <div class="dd-active-overlay"></div>
                      <div class="dd-active-dot"></div>
                    </template>
                  </div>
                  <span
                    :class="[
                      'dd-step-lbl',
                      index === selectedStepIndex ? 'dd-step-lbl-active' :
                      index > selectedStepIndex ? 'dd-step-lbl-pending' : ''
                    ]"
                  >{{ step }}</span>
                </div>
              </div>
            </div>

            <div class="dd-grid">
              <div class="dd-card">
                <p class="dd-card-head">DESTINATÁRIO</p>
                <div class="dd-recip">
                  <p class="dd-recip-name">{{ orderData.client_id?.first_name || 'Cliente' }} {{ orderData.client_id?.last_name || '' }}</p>
                  <p class="dd-recip-addr">{{ orderData.address || 'Morada não definida' }}<br>Data: {{ orderData.date_delivery ? new Date(orderData.date_delivery).toLocaleDateString() : '—' }}</p>
                  <div v-if="orderData.intructions" style="margin-top: 12px; background: rgba(255,107,53,0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #ff6b35; display: flex; gap: 8px;">
                    <i class="bi bi-info-circle-fill" style="color: #ff6b35; font-size: 18px; margin-top: 2px;"></i>
                    <div>
                      <p style="font-size: 11px; font-weight: 700; color: #ff6b35; margin-bottom: 2px; text-transform: uppercase;">Instruções de Entrega</p>
                      <p style="font-size: 13px; font-weight: 500; color: #103841; margin: 0;">{{ orderData.intructions }}</p>
                    </div>
                  </div>
                </div>
                <div class="dd-card-actions">
                  <button class="dd-map-link" @click="$router.push('/map')">
                    <i class="bi bi-geo-alt" style="font-size: 16px;"></i>
                    Ver no Mapa
                  </button>
                  <button class="dd-chat-btn" @click="$router.push({ path: '/chat', query: { orderId: orderData.documentId } })">
                    <i class="bi bi-chat-dots" style="font-size: 20px; color: white;"></i>
                  </button>
                </div>
              </div>
              <div class="dd-card">
                <p class="dd-card-head">ITENS DO PEDIDO</p>
                <ul class="dd-items">
                  <li
                    v-for="(item, index) in allItems"
                    :key="index"
                    class="dd-item"
                    @click="item.checked = !item.checked"
                  >
                    <span class="dd-checkbox" :class="{ 'dd-checkbox-checked': item.checked }">
                      <i v-if="item.checked" class="bi bi-check" style="font-size: 11px; color: white;"></i>
                    </span>
                    <span :class="{ 'dd-item-done': item.checked }">{{ item.quantity }}x {{ item.name }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="dd-incident">
              <p class="dd-inc-head">REPORTAR INCIDENTE</p>
              <div class="dd-inc-row">
                <button class="dd-inc-btn" @click="reportIncident('Cliente ausente')">Cliente ausente</button>
                <button class="dd-inc-btn" @click="reportIncident('Morada incorreta')">Morada incorreta</button>
                <button class="dd-inc-btn" @click="reportIncident('Atraso no trânsito')">Atraso no trânsito</button>
                <button class="dd-inc-btn" @click="reportIncident('Outro')">Outro...</button>
              </div>
            </div>

            <!-- CONFIRMAÇÃO DE ENTREGA (DESKTOP) -->
            <div class="dd-confirm-card">
              <p class="dd-confirm-label">CONFIRMAÇÃO DE ENTREGA</p>
              <div class="dd-confirm-actions-row">
                <!-- Camera card -->
                <div v-if="!photoData" class="dd-confirm-placeholder" @click="cameraInput.click()">
                  <i class="bi bi-camera"></i>
                  <span class="dd-confirm-text">Tirar Foto</span>
                </div>
                <div v-else class="dd-confirm-captured">
                  <img :src="photoData" class="dd-photo-thumb" alt="Foto capturada" />
                  <div class="dd-captured-badge">
                    <i class="bi bi-check-circle-fill" style="color: #16a34a;"></i>
                    <span>Foto Capturada</span>
                  </div>
                  <button class="dd-retake-btn" @click="removePhoto">
                    <i class="bi bi-arrow-counterclockwise"></i>
                    Repetir Foto
                  </button>
                </div>
                <!-- Signature card -->
                <div v-if="!signatureData" class="dd-confirm-placeholder" @click="showSignatureModal = true">
                  <i class="bi bi-pencil"></i>
                  <span class="dd-confirm-text">Assinatura Digital</span>
                </div>
                <div v-else class="dd-confirm-captured">
                  <img :src="signatureData" class="dd-sig-preview" alt="Assinatura" />
                  <div class="dd-captured-badge">
                    <i class="bi bi-check-circle-fill" style="color: #16a34a;"></i>
                    <span>Assinatura Guardada</span>
                  </div>
                  <button class="dd-retake-btn" @click="signatureData = null; showSignatureModal = true">
                    <i class="bi bi-arrow-counterclockwise"></i>
                    Nova Assinatura
                  </button>
                </div>
              </div>
            </div>

            <div class="dd-final-buttons">
              <button class="dd-btn-main-orange" :disabled="!isDeliveryValid" @click="confirmDelivery">
                MARCAR COMO ENTREGUE
              </button>
              <button class="dd-btn-sec-outline" @click="cancelOrder">
                CANCELAR ENTREGA
              </button>
            </div>

            </template>
          </div>
        </main>
      </div>
    </div>

    <!-- MOBILE (hidden on desktop) -->
    <div class="show-mobile">
      <div class="mobile-deliveries">
        <!-- Back Button -->
        <div class="m-back-btn-wrapper">
          <button class="m-back-btn" @click="$emit('go-back')">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h2 class="m-back-title">Detalhes da Entrega</h2>
        </div>

        <main class="mobile-content">
          <!-- Order title moved to back button header -->

          <div v-if="loading" style="text-align: center; padding: 4rem;">
            <i class="bi bi-arrow-repeat spin" style="font-size: 2rem; color: #ff6b35;"></i>
            <p>A carregar pedido...</p>
          </div>
          
          <template v-else-if="orderData">


          <div class="timeline-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 class="section-title" style="margin-bottom: 0;">Estado da Entrega</h3>
            </div>
            <div class="timeline" :style="{ '--orange-width': mobileLineWidth }">
              <div
                v-for="(step, index) in steps"
                :key="step"
                class="timeline-step"
                :class="{
                  completed: index < selectedStepIndex,
                  active: index === selectedStepIndex,
                  pending: index > selectedStepIndex
                }"
                style="cursor: pointer;"
                @click="selectStatus(index)"
              >
                <div class="timeline-circle">
                  <i v-if="index < selectedStepIndex" class="bi bi-check" style="color: white; font-size: 12px;"></i>
                </div>
                <span class="timeline-label" :class="{ active: index === selectedStepIndex }">{{ step }}</span>
              </div>
            </div>
          </div>

          <section class="card-section">
            <h3 class="section-title">Destinatário</h3>
            <div class="recipient-info">
              <h4 class="recipient-name">{{ orderData.client_id?.first_name || 'Cliente' }} {{ orderData.client_id?.last_name || '' }}</h4>
              <p class="recipient-address">
                {{ orderData.address || 'Morada não definida' }}<br>
                Data: {{ orderData.date_delivery ? new Date(orderData.date_delivery).toLocaleDateString() : '—' }}
              </p>
              <div v-if="orderData.intructions" style="margin-top: 12px; background: rgba(255,107,53,0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #ff6b35; display: flex; gap: 8px;">
                <i class="bi bi-info-circle-fill" style="color: #ff6b35; font-size: 18px; margin-top: 2px;"></i>
                <div>
                  <p style="font-size: 11px; font-weight: 700; color: #ff6b35; margin-bottom: 2px; text-transform: uppercase;">Instruções de Entrega</p>
                  <p style="font-size: 13px; font-weight: 500; color: #103841; margin: 0;">{{ orderData.intructions }}</p>
                </div>
              </div>
            </div>
            <div class="recipient-actions">
              <button class="map-link" @click="$router.push('/map')">
                <i class="bi bi-geo-alt" style="font-size: 16px;"></i>
                Ver no Mapa
              </button>
              <button class="calendar-btn" @click="$router.push({ path: '/chat', query: { orderId: orderData.documentId } })">
                <i class="bi bi-chat-dots" style="font-size: 20px;"></i>
              </button>
            </div>
          </section>

          <section class="card-section">
            <h3 class="section-title">Itens do Pedido</h3>
            <ul class="order-items">
              <li
                v-for="(item, index) in allItems"
                :key="index"
                class="order-item"
                @click="item.checked = !item.checked"
              >
                <span class="m-checkbox" :class="{ 'm-checkbox-checked': item.checked }">
                  <i v-if="item.checked" class="bi bi-check" style="font-size: 10px; color: white;"></i>
                </span>
                <span :class="{ 'm-item-done': item.checked }">{{ item.quantity }}x {{ item.name }}</span>
              </li>
            </ul>
          </section>

          <!-- REPORTAR INCIDENTE (MOBILE) -->
          <section class="m-incident-section">
            <h3 class="m-incident-title">Reportar Incidente</h3>
            <div class="m-incident-buttons">
              <button class="m-incident-btn" @click="reportIncident('Cliente ausente')">Cliente ausente</button>
              <button class="m-incident-btn" @click="reportIncident('Morada incorreta')">Morada incorreta</button>
              <button class="m-incident-btn" @click="reportIncident('Atraso no trânsito')">Atraso no trânsito</button>
              <button class="m-incident-btn" @click="reportIncident('Outro')">Outro...</button>
            </div>
          </section>

          <!-- CONFIRMAÇÃO DE ENTREGA (MOBILE) -->
          <section class="m-confirm-card-section">
            <p class="m-confirm-label">CONFIRMAÇÃO DE ENTREGA</p>
            <div class="m-confirm-actions-row">
              <!-- Camera card -->
              <div v-if="!photoData" class="m-confirm-placeholder" @click="cameraInput.click()">
                <i class="bi bi-camera"></i>
                <span class="m-confirm-text">Tirar Foto</span>
              </div>
              <div v-else class="m-confirm-captured">
                <img :src="photoData" class="m-photo-thumb" alt="Foto capturada" />
                <div class="m-captured-badge">
                  <i class="bi bi-check-circle-fill" style="color: #16a34a; font-size: 12px;"></i>
                  <span>Capturada</span>
                </div>
                <button class="m-retake-btn" @click="removePhoto">
                  <i class="bi bi-arrow-counterclockwise"></i>
                  Repetir
                </button>
              </div>
              <!-- Signature card -->
              <div v-if="!signatureData" class="m-confirm-placeholder" @click="showSignatureModal = true">
                <i class="bi bi-pencil"></i>
                <span class="m-confirm-text">Assinatura Digital</span>
              </div>
              <div v-else class="m-confirm-captured">
                <img :src="signatureData" class="m-sig-preview" alt="Assinatura" />
                <div class="m-captured-badge">
                  <i class="bi bi-check-circle-fill" style="color: #16a34a; font-size: 12px;"></i>
                  <span>Guardada</span>
                </div>
                <button class="m-retake-btn" @click="signatureData = null; showSignatureModal = true">
                  <i class="bi bi-arrow-counterclockwise"></i>
                  Nova
                </button>
              </div>
            </div>
          </section>

          <div class="m-final-action-btns">
            <button class="m-btn-orange-pill" :disabled="!isDeliveryValid || savingStatus" @click="confirmDelivery">
              <span v-if="savingStatus"><i class="bi bi-arrow-repeat spin"></i> A Guardar...</span>
              <span v-else>MARCAR COMO ENTREGUE</span>
            </button>
            <button class="m-btn-outline-gray" @click="cancelOrder">
              CANCELAR ENTREGA
            </button>
          </div>

          </template>
        </main>
      </div>
    </div>

    <!-- Hidden camera input -->
    <input
      type="file"
      accept="image/*"
      capture="environment"
      ref="cameraInput"
      @change="handlePhotoUpload"
      class="hidden"
    />

    <!-- Signature Modal -->
    <div v-if="showSignatureModal" class="sig-modal-overlay" @click.self="showSignatureModal = false">
      <div class="sig-modal">
        <div class="sig-modal-header">
          <h3 class="sig-modal-title">Assinatura Digital</h3>
          <button class="sig-modal-close" @click="showSignatureModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="sig-canvas-wrapper">
          <canvas
            ref="signatureCanvas"
            class="sig-canvas"
            width="560"
            height="240"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart.prevent="startDrawing"
            @touchmove.prevent="draw"
            @touchend="stopDrawing"
          ></canvas>
        </div>
        <p class="sig-hint">Assine no espaço acima com o dedo ou rato</p>
        <div class="sig-modal-actions">
          <button class="sig-btn-clear" @click="clearSignature">
            <i class="bi bi-eraser-fill"></i>
            Limpar
          </button>
          <button class="sig-btn-save" @click="saveSignature">
            <i class="bi bi-check-lg"></i>
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Incident Modal -->
    <div v-if="showIncidentModal" class="sig-modal-overlay" @click.self="showIncidentModal = false">
      <div class="sig-modal">
        <div class="sig-modal-header">
          <h3 class="sig-modal-title">Descrever Incidente</h3>
          <button class="sig-modal-close" @click="showIncidentModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div style="padding: 0 0 8px;">
          <textarea
            v-model="customIncidentText"
            class="dd-confirm-input"
            placeholder="Descreva o incidente aqui..."
            rows="4"
            style="resize: none; font-family: 'Public Sans', sans-serif;"
          ></textarea>
        </div>
        <p class="sig-hint">A mensagem será enviada ao admin e ao cliente.</p>
        <div class="sig-modal-actions">
          <button class="sig-btn-clear" @click="showIncidentModal = false">Cancelar</button>
          <button class="sig-btn-save" :disabled="!customIncidentText.trim()" @click="submitCustomIncident">
            <i class="bi bi-send-fill"></i> Enviar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { strapiGet, strapiPost, strapiPut, STRAPI_URL } from '@shared/utils/strapi.js';
import { useCourierStore } from '../stores/index.js';

const router = useRouter();
const route = useRoute();
const courierStore = useCourierStore();

const props = defineProps({
  order: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['go-back', 'update-status', 'confirm-delivery']);

// Determine ID from props (if used as component) or route (if used as page)
const orderId = computed(() => props.order?.documentId || props.order?.id || route.params.id);

const orderData = ref(null);
const loading = ref(true);
const allItems = ref([]);

onMounted(async () => {
  if (!orderId.value) {
    loading.value = false;
    return;
  }
  try {
    const json = await strapiGet(`/api/orders/${orderId.value}?populate=*`);
    orderData.value = json.data;
    
    // Populate the reactive array so checklist interactions persist
    const products = orderData.value?.products || [];
    const combos = orderData.value?.combos || [];
    allItems.value = [...products, ...combos].map(i => ({
      name: i.title || i.name || JSON.stringify(i),
      quantity: i.quantity || 1,
      checked: false
    }));
  } catch (err) {
    console.error('[DeliveryDetails] error fetching order:', err);
  } finally {
    loading.value = false;
  }
});

const STATUS_MAP = {
  pending:     'Pendente',
  assigned:    'Atribuída',
  collecting:  'Em Recolha',
  in_traffic:  'Em Trânsito',
  arrived:     'No Destino',
  delivered:   'Entregue',
  cancelled:   'Cancelada',
};

function statusLabel(raw) {
  const key = (raw || '').toLowerCase().replace(' ', '_');
  return STATUS_MAP[key] || (raw || 'Em Trânsito');
}

const steps = ['Atribuída', 'Em Recolha', 'Em Trânsito', 'No Destino'];
const STATUS_TO_STEP = { assigned: 0, collecting: 1, in_traffic: 2, arrived: 3, delivered: 3 };
const currentStepIndex = ref(0);
const selectedStepIndex = ref(0);

// Sync step index with live order status
watch(orderData, (val) => {
  if (!val) return;
  const s = (val.order_status || 'assigned').toLowerCase().replace(' ', '_');
  const step = STATUS_TO_STEP[s] ?? 0;
  currentStepIndex.value = step;
  selectedStepIndex.value = step;
}, { immediate: true });



const orderItems = allItems;

const desktopLineRight = computed(() => {
  const n = selectedStepIndex.value;
  const total = steps.length - 1;
  return `${Math.max(0, ((total - n) / total) * 100)}%`;
});

const mobileLineWidth = computed(() => {
  const n = selectedStepIndex.value;
  const total = steps.length - 1;
  return `${Math.min(100, (n / total) * 100)}%`;
});

const isDeliveryValid = computed(() =>
  !!photoData.value &&
  !!signatureData.value &&
  orderItems.value.every(item => item.checked) &&
  currentStepIndex.value === 3  // Must be at "Entregue"
);

function selectStatus(index) {
  selectedStepIndex.value = index;
}

const savingStatus = ref(false);

async function confirmStatus() {
  if (!orderData.value?.documentId) return;
  savingStatus.value = true;
  const statusKeys = ['assigned', 'collecting', 'in_traffic', 'delivered'];
  const newStatus = statusKeys[selectedStepIndex.value] || 'assigned';
  try {
    await strapiPut(`/api/orders/${orderData.value.documentId}`, { order_status: newStatus });
    currentStepIndex.value = selectedStepIndex.value;
    orderData.value.order_status = newStatus;
    emit('update-status', steps[currentStepIndex.value]);
  } catch (err) {
    console.error('[DeliveryDetails] confirmStatus error:', err);
    alert('Erro ao atualizar estado da entrega.');
  } finally {
    savingStatus.value = false;
  }
}

const sendingIncident = ref(false);
const showIncidentModal = ref(false);
const customIncidentText = ref('');

async function reportIncident(type) {
  if (type === 'Outro') {
    customIncidentText.value = '';
    showIncidentModal.value = true;
    return;
  }
  await sendIncidentMessage(type);
}

async function submitCustomIncident() {
  const text = customIncidentText.value.trim();
  if (!text) return;
  showIncidentModal.value = false;
  await sendIncidentMessage(text);
}

async function sendIncidentMessage(type) {
  if (!orderData.value || sendingIncident.value) return;
  const orderId = orderData.value.order_id || orderData.value.id;
  const orderDocId = orderData.value.documentId;
  const clientDocId = orderData.value.client_id?.documentId;
  const courierDocId = courierStore.courierProfile?.documentId;

  if (!courierDocId) {
    alert('Sessão do estafeta não encontrada.');
    return;
  }

  const text = `${type} - #${orderId} - Envie mensagem para mais informações`;
  sendingIncident.value = true;
  try {
    await strapiPost('/api/messages', {
      content: text,
      sender: 'courier',
      courier: courierDocId,
      is_read: false,
    });
    if (orderDocId && clientDocId) {
      await strapiPost('/api/messages', {
        content: text,
        sender: 'courier',
        courier: courierDocId,
        order: orderDocId,
        client: clientDocId,
        is_read: false,
      });
    }
    alert(`Incidente reportado: ${type}`);
  } catch (err) {
    console.error('[DeliveryDetails] reportIncident error:', err);
    alert('Erro ao reportar incidente.');
  } finally {
    sendingIncident.value = false;
  }
}

async function cancelOrder() {
  if (!orderData.value?.documentId) return;
  if (!confirm('Tem a certeza que deseja cancelar esta entrega?')) return;
  try {
    await strapiPut(`/api/orders/${orderData.value.documentId}`, { order_status: 'cancelled' });
    currentStepIndex.value = 5;
    alert('Entrega cancelada.');
    emit('go-back');
  } catch (err) {
    console.error('[DeliveryDetails] cancelOrder error:', err);
    alert('Erro ao cancelar entrega.');
  }
}

const showToast = ref(false);

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

async function confirmDelivery() {
  if (!orderData.value?.documentId) return;
  savingStatus.value = true;

  try {
    const photoBlob = dataURItoBlob(photoData.value);
    const sigBlob = dataURItoBlob(signatureData.value);

    const formData = new FormData();
    formData.append('files', photoBlob, `photo_${orderData.value.order_id}.jpg`);
    formData.append('files', sigBlob, `signature_${orderData.value.order_id}.png`);

    // We must use the raw fetch for multipart/form-data because our strapiPost sets Content-Type to application/json
    const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${uploadRes.status}`);
    }

    const uploadedFiles = await uploadRes.json();
    const photoId = uploadedFiles[0]?.id;
    const sigId = uploadedFiles[1]?.id;

    // Use destination location from order
    const loc = orderData.value.address || orderData.value.destinationAddress || '';

    await strapiPost('/api/delivery-proofs', {
      order: orderData.value.documentId,
      location: { address: loc },
      photo: photoId,
      signature: sigId
    });

    let durationPayload = {};
    if (orderData.value.started_at) {
      const startedAt = new Date(orderData.value.started_at).getTime();
      const now = Date.now();
      const diffSeconds = Math.floor((now - startedAt) / 1000);
      // scale by 10 as requested
      const scaledDuration = diffSeconds * 10;
      durationPayload.delivery_duration = scaledDuration;
      durationPayload.ended_at = new Date(now).toISOString();
    }

    await strapiPut(`/api/orders/${orderData.value.documentId}`, {
      order_status: 'delivered',
      ...durationPayload
    });

    showToast.value = true;
    setTimeout(() => {
      emit('confirm-delivery');
      showToast.value = false;
    }, 900);
  } catch (error) {
    console.error('[DeliveryDetails] confirmDelivery error:', error);
    alert('Erro ao guardar o comprovativo de entrega. Verifique a ligação e tente novamente.');
  } finally {
    savingStatus.value = false;
  }
}

// ── Camera ──────────────────────────────────────────
const cameraInput = ref(null);
const photoData = ref(null);

function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { photoData.value = ev.target.result; };
  reader.readAsDataURL(file);
}

function removePhoto() {
  photoData.value = null;
  if (cameraInput.value) cameraInput.value.value = '';
}

// ── Signature ───────────────────────────────────────
const showSignatureModal = ref(false);
const signatureCanvas = ref(null);
const signatureData = ref(null);

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let ctx = null;

function getCanvasPos(e) {
  const canvas = signatureCanvas.value;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

function startDrawing(e) {
  isDrawing = true;
  const { x, y } = getCanvasPos(e);
  lastX = x;
  lastY = y;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(e) {
  if (!isDrawing) return;
  const { x, y } = getCanvasPos(e);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

function clearSignature() {
  if (ctx) ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
}

function saveSignature() {
  signatureData.value = signatureCanvas.value.toDataURL('image/png');
  showSignatureModal.value = false;
}

watch(showSignatureModal, async (val) => {
  if (val) {
    await nextTick();
    ctx = signatureCanvas.value.getContext('2d');
    ctx.strokeStyle = '#103841';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

/* ========== TOAST NOTIFICATION ========== */
.toast-notification {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #103841;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ===================== */
.show-desktop { display: block; }
.show-mobile  { display: none;  }

@media (max-width: 768px) {
  .show-desktop { display: none;  }
  .show-mobile  { display: block; }
}

/* ========== BACK BUTTON STYLES (DESKTOP) ========== */
.dd-back-btn-wrapper {
  padding: 40px 40px 12px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.dd-back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #103841;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s;
}

.dd-back-btn:hover {
  color: #ff6b35;
}

.dd-back-btn i {
  font-size: 18px;
}

/* ========== BACK BUTTON STYLES (MOBILE) ========== */
.m-back-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.m-back-btn {
  background: transparent;
  border: none;
  color: #103841;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.m-back-btn:active {
  color: #ff6b35;
}

.m-back-title {
  font-size: 16px;
  font-weight: 700;
  color: #103841;
  margin: 0;
}

/* ========== REFINED CONFIRMATION SECTION (DESKTOP) ========== */
.dd-confirm-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dd-confirm-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  margin: 0;
  display: block;
}

.dd-confirm-actions-row {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.dd-confirm-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 140px;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.dd-confirm-placeholder:hover {
  border-color: #ff6b35;
  background-color: #fff7f4;
}

.dd-confirm-placeholder i {
  font-size: 32px;
  color: #94a3b8;
  transition: color 0.2s;
}

.dd-confirm-placeholder:hover i {
  color: #ff6b35;
}

.dd-confirm-text {
  font-size: 15px;
  font-weight: 700;
  color: #64748b;
}

.dd-confirm-notes {
  margin: 0;
}

.dd-confirm-input {
  width: 100%;
  box-sizing: border-box;
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  outline: none;
  font-family: "Public Sans", sans-serif;
  transition: border-color 0.2s, background-color 0.2s;
}

.dd-confirm-input::placeholder {
  color: #9ca3af;
}

.dd-confirm-input:focus {
  border-color: #ff6b35;
  background: #ffffff;
}

.dd-final-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dd-btn-main-orange {
  width: 100%;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 20px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.2);
  transition: all 0.2s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dd-btn-main-orange:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(255, 107, 53, 0.4); }
.dd-btn-main-orange:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

.dd-btn-sec-outline {
  width: 100%;
  background: #fff1f2;
  color: #e11d48;
  border: 1.5px solid #fecdd3;
  padding: 20px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.dd-btn-sec-outline:hover {
  background: #ffe4e6;
  border-color: #fda4af;
  color: #be123c;
}

/* ========== REFINED CONFIRMATION SECTION (MOBILE) ========== */
.m-confirm-card-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin: 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.m-confirm-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0;
  display: block;
}

.m-confirm-actions-row {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.m-confirm-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 110px;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.m-confirm-placeholder:active {
  border-color: #ff6b35;
  background-color: #fff7f4;
}

.m-confirm-placeholder i {
  font-size: 28px;
  color: #94a3b8;
}

.m-confirm-text {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

.m-confirm-notes {
  margin-top: 0;
  padding: 0 16px;
  border-top: none;
}

.m-confirm-input {
  width: 100%;
  box-sizing: border-box;
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  color: #374151;
  outline: none;
  font-family: "Public Sans", sans-serif;
  transition: border-color 0.2s, background-color 0.2s;
}

.m-confirm-input::placeholder {
  color: #9ca3af;
}

.m-confirm-input:focus {
  border-color: #ff6b35;
  background: #ffffff;
}

.m-final-action-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 40px;
}

.m-btn-orange-pill {
  width: 100%;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(255, 107, 53, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.m-btn-orange-pill:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.m-btn-outline-gray {
  width: 100%;
  background: #fff1f2;
  color: #e11d48;
  border: 1.5px solid #fecdd3;
  padding: 16px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.m-btn-outline-gray:active { background: #ffe4e6; border-color: #fda4af; }

/* ══════════════════════════════════════
   DETAILS VIEW STYLES
══════════════════════════════════════ */
.dd {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "Public Sans", sans-serif;
  color: #103841;
}

.dd-main { padding: 0 0 80px; }
.dd-body { max-width: 1440px; margin: 0 auto; padding: 0 40px 40px; display: flex; flex-direction: column; gap: 32px; box-sizing: border-box; width: 100%; }

.dd-order-hdr { display: flex; flex-direction: column; gap: 4px; }
.dd-order-title { font-size: 18px; font-weight: 700; color: #103841; margin: 0; line-height: 28px; }
.dd-order-status { font-size: 12px; font-weight: 600; color: #ff6b35; text-transform: uppercase; margin: 0; }

.dd-alert {
  background-color: #ffffff; border: 2px solid #ff6b35; border-radius: 12px;
  padding: 18px; display: flex; align-items: center; gap: 16px;
}
.dd-alert-icon-wrap {
  width: 48px; height: 48px; background-color: #ff6b35; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  padding: 8px; box-sizing: border-box;
}
.dd-alert-h { font-size: 20px; font-weight: 700; color: #ff6b35; margin: 0 0 2px 0; line-height: 28px; }
.dd-alert-p { font-size: 14px; font-weight: 500; color: #dc2626; margin: 0; line-height: 20px; }

.dd-tl { background-color: #ffffff; border-radius: 12px; padding: 25px; display: flex; flex-direction: column; gap: 24px; border: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.dd-tl-head { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1.4px; text-transform: uppercase; margin: 0 0 4px 0; }

.dd-tl-row { position: relative; display: flex; align-items: flex-start; justify-content: space-between; }

.dd-tl-bg-line { position: absolute; top: 16px; left: 0; right: 0; height: 2px; background-color: #e5e7eb; z-index: 0; }
.dd-tl-orange-line { position: absolute; top: 16px; left: 0; right: 33%; height: 2px; background-color: #ff6b35; z-index: 0; transition: right 0.3s ease; }

.dd-step { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; z-index: 1; }

.dd-circ {
  width: 32px; height: 32px; border-radius: 50%; background-color: #ff6b35;
  border: 4px solid #ffffff; box-sizing: border-box;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;
}
.dd-circ-active { box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #ff6b35; }
.dd-circ-pending { background-color: #ffffff; border: 2px solid #ff6b35; box-shadow: none; }
.dd-active-overlay { position: absolute; inset: -4px; border-radius: 50%; }
.dd-active-dot { width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; flex-shrink: 0; }

.dd-step-lbl { font-size: 12px; font-weight: 700; color: #103841; white-space: nowrap; }
.dd-step-lbl-active { color: #ff6b35; }
.dd-step-lbl-pending { color: #64748b; }

.dd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.dd-card { background-color: #ffffff; border-radius: 12px; padding: 25px; display: flex; flex-direction: column; gap: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.dd-card-head { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1.4px; text-transform: uppercase; margin: 0 0 4px 0; }

.dd-recip { display: flex; flex-direction: column; gap: 4px; }
.dd-recip-name { font-size: 20px; font-weight: 700; color: #103841; margin: 0; }
.dd-recip-addr { font-size: 16px; font-weight: 400; color: #64748b; margin: 0; line-height: 24px; }

.dd-card-actions { display: flex; align-items: stretch; gap: 8px; }

.dd-map-link {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border-radius: 8px; text-decoration: none;
  font-size: 14px; font-weight: 700; color: #103841;
  background: #ffffff; border: 1.5px solid #103841;
  cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.dd-map-link:hover { background-color: #f8fafc; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }

.dd-chat-btn {
  background-color: #103841; border: none; border-radius: 8px; padding: 13px 24px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
  transition: background-color 0.2s;
}
.dd-chat-btn:hover { background-color: #0d2e36; }

.dd-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.dd-item {
  display: flex; align-items: center; gap: 12px; padding: 11px 4px;
  font-size: 15px; font-weight: 500; color: #103841; cursor: pointer;
  border-bottom: 1px solid #f1f5f9; transition: background-color 0.15s;
}
.dd-item:last-child { border-bottom: none; }
.dd-item:hover { background-color: #f8fafc; }
.dd-item-done { color: #103841; font-weight: 600; }

.dd-checkbox {
  width: 20px; height: 20px; border-radius: 5px; border: 1.5px solid #cbd5e1;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #ffffff; transition: background-color 0.2s, border-color 0.2s;
}
.dd-checkbox-checked { background-color: #ff6b35; border-color: #ff6b35; }

.dd-incident { background-color: #ffffff; border-radius: 12px; padding: 25px; display: flex; flex-direction: column; gap: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.dd-inc-head { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1.4px; text-transform: uppercase; margin: 0 0 4px 0; }
.dd-inc-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.dd-inc-btn {
  background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 17px;
  font-family: "Public Sans", sans-serif;; font-size: 12px; font-weight: 700; color: #103841;
  cursor: pointer; transition: border-color 0.2s;
}
.dd-inc-btn:hover { border-color: #ff6b35; color: #ff6b35; }

/* ══════════════════════════════════════
   MOBILE DETAILS STYLES
══════════════════════════════════════ */
.mobile-deliveries {
  display: flex; flex-direction: column; height: 100vh;
  background-color: #ffffff; padding-bottom: 60px;
}

.mobile-content { padding: 16px 16px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 32px; }

.critical-alert {
  background-color: #ffffff; border: 2px solid #ff6b35; border-radius: 12px;
  padding: 16px; display: flex; gap: 12px;
}
.alert-icon {
  flex-shrink: 0; width: 28px; height: 28px; background-color: #ff6b35;
  border-radius: 9999px; display: flex; align-items: center; justify-content: center;
}

.alert-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.alert-title { font-size: 13px; font-weight: 700; color: #ff6b35; line-height: 20px; margin-bottom: 2px; }
.alert-message { font-size: 12px; font-weight: 500; color: #dc2626; line-height: 16px; }

.timeline-section { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; }

.section-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px; }

.timeline { display: flex; align-items: center; justify-content: space-between; position: relative; }

.timeline::before {
  content: ''; position: absolute; height: 2px; background-color: #ffffff;
  top: 9px; left: 0; right: 0; z-index: 1;
}
.timeline::after {
  content: ''; position: absolute; height: 2px;
  background: linear-gradient(to right, #ff6b35 0%, #ff6b35 var(--orange-width, 66.7%), #e5e7eb var(--orange-width, 66.7%), #e5e7eb 100%);
  top: 9px; left: 0; right: 0; z-index: 2;
  transition: background 0.3s ease;
}

.timeline-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; position: relative; z-index: 3; }

.timeline-circle {
  width: 24px; height: 24px; border-radius: 9999px; background-color: #ffffff;
  border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; position: relative;
}
.timeline-step.completed .timeline-circle { background-color: #ff6b35; border-color: #ffffff; }
.timeline-step.active .timeline-circle { box-shadow: 0 0 0 2px #ff6b35; }
.timeline-step.active .timeline-circle::before {
  content: ''; position: absolute; width: 16px; height: 16px;
  background-color: #ff6b35; border-radius: 9999px;
  top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1;
}
.timeline-step.active .timeline-circle::after {
  content: ''; position: absolute; width: 6px; height: 6px;
  background-color: #ffffff; border-radius: 9999px;
  top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;
}
.timeline-step.pending .timeline-circle { border-color: #ff6b35; background-color: #ffffff; }

.timeline-label { font-size: 11px; font-weight: 700; color: #103841; text-align: center; }
.timeline-label.active { color: #ff6b35; }

.card-section { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; }

/* ========== MOBILE INCIDENT SECTION ========== */
.m-incident-section {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
}

.m-incident-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 16px 0;
}

.m-incident-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.m-incident-btn {
  background-color: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #103841;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.m-incident-btn:hover,
.m-incident-btn:active {
  color: #ff6b35;
}

.recipient-info { margin-bottom: 16px; }
.recipient-name { font-size: 17px; font-weight: 700; color: #103841; margin-bottom: 4px; }
.recipient-address { font-size: 13px; color: #64748b; line-height: 18px; }

.recipient-actions { display: flex; gap: 12px; }

.map-link {
  flex: 1; background: #ffffff; border: 1.5px solid #103841; border-radius: 8px;
  color: #103841; font-size: 12px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: background-color 0.2s;
}
.map-link:hover { background-color: #f8fafc; }

.calendar-btn {
  background-color: #103841; border: none; border-radius: 8px; color: #ffffff;
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;
}

.order-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }
.order-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  font-size: 14px; font-weight: 500; color: #103841; cursor: pointer;
  border-bottom: 1px solid #f1f5f9; transition: background-color 0.15s;
}
.order-item:last-child { border-bottom: none; }
.m-item-done { color: #103841; font-weight: 600; }

.m-checkbox {
  width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid #cbd5e1;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #ffffff; transition: background-color 0.2s, border-color 0.2s;
}
.m-checkbox-checked { background-color: #ff6b35; border-color: #ff6b35; }

/* ========== UTILITIES ========== */
.hidden { display: none; }

/* ========== CONFIRMATION CAPTURED STATE (DESKTOP) ========== */
.dd-confirm-captured {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 140px;
  background-color: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
}

.dd-photo-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #bbf7d0;
  flex-shrink: 0;
}

.dd-sig-preview {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.dd-captured-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}

.dd-retake-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #16a34a;
  border-radius: 20px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dd-retake-btn:hover { background-color: #dcfce7; }

/* ========== CONFIRMATION CAPTURED STATE (MOBILE) ========== */
.m-confirm-captured {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 110px;
  background-color: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.m-photo-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #bbf7d0;
  flex-shrink: 0;
}

.m-sig-preview {
  max-width: 100%;
  max-height: 44px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.m-captured-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
}

.m-retake-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid #16a34a;
  border-radius: 20px;
  color: #16a34a;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  cursor: pointer;
}

/* ========== SIGNATURE MODAL ========== */
.sig-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  box-sizing: border-box;
}

.sig-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  padding: 28px;
  box-sizing: border-box;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sig-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sig-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #103841;
  margin: 0;
}

.sig-modal-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.15s;
}
.sig-modal-close:hover { background-color: #f1f5f9; color: #103841; }

.sig-canvas-wrapper {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  overflow: hidden;
  touch-action: none;
}

.sig-canvas {
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
  touch-action: none;
}

.sig-hint {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}

.sig-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.sig-btn-clear {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sig-btn-clear:hover { background-color: #e2e8f0; }

.sig-btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #103841;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
}
.sig-btn-save:hover { background-color: #0d2e36; }
</style>
