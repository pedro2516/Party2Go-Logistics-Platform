<template>
  <div class="create-pack-container">
    <!-- Header Navigation -->
    <HomeHeader />

    <!-- Main Content -->
    <main class="create-pack-main">
      <!-- Title Section -->
      <section class="title-section">
        <h1 class="page-title">Crie o seu Pack para Festa</h1>
        <p class="page-subtitle">
          Escolha os serviços e equipamentos dos nossos parceiros certificados.
        </p>
      </section>

      <div class="row m-0 w-100 g-4 align-items-start">
        <!-- Products Grid -->
        <section class="col-12 col-lg-8 products-section">
          <!-- Loading State -->
          <div v-if="loading" class="state-message">
            <i class="bi bi-arrow-repeat spin"></i>
            <span>A carregar produtos...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="state-message state-error">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ error }}</span>
            <button class="btn-retry" @click="fetchProducts">Tentar novamente</button>
          </div>

          <!-- Products Grid -->
          <div v-else class="row m-0 w-100 g-3">
            <div
              v-for="product in products"
              :key="product.id"
              class="col-12 col-md-6 col-xl-4"
            >
            <PackCard
              :product="product"
            />
            </div>
          </div>
        </section>

        <!-- Right Sidebar -->
        <aside class="col-12 col-lg-4 right-sidebar">
          <div class="cart-summary">
            <!-- Header -->
            <div class="summary-header">
              <span class="summary-label">Itens Selecionados:</span>
              <span class="summary-badge">{{ selectedItems }}</span>
            </div>

            <!-- Selected Items List -->
            <ul class="cart-items-list" v-if="cartStore.items.length > 0">
              <li
                v-for="item in cartStore.items"
                :key="item.id"
                class="cart-item"
              >
                <div class="cart-item-info">
                  <span class="cart-item-name">{{ item.quantity > 1 ? item.quantity + 'x ' : '' }}{{ item.name }}</span>
                  <span class="cart-item-price">{{
                    formatPrice(item.price * item.quantity)
                  }}</span>
                </div>
                <button
                  class="btn-remove"
                  @click="cartStore.removeItem(item.id)"
                  title="Remover"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </li>
            </ul>
            <p v-else class="empty-cart">Nenhum item selecionado.</p>

            <div class="summary-divider"></div>

            <!-- Total -->
            <div class="summary-total-row">
              <span class="summary-label">Total Estimado:</span>
              <span class="summary-total">{{ formatPrice(totalPrice) }}</span>
            </div>

            <button class="btn btn-finalize" @click="finalizeKit">
              Finalizar Pack
            </button>
          </div>
        </aside>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@shared/stores/useCartStore";
import PackCard from "@/components/pack/PackCard.vue";
import HomeHeader from "@/components/home/HomeHeader.vue";
import BottomNav from "@/components/BottomNav.vue";

const STRAPI_URL = "http://localhost:1337";

const router = useRouter();
const cartStore = useCartStore();

const products = ref([]);
const loading = ref(false);
const error = ref(null);

/**
 * Maps a single Strapi v5 product entry to the flat shape
 * expected by PackCard and the cart store.
 *
 * Strapi v5 differences vs v4:
 *  - Fields are flat on the entry object (no .attributes wrapper)
 *  - Images come back as a flat array: entry.image[]
 *  - Single-resource lookups use documentId (UUID), not numeric id
 */
function mapProduct(entry) {
  // Resolve image URL from the flat image array (Strapi v5)
  const imgArr = Array.isArray(entry.image) ? entry.image : [];
  const imgUrl = imgArr[0]?.url ?? "";
  const imageUrl = imgUrl
    ? (imgUrl.startsWith("http") ? imgUrl : `${STRAPI_URL}${imgUrl}`)
    : "";

  return {
    // Use documentId for API lookups; keep numeric id as fallback
    id: entry.product_id ?? entry.id,
    product_id: entry.product_id,
    title: entry.title ?? "",
    category: entry.category ?? "",
    price: entry.price ?? 0,
    image: imageUrl,
    badge: entry.badge ?? "",
    featuredImage: imageUrl,
    description: entry.description ?? "",
    specs: entry.specs ?? [],
    included: entry.included ?? [],
    availability: entry.availability ?? "",
    minTime: entry.minTime ?? "",
    suggestions: entry.suggestions ?? [],
  };
}

async function fetchProducts() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${STRAPI_URL}/api/products?populate=*`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar produtos (${response.status})`);
    }
    const json = await response.json();
    products.value = (json.data ?? []).map(mapProduct);
  } catch (err) {
    console.error("[CreatePack] fetchProducts error:", err);
    error.value = err.message ?? "Erro desconhecido ao carregar produtos.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProducts();
});

const selectedItems = computed(() => {
  return cartStore.itemCount;
});

const totalPrice = computed(() => {
  return cartStore.subtotal;
});

function formatPrice(price) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function finalizeKit() {
  router.push({ name: "Cart" });
}
</script>

<style scoped>
.brand-name {
  color: var(--dark-text);
}

.brand-accent {
  color: var(--primary-color);
}

.navbar-nav .nav-link {
  color: var(--dark-text) !important;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 16px;
  padding: 8px 0 !important;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.navbar-nav .nav-link.active,
.navbar-nav .nav-link:hover {
  color: var(--primary-color) !important;
  border-bottom-color: var(--primary-color);
}

.btn-link {
  color: var(--dark-text);
  text-decoration: none;
}

.btn-link:hover {
  color: var(--primary-color);
}

.btn-client-area {
  background-color: var(--primary-color);
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 32px;
  border-radius: 9999px;
  border: none;
  box-shadow:
    0 10px 15px -3px rgba(253, 94, 58, 0.2),
    0 4px 6px -4px rgba(253, 94, 58, 0.2);
  transition: all 0.3s ease;
}

.btn-client-area:hover {
  background-color: var(--primary-dark);
  box-shadow: 0 15px 25px -3px rgba(253, 94, 58, 0.3);
}

/* Main Content Styles */
.create-pack-main {
  min-height: calc(100vh - 80px);
  background-color: white;
  padding: 40px 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.title-section {
  margin-bottom: 32px;
}

/* Loading / Error States */
.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 300px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: var(--secondary-light);
}

.state-message i {
  font-size: 32px;
}

.state-error {
  color: var(--primary-color);
}

.spin {
  animation: spin 1s linear infinite;
  color: var(--primary-color);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-retry:hover {
  background-color: var(--primary-dark);
}


.main-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  align-items: start;
}

.page-title {
  font-family: "Public Sans", sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: var(--dark-text);
  margin: 0 0 12px;
  line-height: 52px;
}

.page-subtitle {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--secondary-light);
  line-height: 24px;
  margin: 0;
}

/* Products Grid */
.products-section {
  margin-bottom: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Sidebar Styles */
.right-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.cart-summary {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Summary header row */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-family: "Public Sans", sans-serif;
}

/* Cart items list */
.cart-items-list {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
  max-height: 260px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-lighter);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--dark-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-price {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-color);
}

.btn-remove {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-medium);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.btn-remove:hover {
  color: var(--primary-color);
  background-color: var(--bg-light-orange);
}

.btn-remove i {
  font-size: 12px;
}

.empty-cart {
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  color: var(--text-medium);
  text-align: center;
  padding: 12px 0;
  margin: 0;
}

.summary-divider {
  height: 1px;
  background-color: var(--border-lighter);
  margin: 12px 0;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-family: "Public Sans", sans-serif;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--dark-text);
}

.summary-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 0;
}

.summary-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.btn-finalize {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  margin-top: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: "Public Sans", sans-serif;
}

.btn-finalize:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .create-pack-main {
    padding: 32px 24px;
  }

  .main-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .right-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .create-pack-main {
    padding: 24px 16px 100px 16px;
  }

  .page-title {
    font-size: 28px;
    line-height: 32px;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
