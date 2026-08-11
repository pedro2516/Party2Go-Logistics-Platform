<template>
  <div class="pack-details-container">
    <!-- Header Navigation -->
    <HomeHeader />

    <!-- Main Content -->
    <main class="pack-details-main">
      <div v-if="packData" class="details-wrapper">
        <!-- Featured Image Section -->
        <section class="featured-section">
          <div class="featured-image-container">
            <img
              :src="packData.featuredImage"
              :alt="packData.title"
              class="featured-image"
            />
            <div class="featured-overlay">
              <div class="title-wrapper">
                <div class="featured-badge">{{ packData.badge }}</div>
                <h1 class="featured-title">{{ packData.title }}</h1>
              </div>
            </div>
          </div>
        </section>

        <!-- Content Grid -->
        <div class="row m-0 w-100 g-4 mb-5">
          <!-- Left Column -->
          <div class="col-12 col-lg-8 left-column">
            <!-- Description Section -->
            <section class="description-section">
              <div class="section-header">
                <i class="bi bi-file-text"></i>
                <h2>Descrição do Serviço</h2>
              </div>
              <p class="description-text">{{ packData.description }}</p>
            </section>

            <!-- Technical Specs Section -->
            <section class="specs-section">
              <h2 class="specs-title">Especificações Técnicas</h2>
              <div class="row m-0 w-100 g-3">
                <!-- Dimensão -->
                <div class="col-12 col-sm-6">
                <div class="spec-card h-100">
                  <div class="spec-icon"><i class="bi bi-rulers"></i></div>
                  <div class="spec-content">
                    <p class="spec-label">Dimensão</p>
                    <p class="spec-value">{{ packData.specs[0]?.value }}</p>
                  </div>
                </div>
                </div>
                <!-- Peso -->
                <div class="col-12 col-sm-6">
                <div class="spec-card h-100">
                  <div class="spec-icon"><i class="bi bi-box-seam"></i></div>
                  <div class="spec-content">
                    <p class="spec-label">Peso</p>
                    <p class="spec-value">{{ packData.specs[1]?.value }}</p>
                  </div>
                </div>
                </div>
                <!-- Tempo de Setup -->
                <div class="col-12 col-sm-6">
                <div class="spec-card h-100">
                  <div class="spec-icon"><i class="bi bi-clock"></i></div>
                  <div class="spec-content">
                    <p class="spec-label">Tempo de Setup</p>
                    <p class="spec-value">{{ packData.specs[2]?.value }}</p>
                  </div>
                </div>
                </div>
                <!-- Duração / Rendimento -->
                <div class="col-12 col-sm-6">
                <div class="spec-card h-100">
                  <div class="spec-icon"><i class="bi bi-stopwatch"></i></div>
                  <div class="spec-content">
                    <p class="spec-label">Duração / Rendimento</p>
                    <p class="spec-value">{{ packData.specs[3]?.value }}</p>
                  </div>
                </div>
                </div>
              </div>
            </section>

            <!-- What's Included Section -->
            <section class="included-section">
              <h2 class="included-title">O que está incluído</h2>
              <ul class="included-list">
                <li
                  v-for="(item, index) in packData.included"
                  :key="index"
                  class="included-item"
                >
                  <i class="bi bi-check-circle-fill"></i>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <!-- Suggestions Section -->
            <section class="suggestions-section">
              <h2 class="suggestions-title">Sugestões que combinam</h2>

              <!-- Loading State -->
              <div v-if="relatedLoading" class="suggestions-state">
                <i class="bi bi-arrow-repeat suggestions-spin"></i>
                <span>A carregar sugestões...</span>
              </div>

              <!-- Error State -->
              <div v-else-if="relatedError" class="suggestions-state suggestions-error">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>{{ relatedError }}</span>
              </div>

              <!-- No Suggestions -->
              <div v-else-if="relatedProducts.length === 0" class="suggestions-state suggestions-empty">
                <i class="bi bi-emoji-neutral"></i>
                <span>Sem sugestões disponíveis para esta categoria.</span>
              </div>

              <!-- Suggestions Grid -->
              <div v-else class="row m-0 w-100 g-3">
                <div class="col-12 col-sm-6 col-lg-3" v-for="suggestion in relatedProducts" :key="suggestion.id">
                <div
                  class="suggestion-card h-100"
                  @click="navigateToSuggestion(suggestion.id)"
                >
                  <img
                    :src="suggestion.image"
                    :alt="suggestion.title"
                    class="suggestion-image"
                  />
                  <h3 class="suggestion-title">{{ suggestion.title }}</h3>
                  <p class="suggestion-price">
                    {{ formatPrice(suggestion.price) }}
                  </p>
                </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Right Sidebar -->
          <aside class="col-12 col-lg-4 right-sidebar">
            <div class="price-card">
              <div class="price-header">
                <span class="price-label">PREÇO ESTIMADO</span>
              </div>
              <div class="price-value">{{ formatPrice(packData.price) }}</div>

              <div class="price-details">
                <div class="detail-row">
                  <span class="detail-label">Disponibilidade</span>
                  <div class="detail-value availability">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ packData.availability }}</span>
                  </div>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tempo mínimo</span>
                  <span class="detail-value">{{ packData.minTime }}</span>
                </div>
              </div>

              <button class="btn-add-to-pack" @click="handleAddToPack">
                <i class="bi bi-cart-plus"></i>
                <span>Adicionar ao Pack</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
      <!-- Loading State -->
      <div v-else-if="loading" class="loading-message">
        <i class="bi bi-arrow-repeat spin"></i>
        <p>A carregar detalhes do serviço...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="loading-message error-message">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Fallback (should not normally render) -->
      <div v-else class="loading-message">
        <p>Serviço não encontrado.</p>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import HomeHeader from "@/components/home/HomeHeader.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useCartStore } from "@shared/stores/useCartStore";

const STRAPI_URL = "http://localhost:1337";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

// Function to format price
function formatPrice(price) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

// Reactive state — main product
const packData = ref(null);
const loading = ref(false);
const error = ref(null);

// Reactive state — related products (suggestions)
const relatedProducts = ref([]);
const relatedLoading = ref(false);
const relatedError = ref(null);

/**
 * Maps a single Strapi v5 product entry to the flat shape expected by the template.
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
    id: entry.product_id ?? entry.id,
    product_id: entry.product_id || entry.documentId || String(entry.id),
    documentId: entry.documentId,
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
  };
}

/**
 * Maps a Strapi v5 product entry to the minimal shape needed by the suggestions grid.
 */
function mapSuggestion(entry) {
  const imgArr = Array.isArray(entry.image) ? entry.image : [];
  const imgUrl = imgArr[0]?.url ?? "";
  const imageUrl = imgUrl
    ? (imgUrl.startsWith("http") ? imgUrl : `${STRAPI_URL}${imgUrl}`)
    : "";
  return {
    id: entry.product_id ?? entry.id,
    title: entry.title ?? "",
    price: entry.price ?? 0,
    image: imageUrl,
  };
}

/**
 * Fetches products in the same category as the current product,
 * excluding the current product itself.
 *
 * Uses Strapi v5 filter syntax:
 *   filters[category][$eq]=<category>
 *   filters[documentId][$ne]=<currentDocumentId>
 *   pagination[limit]=4
 */
async function fetchSuggestions(category, excludeDocumentId) {
  if (!category) return;
  relatedLoading.value = true;
  relatedError.value = null;
  relatedProducts.value = [];
  try {
    const params = new URLSearchParams({
      populate: "*",
      "filters[category][$eq]": category,
      "filters[documentId][$ne]": excludeDocumentId,
      "pagination[limit]": 4,
    });
    const response = await fetch(`${STRAPI_URL}/api/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar sugestões (${response.status})`);
    }
    const json = await response.json();
    relatedProducts.value = (json.data ?? []).map(mapSuggestion);
  } catch (err) {
    console.error("[PackDetails] fetchSuggestions error:", err);
    relatedError.value = err.message ?? "Erro ao carregar sugestões.";
  } finally {
    relatedLoading.value = false;
  }
}

async function fetchProductById(id) {
  loading.value = true;
  error.value = null;
  packData.value = null;
  relatedProducts.value = [];
  try {
    // Use filters to search by numeric ID, since Strapi v5 default /:id expects a documentId UUID
    const response = await fetch(`${STRAPI_URL}/api/products?filters[product_id][$eq]=${id}&populate=*`);
    if (!response.ok) {
      throw new Error(`Produto não encontrado (${response.status})`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) throw new Error("Produto não encontrado (404)");
    packData.value = mapProduct(json.data[0]);
    // Trigger related products fetch after main product is loaded
    await fetchSuggestions(packData.value.category, packData.value.documentId);
  } catch (err) {
    console.error("[PackDetails] fetchProductById error:", err);
    error.value = err.message ?? "Erro desconhecido ao carregar o produto.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProductById(route.params.id);
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchProductById(newId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
);

// Handle add to pack
function handleAddToPack() {
  if (packData.value) {
    cartStore.addItem({ ...packData.value, type: 'product' });
    router.push('/criar-pack');
  }
}

// Navigate to suggestion details
function navigateToSuggestion(suggestionId) {
  router.push({
    name: "PackDetails",
    params: { id: suggestionId },
  });
}
</script>

<style scoped>
/* ===== PAGE SHELL ===== */
.pack-details-container {
  background-color: white;
  
  min-height: 100vh;
}

.pack-details-main {
  width: 100%;
  background-color: white;
  padding: 0;
}

/* ===== LOADING / ERROR STATE ===== */
.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  font-size: 18px;
  color: var(--secondary-light);
}

.loading-message i {
  font-size: 36px;
}

.error-message {
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

/* ===== CONTENT WRAPPER ===== */
.details-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== FEATURED SECTION ===== */
.featured-section {
  margin-top: 32px;
  margin-bottom: 48px;
}

.featured-image-container {
  position: relative;
  width: 100%;
  height: 440px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 16px;
  display: block;
}

.featured-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 159px;
  background: rgba(27, 26, 26, 0.45);
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  max-width: none;
}

.featured-badge {
  position: relative;
  align-self: auto;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 12px;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 8px;
}

.featured-title {
  position: relative;
  color: white;
  font-weight: 900;
  font-size: 48px;
  line-height: 48px;
  letter-spacing: -1.2px;
  max-width: none;
  text-align: center;
  white-space: nowrap;
}

/* ===== CONTENT GRID ===== */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
  margin-bottom: 80px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

/* ===== DESCRIPTION SECTION ===== */
.description-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header i {
  font-size: 20px;
  color: var(--primary-color);
}

.section-header h2 {
  font-weight: 700;
  font-size: 24px;
  color: var(--dark-text);
}

.description-text {
  font-size: 18px;
  color: var(--secondary-light);
  line-height: 29.25px;
  text-align: justify;
}

/* ===== SPECS SECTION ===== */
.specs-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.specs-title {
  font-weight: 700;
  font-size: 20px;
  color: var(--dark-text);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.spec-card {
  background-color: white;
  border: 1px solid white;
  border-radius: 12px;
  padding: 17px;
  box-shadow: 10px 10px 30px rgba(68, 68, 68, 0.5);
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.spec-icon {
  font-size: 30px;
  color: var(--primary-color);
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spec-label {
  font-size: 14px;
  color: var(--secondary-light);
  font-weight: 400;
}

.spec-value {
  font-size: 16px;
  color: var(--dark-text);
  font-weight: 700;
}

/* ===== INCLUDED SECTION ===== */
.included-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.included-title {
  font-weight: 700;
  font-size: 20px;
  color: var(--dark-text);
}

.included-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.included-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: var(--secondary-light);
  line-height: 24px;
}

.included-item i {
  color: var(--color-green);
  font-size: 20px;
  flex-shrink: 0;
}

/* ===== SUGGESTIONS SECTION ===== */
.suggestions-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 48px;
}

.suggestions-title {
  font-weight: 700;
  font-size: 20px;
  color: var(--dark-text);
}

/* Inline state feedback for the suggestions area */
.suggestions-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 120px;
  font-size: 14px;
  color: var(--secondary-light);
}

.suggestions-state i {
  font-size: 28px;
}

.suggestions-error {
  color: var(--primary-color);
}

.suggestions-empty {
  color: var(--secondary-light);
}

.suggestions-spin {
  animation: suggestions-spin 1s linear infinite;
  color: var(--primary-color);
}

@keyframes suggestions-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.suggestion-card:hover {
  transform: translateY(-4px);
}

.suggestion-image {
  width: 100%;
  height: 189px;
  object-fit: cover;
  border-radius: 15px;
  box-shadow: 10px 10px 50px -12px rgba(0, 0, 0, 0.7);
}

.suggestion-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--dark-text);
  text-align: center;
}

.suggestion-price {
  font-weight: 700;
  font-size: 12px;
  color: var(--primary-color);
}

/* ===== SIDEBAR ===== */
.right-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.price-card {
  background-color: white;
  border: 1px solid white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 10px 10px 30px rgba(68, 68, 68, 0.5);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.price-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-light);
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.price-value {
  font-weight: 700;
  font-size: 40px;
  color: var(--primary-color);
  line-height: 36px;
}

.price-details {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  padding: 16px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid white;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: var(--secondary-light);
  font-weight: 400;
}

.detail-value {
  font-size: 14px;
  color: var(--dark-text);
  font-weight: 500;
}

.detail-value.availability {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: white;
  border-radius: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-green);
  border-radius: 9999px;
}

.status-text {
  color: var(--color-green);
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
}

.btn-add-to-pack {
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  padding: 16px;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s ease;
  box-shadow:
    0 4px 6px -1px rgba(236, 91, 19, 0.2),
    0 2px 4px -2px rgba(236, 91, 19, 0.2);
}

.btn-add-to-pack:hover {
  background-color: var(--primary-dark);
}

.btn-add-to-pack i {
  font-size: 16px;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1199px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .right-sidebar {
    position: relative;
    top: 0;
  }

  .featured-title {
    font-size: 36px;
    line-height: 36px;
  }

  .featured-image-container {
    height: 300px;
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }

  .suggestions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .details-wrapper {
    padding: 0 16px;
  }

  .featured-section {
    margin-top: 16px;
    margin-bottom: 32px;
  }

  .featured-image-container {
    height: 240px;
  }

  .featured-overlay {
    height: 90px;
    padding: 0 16px;
    background: linear-gradient(
      to top,
      rgba(27, 26, 26, 0.75) 0%,
      rgba(27, 26, 26, 0.2) 100%
    );
  }

  .featured-title {
    font-size: 20px;
    line-height: 24px;
    white-space: normal;
    max-width: 100%;
  }

  .featured-badge {
    font-size: 11px;
    margin-bottom: 4px;
  }

  .left-column {
    gap: 32px;
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }

  .suggestions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .suggestion-image {
    height: 150px;
  }

  .price-card {
    padding: 16px;
  }

  .price-value {
    font-size: 32px;
  }

  .section-header h2,
  .specs-title,
  .included-title,
  .suggestions-title {
    font-size: 18px;
  }

  .description-text {
    font-size: 16px;
  }

  /* Add padding for bottom nav */
  .pack-details-main {
    padding-bottom: 80px;
  }
}

@media (max-width: 480px) {
  .featured-image-container {
    height: 200px;
  }

  .featured-title {
    font-size: 20px;
    line-height: 24px;
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-image {
    height: 120px;
  }

  .content-grid {
    gap: 16px;
  }

  .left-column {
    gap: 24px;
  }
}
</style>
