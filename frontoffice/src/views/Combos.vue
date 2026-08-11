<template>
  <div class="combos-container">
    <HomeHeader />

    <main class="combos-main">
      <!-- Page Hero -->
      <section class="combos-title-section">
        <h1 class="combos-title">
          <span class="title-dark">Packs de Festa </span>
          <span class="title-orange">Prontos a Diversão</span>
        </h1>
        <p class="combos-subtitle">
          Escolha um dos nossos pacotes selecionados e poupe tempo na
          organização da sua festa. Tudo o que precisa num único lugar.
        </p>
      </section>

      <!-- Packs Grid -->
      <section class="combos-packs-section">
        <!-- Loading State -->
        <div v-if="loading" class="combos-state-message">
          <i class="bi bi-arrow-repeat combos-spin"></i>
          <span>A carregar packs...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="combos-state-message combos-state-error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ error }}</span>
          <button class="combos-btn-retry" @click="fetchCombos">Tentar novamente</button>
        </div>

        <!-- Packs Grid -->
        <div v-else class="row m-0 w-100 g-4 packs-row">
          <div
            v-for="pack in packs"
            :key="pack.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <ComboPackCard
              :pack="pack"
              @add-to-kit="handleAddToKit"
            />
          </div>

          <!-- Custom Pack CTA Card -->
          <div class="col-12 col-md-6 col-lg-4">
            <div class="custom-pack-card h-100">
              <div class="custom-pack-gradient"></div>
            <div class="custom-pack-inner">

              <h3 class="custom-pack-title">Pack Personalizado</h3>
              <p class="custom-pack-desc">
                Não encontrou o que procurava?<br />
                Crie o seu pack à medida das suas<br />
                necessidades.
              </p>
              <router-link to="/criar-pack" class="btn-montar-pack">
                Montar o meu Pack
              </router-link>
            </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import HomeHeader from '@/components/home/HomeHeader.vue';
import BottomNav from '@/components/BottomNav.vue';
import ComboPackCard from '@/components/pack/ComboPackCard.vue';
import { useCartStore } from '@shared/stores/useCartStore';

const STRAPI_URL = 'http://localhost:1337';

const cartStore = useCartStore();

const packs = ref([]);
const loading = ref(false);
const error = ref(null);

/**
 * Maps a single Strapi v5 combo entry to the flat shape
 * expected by ComboPackCard.
 *
 * Strapi v5 specifics:
 *  - Fields are flat on the entry (no .attributes wrapper)
 *  - Single media field (image) is a flat object: entry.image.url
 *  - features is a JSON field → comes back as a plain array
 */
function mapCombo(entry) {
  const imgUrl = entry.image?.url ?? '';
  const imageUrl = imgUrl
    ? (imgUrl.startsWith('http') ? imgUrl : `${STRAPI_URL}${imgUrl}`)
    : '';

  return {
    id: entry.combo_id ?? entry.id,
    combo_id: entry.combo_id,
    title: entry.title ?? '',
    description: entry.description ?? '',
    features: Array.isArray(entry.features) ? entry.features : [],
    specs: Array.isArray(entry.specs) ? entry.specs : [],
    originalPrice: entry.originalPrice ?? 0,
    salePrice: entry.salePrice ?? 0,
    badge: entry.badge ?? '',
    image: imageUrl,
  };
}

async function fetchCombos() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${STRAPI_URL}/api/combos?populate=*`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar combos (${response.status})`);
    }
    const json = await response.json();
    packs.value = (json.data ?? []).map(mapCombo);
  } catch (err) {
    console.error('[Combos] fetchCombos error:', err);
    error.value = err.message ?? 'Erro desconhecido ao carregar os packs.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchCombos();
});

function handleAddToKit(pack) {
  cartStore.addItem({
    id: pack.id,
    combo_id: pack.combo_id,
    title: pack.title,
    price: pack.salePrice,
    image: pack.image,
    type: 'combo',
  });
}
</script>

<style scoped>
.combos-container {
  background-color: white;
  
}

.combos-main {
  min-height: calc(100vh - 80px);
  background-color: white;
  padding: 40px 24px;
  max-width: 1440px;
  margin: 0 auto;
}

/* ===== Title Section ===== */
.combos-title-section {
  margin-bottom: 32px;
}

.combos-title {
  font-family: "Public Sans", sans-serif;
  font-size: 40px;
  font-weight: 800;
  line-height: 52px;
  margin: 0 0 12px;
}

.title-dark {
  color: var(--dark-text);
}

.title-orange {
  color: var(--primary-color);
}

.combos-subtitle {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--secondary-light);
  line-height: 24px;
  margin: 0;
}

/* ===== Packs Grid ===== */
.combos-packs-section {
  margin-bottom: 40px;
}

.packs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* ===== Loading / Error States ===== */
.combos-state-message {
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

.combos-state-message i {
  font-size: 32px;
}

.combos-state-error {
  color: var(--primary-color);
}

.combos-spin {
  animation: combos-spin 1s linear infinite;
  color: var(--primary-color);
}

@keyframes combos-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.combos-btn-retry {
  margin-top: 4px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.combos-btn-retry:hover {
  background-color: var(--primary-dark);
}

/* ===== Custom Pack CTA Card ===== */
.custom-pack-card {
  background-color: var(--dark-text);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 10px 10px 50px -12px var(--shadow-dark);
  border: 3px dashed rgba(253, 94, 58, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 600px;
}

.custom-pack-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 100% 0%,
    rgba(253, 94, 58, 0.1) 0%,
    transparent 50%
  );
  opacity: 0.5;
  pointer-events: none;
}

.custom-pack-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 24px;
  gap: 16px;
}

.custom-pack-title {
  font-family: "Public Sans", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: white;
  line-height: 32px;
  margin: 0;
}

.custom-pack-desc {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: white;
  line-height: 22.75px;
  margin: 0;
  max-width: 224px;
}

.btn-montar-pack {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: var(--dark-text);
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 32px;
  border-radius: 24px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  line-height: 20px;
  transition: background-color 0.2s ease;
}

.btn-montar-pack:hover {
  background-color: var(--border-lighter);
  color: var(--dark-text);
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .combos-main {
    padding: 32px 24px;
  }

  .packs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .combos-main {
    padding: 24px 16px 100px 16px;
  }

  .combos-title {
    font-size: 28px;
    line-height: 36px;
  }

  .packs-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
