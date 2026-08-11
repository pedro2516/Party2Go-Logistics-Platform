<template>
  <div class="cart-item">
    <!-- Header Section: Title, Price, Controls, Total -->
    <div class="cart-item-header">
      <!-- Left Section: Item Details -->
      <div class="item-details">
        <h3 class="item-name">{{ item.name }}</h3>
      </div>

      <!-- Right Section: Total Price & Remove Button -->
      <div class="item-right-section">
        <div class="item-total">
          <p class="total-price">{{ (item.price * (item.quantity || 1)).toFixed(2) }}€</p>
        </div>
        <button class="btn-remove" @click="removeItem" title="Remover do carrinho">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <!-- Details Section -->
    <div v-if="item._raw" class="cart-item-details">
      <div class="details-divider"></div>

      <!-- Details Row: Recolha | Entrega | Material | Requisitos -->
      <div class="details-grid">
        <!-- Recolha -->
        <div class="detail-group">
          <div class="detail-label">
            <i class="bi bi-geo-alt"></i>
            <span>Recolha</span>
          </div>
          <div class="detail-content">
            <p class="detail-value">{{ item._raw.recolha?.endereco || 'Não definido' }}</p>
            <p class="detail-value">{{ item._raw.recolha?.contacto || '—' }}</p>
            <p class="detail-meta">{{ formatDateTime(item._raw.recolha?.datetime) }}</p>
          </div>
        </div>

        <!-- Entrega -->
        <div class="detail-group">
          <div class="detail-label">
            <i class="bi bi-flag"></i>
            <span>Entrega</span>
          </div>
          <div class="detail-content">
            <p class="detail-value">{{ item._raw.entrega?.endereco || 'Não definido' }}</p>
            <p class="detail-value">{{ item._raw.entrega?.contacto || '—' }}</p>
            <p class="detail-meta">{{ formatDateTime(item._raw.entrega?.datetime) }}</p>
          </div>
        </div>

        <!-- Material -->
        <div v-if="item._raw.mercadoriaList && item._raw.mercadoriaList.length > 0" class="detail-group">
          <div class="detail-label">
            <i class="bi bi-box-seam"></i>
            <span>Material</span>
          </div>
          <div class="detail-content">
            <div v-for="(mercadoria, idx) in item._raw.mercadoriaList" :key="idx" class="mercadoria-item">
              <p class="detail-value">{{ getMercadoriaLabel(mercadoria.tipo) }}</p>
              <p class="detail-meta">
                <span v-if="mercadoria.peso">{{ mercadoria.peso }} kg</span>
                <span v-if="mercadoria.peso && mercadoria.dimensoes"> • </span>
                <span v-if="mercadoria.dimensoes">{{ mercadoria.dimensoes }} cm</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Requisitos / Tags -->
        <div v-if="allRequirements.length > 0" class="detail-group">
          <div class="detail-label">
            <i class="bi bi-tag"></i>
            <span>Requisitos</span>
          </div>
          <div class="detail-content">
            <div class="requirements-tags">
              <span v-for="req in allRequirements" :key="req" class="requirement-pill">
                {{ req }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["remove"]);

const removeItem = () => {
  emit("remove", props.item.id);
};

/**
 * Collect all unique requirements from every mercadoria item
 */
const allRequirements = computed(() => {
  if (!props.item._raw?.mercadoriaList) return [];
  const reqs = new Set();
  props.item._raw.mercadoriaList.forEach(m => {
    if (m.requirements && Array.isArray(m.requirements)) {
      m.requirements.forEach(r => reqs.add(r));
    }
  });
  // Also check top-level selectedRequirements (legacy)
  if (props.item._raw.selectedRequirements && Array.isArray(props.item._raw.selectedRequirements)) {
    props.item._raw.selectedRequirements.forEach(r => reqs.add(r));
  }
  return [...reqs];
});

/**
 * Format date-time string to readable format
 * Input: "2024-05-20T14:30" → Output: "20 de mai, 14:30"
 */
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.toLocaleString('pt-PT', { month: 'short' });
    const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return `${day} de ${month}, ${time}`;
  } catch (e) {
    return dateTimeString;
  }
};

/**
 * Map material type to label
 */
const getMercadoriaLabel = (tipo) => {
  const labels = {
    bolo: 'Bolo',
    insuflavel: 'Insuflável',
    maquina: 'Máquina',
    'som-luz': 'Som & Luz',
    baloes: 'Balões',
    outro: 'Outro',
  };
  return labels[tipo] || tipo;
};
</script>

<style scoped>
/* ===== Main Container ===== */
.cart-item {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.cart-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== Header Section ===== */
.cart-item-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
}

/* ===== Left Section: Item Details ===== */
.item-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  line-height: 26px;
  word-break: break-word;
}

/* ===== Center Section: Quantity Controls ===== */
/* (Quantity controls removed - deliveries are single units) */

/* ===== Right Section: Total Price & Remove Button ===== */
.item-right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.item-total {
  text-align: right;
  min-width: 80px;
}

.total-price {
  font-family: "Public Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  line-height: 28px;
}

.btn-remove {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 18px;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-remove:hover {
  background-color: rgba(253, 94, 58, 0.1);
  color: #d84a31;
}

.btn-remove:active {
  transform: scale(0.95);
}

/* ===== Details Section ===== */
.cart-item-details {
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px 20px;
}

.details-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
  margin-bottom: 20px;
}

/* ===== Details Grid (strict alignment) ===== */
.details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 24px;
  align-items: start;
}

/* ===== Detail Group ===== */
.detail-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.detail-label i {
  font-size: 16px;
  color: var(--primary-color);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-value {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--dark-text);
  margin: 0;
  line-height: 20px;
}

.detail-meta {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 18px;
}

/* ===== Mercadoria Item ===== */
.mercadoria-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.mercadoria-item:last-child {
  margin-bottom: 0;
}

/* ===== Requirements Tags (pills) ===== */
.requirements-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.requirement-pill {
  display: inline-block;
  background-color: #f3f4f6;
  color: #374151;
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 8px;
  line-height: 18px;
  white-space: nowrap;
}

/* ===== Tablet Responsive (1024px and below) ===== */
@media (max-width: 1024px) {
  .cart-item-header {
    gap: 16px;
    padding: 16px;
  }

  .item-name {
    font-size: 16px;
    line-height: 24px;
  }



  .total-price {
    font-size: 18px;
  }

  .btn-remove {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .cart-item-details {
    padding: 0 16px 16px 16px;
  }

  .details-divider {
    margin-bottom: 16px;
  }

  .details-grid {
    gap: 16px;
  }

  .detail-label {
    font-size: 12px;
  }

  .detail-value {
    font-size: 13px;
  }

  .detail-meta {
    font-size: 11px;
  }
}

/* ===== Mobile Responsive (767px and below) ===== */
@media (max-width: 767px) {
  .cart-item {
    border-radius: 16px;
  }

  .cart-item-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px;
  }

  .item-details {
    flex: 1 1 auto;
    min-width: 200px;
    gap: 4px;
  }

  .item-name {
    font-size: 14px;
    line-height: 20px;
  }



  .item-right-section {
    flex: 1 1 100%;
    gap: 12px;
  }

  .item-total {
    min-width: 70px;
  }

  .total-price {
    font-size: 16px;
  }

  .btn-remove {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .cart-item-details {
    padding: 0 14px 14px 14px;
  }

  .details-divider {
    margin-bottom: 14px;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .detail-label {
    font-size: 11px;
  }

  .detail-value {
    font-size: 12px;
  }

  .detail-meta {
    font-size: 11px;
  }

  .requirement-pill {
    font-size: 11px;
  }
}

/* ===== Extra Small (389px and below) ===== */
@media (max-width: 389px) {
  .cart-item-header {
    gap: 10px;
    padding: 12px;
  }

  .item-details {
    min-width: 150px;
  }

  .item-name {
    font-size: 13px;
    line-height: 18px;
  }



  .item-right-section {
    gap: 10px;
  }

  .item-total {
    min-width: 60px;
  }

  .total-price {
    font-size: 14px;
  }

  .btn-remove {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .cart-item-details {
    padding: 0 12px 12px 12px;
  }

  .details-divider {
    margin-bottom: 12px;
  }

  .details-grid {
    gap: 12px;
  }

  .detail-label {
    font-size: 10px;
  }

  .detail-value {
    font-size: 11px;
  }

  .detail-meta {
    font-size: 10px;
  }

  .requirement-pill {
    font-size: 10px;
    padding: 4px 8px;
  }
}
</style>
