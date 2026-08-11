<template>
  <div class="history-details-root">
    <!-- DESKTOP VIEW -->
    <div class="show-desktop">
      <div class="hd-container">
        <!-- Back Button -->
        <div class="hd-header">
          <button class="hd-back-btn" @click="$emit('go-back')">
            <i class="bi bi-arrow-left"></i>
            Voltar ao Histórico
          </button>
          <div class="hd-badge" :class="statusClass">
            {{ order?.status || 'CONCLUÍDA' }}
          </div>
        </div>

        <main class="hd-main">
          <!-- Summary Header -->
          <div class="hd-summary-card">
            <div class="hd-order-info">
              <h1 class="hd-title">Pedido {{ order?.code || '#...' }}</h1>
              <p class="hd-subtitle">Resumo da finalização do serviço</p>
            </div>
            <div class="hd-meta-grid">
              <div class="hd-meta-item">
                <label>Data de Criação</label>
                <span>{{ order?.createdAt || '—' }}</span>
              </div>
              <div class="hd-meta-item">
                <label>Data de Finalização</label>
                <span>{{ order?.completedAt || '—' }}</span>
              </div>
              <div class="hd-meta-item">
                <label>Operador Responsável</label>
                <span>{{ order?.operator || 'Não definido' }}</span>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="hd-grid">
            <!-- Left Column: Details -->
            <div class="hd-col-left">
              <!-- Destinatário -->
              <section class="hd-section">
                <h3 class="hd-section-title">Destinatário & Local</h3>
                <div class="hd-info-box">
                  <div class="hd-info-row">
                    <i class="bi bi-person"></i>
                    <div>
                      <p class="hd-info-label">Cliente</p>
                      <p class="hd-info-value">{{ order?.clientName || 'Cliente Indefinido' }}</p>
                    </div>
                  </div>
                  <div class="hd-info-row">
                    <i class="bi bi-geo-alt"></i>
                    <div>
                      <p class="hd-info-label">Morada de Entrega</p>
                      <p class="hd-info-value">{{ order?.address || 'Morada não definida' }}</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Itens -->
              <section class="hd-section">
                <h3 class="hd-section-title">Itens do Pedido</h3>
                <div class="hd-items-list">
                  <div v-for="item in items" :key="item.name" class="hd-item">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>{{ item.name }}</span>
                  </div>
                  <div v-if="items.length === 0" class="hd-item" style="color: #9ca3af; padding: 10px 0;">
                    Nenhum item registado.
                  </div>
                </div>
              </section>

              <!-- Motivo (se aplicável) -->
              <section v-if="order?.reason" class="hd-section">
                <h3 class="hd-section-title">Observações / Motivo</h3>
                <div class="hd-reason-box">
                  <i class="bi bi-info-circle"></i>
                  <p>{{ order.reason }}</p>
                </div>
              </section>
            </div>

            <!-- Right Column: Evidence -->
            <div class="hd-col-right">
              <section class="hd-section">
                <h3 class="hd-section-title">Comprovativos de Entrega</h3>
                <div class="hd-evidence-grid">
                  <!-- Foto -->
                  <div class="hd-evidence-card">
                    <p class="hd-evidence-label">Fotografia</p>
                    <div class="hd-evidence-preview">
                      <div v-if="isLoadingProof" class="hd-evidence-empty">
                        <i class="bi bi-arrow-repeat spin"></i>
                      </div>
                      <img v-else-if="photoUrl" :src="photoUrl" alt="Foto da Entrega" />
                      <div v-else class="hd-evidence-empty">
                        <i class="bi bi-camera"></i>
                        <span>Sem fotografia</span>
                      </div>
                    </div>
                  </div>
                  <!-- Assinatura -->
                  <div class="hd-evidence-card">
                    <p class="hd-evidence-label">Assinatura Digital</p>
                    <div class="hd-evidence-preview signature">
                      <div v-if="isLoadingProof" class="hd-evidence-empty">
                        <i class="bi bi-arrow-repeat spin"></i>
                      </div>
                      <img v-else-if="signatureUrl" :src="signatureUrl" alt="Assinatura" />
                      <div v-else class="hd-evidence-empty">
                        <i class="bi bi-pencil-square"></i>
                        <span>Sem assinatura</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>


            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- MOBILE VIEW -->
    <div class="show-mobile">
      <div class="mhd-header">
        <button class="mhd-back-btn" @click="$emit('go-back')">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h2 class="mhd-title">Detalhes do Histórico</h2>
        <div class="mhd-status-badge" :class="statusClass">
          {{ order?.status || 'CONCLUÍDA' }}
        </div>
      </div>

      <main class="mhd-content">
        <div class="mhd-summary-card">
          <div class="mhd-order-info">
            <h1 class="mhd-title">Pedido {{ order?.code || '#...' }}</h1>
            <p class="mhd-subtitle">Resumo da finalização do serviço</p>
          </div>
          <div class="mhd-meta-grid">
            <div class="mhd-meta-item">
              <label>Data de Criação</label>
              <span>{{ order?.createdAt || '—' }}</span>
            </div>
            <div class="mhd-meta-item">
              <label>Data de Finalização</label>
              <span>{{ order?.completedAt || '—' }}</span>
            </div>
            <div class="mhd-meta-item">
              <label>Operador Responsável</label>
              <span>{{ order?.operator || 'Não definido' }}</span>
            </div>
          </div>
        </div>

        <section class="mhd-section">
          <h4 class="mhd-section-title">Destinatário & Local</h4>
          <div class="mhd-info-box">
            <div class="mhd-info-row">
              <i class="bi bi-person"></i>
              <div>
                <p class="mhd-info-label">Cliente</p>
                <p class="mhd-info-value">{{ order?.clientName || 'Cliente Indefinido' }}</p>
              </div>
            </div>
            <div class="mhd-info-row">
              <i class="bi bi-geo-alt"></i>
              <div>
                <p class="mhd-info-label">Morada de Entrega</p>
                <p class="mhd-info-value">{{ order?.address || 'Morada não definida' }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mhd-section">
          <h4 class="mhd-section-title">Itens Entregues</h4>
          <div class="mhd-items-pill-box">
            <span v-for="item in items" :key="item.name" class="mhd-item-pill">
              {{ item.name }}
            </span>
            <div v-if="items.length === 0" style="color: #9ca3af; font-size: 13px; font-style: italic;">
              Nenhum item registado.
            </div>
          </div>
        </section>

        <section v-if="order?.reason" class="mhd-section">
          <h4 class="mhd-section-title">Motivo / Notas</h4>
          <div class="mhd-reason-text">
            {{ order.reason }}
          </div>
        </section>

        <section class="mhd-section">
          <h4 class="mhd-section-title">Evidências</h4>
          <div class="mhd-evidence-row">
            <div class="mhd-evidence-thumb">
              <p>FOTO</p>
              <div v-if="isLoadingProof" class="mhd-no-data"><i class="bi bi-arrow-repeat spin"></i></div>
              <img v-else-if="photoUrl" :src="photoUrl" />
              <div v-else class="mhd-no-data"><i class="bi bi-camera"></i></div>
            </div>
            <div class="mhd-evidence-thumb">
              <p>ASSINATURA</p>
              <div v-if="isLoadingProof" class="mhd-no-data"><i class="bi bi-arrow-repeat spin"></i></div>
              <img v-else-if="signatureUrl" :src="signatureUrl" class="sig" />
              <div v-else class="mhd-no-data"><i class="bi bi-pencil"></i></div>
            </div>
          </div>
        </section>


      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { strapiGet, STRAPI_URL } from '@shared/utils/strapi.js';

const props = defineProps({
  order: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['go-back']);

const proofData = ref(null);
const isLoadingProof = ref(true);

const photoUrl = computed(() => {
  const url = proofData.value?.photo?.url;
  return url ? `${STRAPI_URL}${url}` : null;
});

const signatureUrl = computed(() => {
  const url = proofData.value?.signature?.url;
  return url ? `${STRAPI_URL}${url}` : null;
});

onMounted(async () => {
  if (!props.order?.documentId) {
    isLoadingProof.value = false;
    return;
  }
  try {
    const json = await strapiGet(`/api/delivery-proofs?filters[order][documentId][$eq]=${props.order.documentId}&populate=*`);
    if (json.data && json.data.length > 0) {
      proofData.value = json.data[0];
    }
  } catch (err) {
    console.error('Failed to fetch delivery proof:', err);
  } finally {
    isLoadingProof.value = false;
  }
});


const items = computed(() => props.order?.items || []);

const statusClass = computed(() => {
  const status = props.order?.status?.toUpperCase() || 'CONCLUÍDA';
  if (status === 'CANCELADO' || status === 'CANCELADA') return 'status-cancelled';
  if (status === 'DEVOLVIDO' || status === 'DEVOLVIDA') return 'status-returned';
  return 'status-completed';
});
</script>

<style scoped>
.history-details-root {
  background: #f8fafc;
  min-height: 100vh;
  width: 100%;
}

/* DESKTOP STYLES */
.show-desktop { display: block; }
.show-mobile { display: none; }

@media (max-width: 768px) {
  .show-desktop { display: none; }
  .show-mobile { display: block; }
}

.hd-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 140px 40px 40px;
  box-sizing: border-box;
}

.hd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.hd-back-btn {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s;
}

.hd-back-btn:hover { color: #103841; }

.hd-badge {
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-completed { background: #dcfce7; color: #166534; }
.status-cancelled { background: #fee2e2; color: #991b1b; }
.status-returned { background: #fef9c3; color: #854d0e; }

.hd-summary-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #f1f5f9;
}

.hd-title { font-size: 28px; font-weight: 800; color: #103841; margin: 0; }
.hd-subtitle { color: #94a3b8; font-size: 14px; margin: 4px 0 0; }

.hd-meta-grid { display: flex; gap: 48px; }
.hd-meta-item label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.hd-meta-item span { font-weight: 700; color: #103841; font-size: 15px; }

.hd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

.hd-section { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
.hd-section-title { font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }

.hd-info-row { display: flex; gap: 16px; margin-bottom: 20px; }
.hd-info-row i { font-size: 20px; color: #ff6b35; margin-top: 2px; }
.hd-info-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin: 0; }
.hd-info-value { font-size: 15px; font-weight: 600; color: #103841; margin: 2px 0 0; }

.hd-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; color: #103841; font-weight: 600; }
.hd-item i { color: #16a34a; font-size: 18px; }

.hd-reason-box { background: #f8fafc; border-radius: 12px; padding: 16px; display: flex; gap: 12px; color: #64748b; font-style: italic; line-height: 1.5; }

.hd-evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.hd-evidence-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; text-align: center; }
.hd-evidence-preview { background: #f1f5f9; border-radius: 12px; height: 160px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.hd-evidence-preview img { width: 100%; height: 100%; object-fit: cover; }
.hd-evidence-preview.signature img { object-fit: contain; padding: 10px; background: white; }
.hd-evidence-empty { display: flex; flex-direction: column; align-items: center; color: #cbd5e1; gap: 8px; }
.hd-evidence-empty i { font-size: 32px; }


/* MOBILE STYLES */
.mhd-header { background: white; padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 10; }
.mhd-back-btn { background: none; border: none; font-size: 20px; color: #103841; }
.mhd-title { flex: 1; font-size: 16px; font-weight: 800; color: #103841; margin: 0; }
.mhd-status-badge { padding: 4px 12px; border-radius: 50px; font-size: 10px; font-weight: 800; }

.mhd-content { padding: 16px; }
.mhd-summary-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); margin-bottom: 24px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 20px; }
.mhd-order-info { display: flex; flex-direction: column; gap: 4px; }
.mhd-title { font-size: 24px; font-weight: 800; color: #103841; margin: 0; }
.mhd-subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
.mhd-meta-grid { display: flex; flex-direction: column; gap: 12px; }
.mhd-meta-item label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
.mhd-meta-item span { font-weight: 700; color: #103841; font-size: 14px; }

.mhd-section { margin-bottom: 32px; }
.mhd-section-title { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
.mhd-info-box { display: flex; flex-direction: column; gap: 16px; }
.mhd-info-row { display: flex; gap: 12px; }
.mhd-info-row i { font-size: 18px; color: #ff6b35; margin-top: 2px; }
.mhd-info-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin: 0; }
.mhd-info-value { font-size: 14px; font-weight: 600; color: #103841; margin: 2px 0 0; }

.mhd-items-pill-box { display: flex; flex-wrap: wrap; gap: 8px; }
.mhd-item-pill { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 700; color: #64748b; }

.mhd-reason-text { background: #fff7f4; border-left: 4px solid #ff6b35; padding: 16px; border-radius: 0 12px 12px 0; color: #64748b; font-style: italic; font-size: 14px; }

.mhd-evidence-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mhd-evidence-thumb { background: white; border-radius: 16px; padding: 12px; border: 1px solid #eee; text-align: center; }
.mhd-evidence-thumb p { font-size: 9px; font-weight: 800; color: #94a3b8; margin-bottom: 8px; }
.mhd-evidence-thumb img { width: 100%; height: 80px; object-fit: cover; border-radius: 8px; }
.mhd-evidence-thumb img.sig { object-fit: contain; }
.mhd-no-data { height: 80px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #cbd5e1; }


</style>
