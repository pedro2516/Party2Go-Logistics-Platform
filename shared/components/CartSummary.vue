<template>
  <div class="cart-summary">
    <div class="summary-card">
      <div class="summary-content">
        <h2 class="summary-title">Resumo da Entrega</h2>

        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">{{ (subtotal || 0).toFixed(2) }}€</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">Taxa Logística</span>
          <span class="summary-value">{{ (shipping || 0).toFixed(2) }}€</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row total">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ (total || 0).toFixed(2) }}€</span>
        </div>

        <button class="btn-checkout" @click="handleCheckout">
          <span>Continuar</span>
          <i class="bi bi-arrow-right"></i>
        </button>

        <div class="security-badge">
          <i class="bi bi-shield-check"></i>
          <span>Pagamento 100% Seguro</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  shippingCost: {
    type: Number,
    default: 8,
  },
});

const emit = defineEmits(["checkout"]);

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const shipping = computed(() => {
  return props.shippingCost;
});

const total = computed(() => {
  return subtotal.value + shipping.value;
});

const handleCheckout = () => {
  emit("checkout");
};
</script>

<style scoped>
/* ===== Main Container ===== */
.cart-summary {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #faf7f2 100%);
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(253, 94, 58, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* ===== Content Section ===== */
.summary-content {
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== Title ===== */
.summary-title {
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0 0 8px 0;
  line-height: 26px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(253, 94, 58, 0.1);
}

/* ===== Summary Rows ===== */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "Public Sans", sans-serif;
  font-size: 15px;
}

.summary-label {
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.summary-value {
  color: var(--dark-text);
  font-weight: 700;
}

/* ===== Divider ===== */
.summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(253, 94, 58, 0.1) 50%, transparent 100%);
  margin: 8px 0 4px 0;
}

/* ===== Total Row ===== */
.summary-row.total {
  padding-top: 12px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(253, 94, 58, 0.1);
  font-size: 17px;
  line-height: 28px;
}

.summary-row.total .summary-label {
  font-weight: 600;
  color: #475569;
}

.summary-row.total .summary-value {
  color: var(--primary-color);
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
}

/* ===== Checkout Button ===== */
.btn-checkout {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #f04a2a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3), 0 2px 6px rgba(253, 94, 58, 0.2);
  margin-top: 8px;
}

.btn-checkout:hover {
  background: linear-gradient(135deg, #e04e2a 0%, #d43a1a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 94, 58, 0.35), 0 4px 10px rgba(253, 94, 58, 0.25);
}

.btn-checkout:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(253, 94, 58, 0.25), 0 1px 3px rgba(253, 94, 58, 0.15);
}

.btn-checkout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-checkout i {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.btn-checkout:hover i {
  transform: translateX(2px);
}

/* ===== Security Badge ===== */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 12px;
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.security-badge i {
  font-size: 16px;
  color: var(--primary-color);
}

/* ===== Tablet Responsive (1024px and below) ===== */
@media (max-width: 1024px) {
  .cart-summary {
    position: relative;
    top: auto;
  }

  .summary-card {
    border-radius: 20px;
  }

  .summary-content {
    padding: 28px 24px;
    gap: 14px;
  }

  .summary-title {
    font-size: 17px;
    padding-bottom: 10px;
  }

  .summary-row {
    font-size: 14px;
  }

  .summary-row.total {
    padding-top: 10px;
    font-size: 16px;
  }

  .summary-row.total .summary-value {
    font-size: 26px;
  }

  .btn-checkout {
    padding: 13px 16px;
    font-size: 15px;
    margin-top: 6px;
    gap: 10px;
    border-radius: 10px;
  }

  .btn-checkout i {
    font-size: 16px;
  }

  .security-badge {
    font-size: 11px;
    padding-top: 10px;
  }

  .security-badge i {
    font-size: 14px;
  }
}

/* ===== Mobile Responsive (767px and below) ===== */
@media (max-width: 767px) {
  .cart-summary {
    position: relative;
    top: auto;
    margin-top: 20px;
  }

  .summary-card {
    border-radius: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .summary-content {
    padding: 20px 18px;
    gap: 12px;
  }

  .summary-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 6px 0;
    padding-bottom: 10px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "Public Sans", sans-serif;
    font-size: 13px;
  }

  .summary-label {
    color: #64748b;
    font-weight: 500;
    font-size: 13px;
  }

  .summary-value {
    color: var(--dark-text);
    font-weight: 700;
    font-size: 13px;
  }

  .summary-divider {
    margin: 6px 0 4px 0;
  }

  .summary-row.total {
    padding-top: 8px;
    padding-bottom: 6px;
    border-top: 1px solid rgba(253, 94, 58, 0.1);
    font-size: 14px;
    margin-top: 2px;
  }

  .summary-row.total .summary-label {
    font-size: 13px;
    font-weight: 600;
  }

  .summary-row.total .summary-value {
    color: var(--primary-color);
    font-size: 20px;
    line-height: 24px;
    font-weight: 700;
  }

  .btn-checkout {
    width: 100%;
    padding: 12px 14px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #f04a2a 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-family: "Public Sans", sans-serif;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(253, 94, 58, 0.25);
    margin-top: 8px;
  }

  .btn-checkout:active {
    transform: scale(0.98);
  }

  .btn-checkout i {
    font-size: 14px;
  }

  .security-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding-top: 10px;
    font-family: "Public Sans", sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #94a3b8;
  }

  .security-badge i {
    font-size: 14px;
    color: var(--primary-color);
  }
}

/* ===== Extra Small (389px and below) ===== */
@media (max-width: 389px) {
  .summary-content {
    padding: 18px 16px;
    gap: 10px;
  }

  .summary-title {
    font-size: 14px;
    padding-bottom: 8px;
    margin: 0 0 4px 0;
  }

  .summary-row {
    font-size: 12px;
  }

  .summary-label {
    font-size: 12px;
  }

  .summary-value {
    font-size: 12px;
  }

  .summary-row.total .summary-value {
    font-size: 18px;
  }

  .btn-checkout {
    padding: 11px 12px;
    font-size: 13px;
    margin-top: 6px;
    gap: 8px;
  }

  .btn-checkout i {
    font-size: 12px;
  }

  .security-badge {
    font-size: 10px;
    gap: 4px;
    padding-top: 8px;
  }

  .security-badge i {
    font-size: 12px;
  }
}
</style>
