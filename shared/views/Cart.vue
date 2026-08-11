<template>
  <div class="cart-page">
    <HomeHeader />

    <main class="cart-main">
      <!-- Empty Cart State -->
      <div v-if="cartStore.items.length === 0" class="cart-container-empty">
        <div class="empty-cart-message-wrapper">
          <i class="bi bi-bag-check empty-icon"></i>
          <h2 class="empty-title">O Teu Carrinho Está Vazio</h2>
          <p class="empty-description">Seleciona produtos nos packs ou combos para adicionar ao carrinho.</p>
          <router-link to="/home" class="btn-back-home">
            <i class="bi bi-arrow-left"></i>
            Voltar à Página Principal
          </router-link>
        </div>
      </div>

      <!-- Cart with Items -->
      <div v-else class="cart-container-with-items">
        <div class="cart-content">
          <!-- Page Title -->
          <div class="cart-title-section">
            <h1 class="page-title">O Meu Carrinho</h1>
            <span class="item-count">{{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'item' : 'itens' }}</span>
          </div>

          <div class="cart-layout">
            <!-- Cart Items Column -->
            <div class="cart-items-column">
              <div class="cart-items-list">
                <CartItem
                  v-for="item in cartStore.items"
                  :key="item.id"
                  :item="item"
                  @update-quantity="updateQuantity"
                  @remove="removeItem"
                />
              </div>
            </div>

            <!-- Cart Summary Column -->
            <div class="cart-summary-column">
              <CartSummary
                :items="cartStore.items"
                :shipping-cost="cartStore.shippingCost"
                @checkout="handleCheckout"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useCartStore } from "@shared/stores/useCartStore";
import HomeHeader from "../../frontoffice/src/components/home/HomeHeader.vue";
import BottomNav from "../../frontoffice/src/components/BottomNav.vue";
import CartItem from "@shared/components/CartItem.vue";
import CartSummary from "@shared/components/CartSummary.vue";

const cartStore = useCartStore();
const router = useRouter();

const updateQuantity = (data) => {
  cartStore.updateQuantity(data.id, data.quantity);
};

const removeItem = (itemId) => {
  cartStore.removeItem(itemId);
};

// Wired to CartSummary's @checkout event
const handleCheckout = () => {
  router.push('/checkout');
};
</script>

<style scoped>
.cart-page {
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.cart-main {
  padding: 40px 0;
}

/* ===== Empty Cart State ===== */
.cart-container-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 40px 20px;
}

.empty-cart-message-wrapper {
  text-align: center;
  background: linear-gradient(135deg, var(--bg-lightest) 0%, white 100%);
  padding: 60px 40px;
  border-radius: 32px;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 80px;
  color: var(--primary-color);
  display: block;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-family: "Public Sans", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0 0 12px 0;
  line-height: 36px;
}

.empty-description {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: var(--secondary-light);
  margin: 0 0 32px 0;
  line-height: 24px;
}

.btn-back-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.btn-back-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 94, 58, 0.4);
}

.btn-back-home:active {
  transform: translateY(0);
}

/* ===== Cart with Items ===== */
.cart-container-with-items {
  padding: 0 20px;
}

.cart-content {
  max-width: 1400px;
  margin: 0 auto;
}

.cart-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-lighter);
}

.page-title {
  font-family: "Public Sans", sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  line-height: 40px;
  flex: 1;
}

.item-count {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: var(--secondary-light);
  background-color: var(--border-lighter);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
}

.cart-items-column {
  display: flex;
  flex-direction: column;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease;
}

.cart-summary-column {
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Tablet Responsive (768px - 1023px) ===== */
@media (max-width: 1023px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .page-title {
    font-size: 32px;
  }

  .empty-cart-message-wrapper {
    padding: 50px 30px;
  }
}

/* ===== Mobile Responsive (390px - 767px - iPhone 16) ===== */
@media (max-width: 767px) {
  .cart-main {
    padding: 20px 0;
  }

  .cart-container-empty {
    min-height: 500px;
    padding: 24px 16px;
  }

  .empty-cart-message-wrapper {
    padding: 40px 24px;
    border-radius: 24px;
    max-width: 100%;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .empty-title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .empty-description {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .btn-back-home {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
  }

  .cart-container-with-items {
    padding: 0 16px;
  }

  .cart-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 16px;
  }

  .page-title {
    font-size: 28px;
    line-height: 32px;
    width: 100%;
  }

  .item-count {
    font-size: 12px;
    padding: 4px 10px;
  }

  .cart-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* ===== Extra Small (320px - 389px) ===== */
@media (max-width: 389px) {
  .page-title {
    font-size: 24px;
  }

  .cart-container-with-items {
    padding: 0 12px;
  }

  .cart-content {
    margin: 0 auto;
  }
}
</style>
