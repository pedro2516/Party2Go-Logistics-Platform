<template>
  <div class="checkout-summary">
    <div class="summary-card">
      <div class="summary-header">
        <h2 class="summary-title">Total da Compra</h2>
      </div>

      <div class="summary-content">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">{{ subtotal }}€</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">Taxa Logística</span>
          <span class="summary-value">{{ shipping }}€</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row total">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ total }}€</span>
        </div>

        <button class="btn-confirm" @click="handleConfirm" :disabled="isSubmitting || isBlocked">
          <span>{{ isSubmitting ? "Processando..." : "Realizar Pagamento" }}</span>
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
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  // Disables the button without changing its label text (e.g. client not loaded yet)
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm"]);

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const shipping = computed(() => {
  return props.shippingCost;
});

const total = computed(() => {
  return subtotal.value + shipping.value;
});

const handleConfirm = () => {
  emit("confirm");
};
</script>

<style scoped>
.checkout-summary {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.summary-card {
  background-color: white;
  border-radius: 40px;
  box-shadow: 0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.summary-header {
  background-color: var(--dark-text);
  padding: 24px;
  text-align: center;
}

.summary-title {
  font-family: "Public Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 28px;
}

.summary-content {
  padding: 31px 32px;
  display: flex;
  flex-direction: column;
  gap: 14.8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
}

.summary-divider {
  height: 1px;
  background-color: var(--border-lighter);
  margin: 8px 0;
}

.summary-label {
  color: var(--secondary-light);
  font-weight: 400;
}

.summary-value {
  color: var(--dark-text);
  font-weight: 700;
}

.summary-row.total {
  padding-top: 17px;
  border-top: 1.2px solid white;
  font-size: 20px;
  line-height: 28px;
}

.summary-row.total .summary-value {
  color: var(--primary-color);
  font-size: 30px;
  line-height: 36px;
}

.btn-confirm {
  width: 100%;
  padding: 15px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 9999px;
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0px 10px 15px -3px rgba(253, 94, 58, 0.2),
    0px 4px 6px -4px rgba(253, 94, 58, 0.2);
  margin-top: 15px;
}

.btn-confirm:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm i {
  font-size: 16px;
}

.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 9px;
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--secondary-light);
}

.security-badge i {
  font-size: 16px;
}

@media (max-width: 1023px) {
  .checkout-summary {
    position: relative;
    top: auto;
  }
}
</style>
