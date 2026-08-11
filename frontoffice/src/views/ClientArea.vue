<template>
  <div class="client-area-container">
    <!-- Header Navigation -->
    <HomeHeader />

    <!-- Main Content -->
    <main class="client-area-main max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      <!-- Profile Header -->
      <section class="profile-header">
        <div class="avatar-wrapper">
          <div class="avatar"><i class="bi bi-person-fill"></i></div>
        </div>
        <div class="header-text">
          <h1 class="profile-name">{{ clientName }}</h1>
          <p class="profile-role">Cliente Party2Go</p>
        </div>
      </section>

      <!-- Split Grid -->
      <div class="row m-0 w-100 g-4 mt-4 align-items-start">
        
        <!-- Left Column (Orders - 2/3 width) -->
        <div class="col-12 col-lg-8 left-column flex flex-col gap-8">
          
          <div class="orders-wrapper" style="background-color: white; border: 1px solid var(--border-lighter); border-radius: 14px; overflow: hidden; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);">
            <!-- Active Order Section -->
            <section class="active-order-section" v-if="activeOrder" style="border: none; border-radius: 0; border-bottom: 1px solid var(--border-lighter); box-shadow: none;">
              <div class="order-header">
                <div class="order-info">
                  <div class="order-badge">Encomenda Ativa</div>
                  <h1 class="order-title">#{{ activeOrder.order_id }}</h1>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="progress-container">
                <div class="progress-labels">
                  <span class="progress-label" :class="{ 'label-active': progressStep >= 1 }">ATRIBUÍDA</span>
                  <span class="progress-label" :class="{ 'label-active': progressStep >= 2 }">EM RECOLHA</span>
                  <span class="progress-label" :class="{ 'label-active': progressStep >= 3 }">EM TRÂNSITO</span>
                  <span class="progress-label" :class="{ 'label-active': progressStep >= 4 }">NO DESTINO</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                  <div class="progress-indicator" :style="{ left: progressPercentage + '%' }"></div>
                </div>
              </div>

              <!-- Track Button -->
              <button class="btn-track-order" @click="$router.push(`/track-order/${activeOrder.documentId}`)">
                SEGUIR EM TEMPO REAL
              </button>
            </section>
            
            <section class="active-order-section" style="border: none; border-radius: 0; border-bottom: 1px solid var(--border-lighter); box-shadow: none; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px;" v-else>
              <i class="bi bi-box-seam" style="font-size: 40px; color: var(--border-light); margin-bottom: 8px;"></i>
              <p style="font-family: 'Public Sans', sans-serif; font-weight: 600; color: var(--light-text); margin: 0;">Não tem nenhuma encomenda ativa no momento.</p>
            </section>

            <!-- Past Deliveries Section -->
            <section class="past-deliveries-section" style="border: none; border-radius: 0; padding: 24px;">
              <div class="section-header">
                <h2 class="section-title">Encomendas Passadas</h2>
                <a href="#" class="view-all-link" @click.prevent="showAllPastOrders = !showAllPastOrders" v-if="pastOrders.length > 2">
                  {{ showAllPastOrders ? 'Ver Menos' : 'Ver Tudo' }}
                </a>
              </div>

              <!-- Orders List -->
              <div class="orders-list" v-if="pastOrders.length > 0">
                <div class="order-card" v-for="order in displayedPastOrders" :key="order.id">
                  <div class="order-card-header">
                    <h3 class="order-number">#{{ order.order_id }}</h3>
                    <p class="order-price">{{ order.price }}€</p>
                  </div>
                  <p class="order-meta">{{ order.date ? new Date(order.date).toLocaleDateString() : 'Sem data' }} • {{ order.numProducts }} itens • <span style="text-transform: capitalize;">{{ ['completed', 'delivered'].includes(order.status) ? 'Entregue' : (['cancelled', 'cancelado'].includes(order.status) ? 'Cancelada' : order.status) }}</span></p>
                  
                  <!-- Comprovativos de Entrega -->
                  <div v-if="order.signature || order.photo" class="delivery-proofs" style="grid-column: 1 / 3; display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
                    <div v-if="order.signature" style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Assinatura</span>
                      <img :src="order.signature" alt="Assinatura" style="height: 60px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; background: #f8fafc;" />
                    </div>
                    <div v-if="order.photo" style="display: flex; flex-direction: column; gap: 4px;">
                      <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Fotografia</span>
                      <img :src="order.photo" alt="Fotografia" style="height: 60px; width: 60px; object-fit: cover; border: 1px solid #e2e8f0; border-radius: 6px;" />
                    </div>
                  </div>

                  <div class="rating-badge" v-if="order.classification !== null" style="grid-column: 1 / 3; display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                    <i class="bi bi-star-fill" style="color: #FFB800; font-size: 14px;" v-for="n in order.classification" :key="'filled'+n"></i>
                    <i class="bi bi-star" style="color: #e2e8f0; font-size: 14px;" v-for="n in (5 - order.classification)" :key="'empty'+n"></i>
                  </div>
                  <button v-else-if="order.status !== 'cancelled' && order.status !== 'cancelado'" class="btn-reorder" @click="openRatingModal(order)" style="grid-column: 1 / 3; justify-self: end;">
                    CLASSIFICAR
                  </button>
                </div>
              </div>
              <div v-else style="padding: 32px 0; text-align: center;">
                <p style="font-family: 'Public Sans', sans-serif; color: var(--light-text); margin: 0;">Nenhuma Encomenda Concluída</p>
              </div>
            </section>
          </div>

        <!-- Logout Button -->
        <div class="logout-container mt-4" style="margin-top: 24px;">
          <button class="btn-logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Terminar Sessão
          </button>
        </div>
        </div>

        <!-- Right Column (Personal Data - 1/3 width) -->
        <div class="col-12 col-lg-4 right-column">
          <section class="profile-section">
            <div class="section-header-row">
              <h2 class="section-title">Dados Pessoais</h2>
              <div class="edit-actions">
                <button v-if="isEditingProfile" class="btn-cancel" @click="cancelEdit">
                  <i class="bi bi-x"></i> Cancelar
                </button>
                <button class="btn-edit" @click="isEditingProfile ? saveProfile() : toggleEdit()">
                  <i :class="isEditingProfile ? 'bi bi-check-lg' : 'bi bi-pencil'"></i>
                  {{ isEditingProfile ? 'Guardar' : 'Editar' }}
                </button>
              </div>
            </div>

            <div class="info-list">
              <!-- Primeiro Nome -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-person info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Primeiro Nome</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.firstName || '—' }}</span>
                  <input v-else v-model="profileForm.firstName" type="text" class="info-input" placeholder="Primeiro nome" />
                </div>
              </div>

              <!-- Apelido -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-person info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Apelido</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.lastName || '—' }}</span>
                  <input v-else v-model="profileForm.lastName" type="text" class="info-input" placeholder="Apelido" />
                </div>
              </div>

              <!-- Email -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-envelope info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Email</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.email || '—' }}</span>
                  <input v-else v-model="profileForm.email" type="email" class="info-input" placeholder="Email" />
                </div>
              </div>

              <!-- Telemóvel -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-telephone info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Telemóvel</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.phone || '—' }}</span>
                  <input v-else v-model="profileForm.phone" type="tel" class="info-input" placeholder="Telemóvel" />
                </div>
              </div>

              <!-- Morada (Rua) -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-geo-alt info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Rua</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.addressStreet || '—' }}</span>
                  <input v-else v-model="profileForm.addressStreet" type="text" class="info-input" placeholder="Nome da rua" />
                </div>
              </div>

              <!-- Nº/Andar -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-building info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Nº/Andar</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.addressDetails || '—' }}</span>
                  <input v-else v-model="profileForm.addressDetails" type="text" class="info-input" placeholder="Nº, andar" />
                </div>
              </div>

              <!-- Código Postal -->
              <div class="info-row">
                <div class="info-icon-wrap"><i class="bi bi-envelope info-icon"></i></div>
                <div class="info-content">
                  <span class="info-label">Código Postal</span>
                  <span v-if="!isEditingProfile" class="info-value">{{ profileForm.postalCode || '—' }}</span>
                  <input v-else v-model="profileForm.postalCode" type="text" class="info-input" placeholder="0000-000" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Footer CTA Section -->
    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />

    <!-- Rating Modal -->
    <div v-if="ratingOrder" class="modal-overlay" @click.self="closeRatingModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Classificar Encomenda #{{ ratingOrder.order_id }}</h3>
          <button class="btn-close" @click="closeRatingModal"><i class="bi bi-x-lg"></i></button>
        </div>
        
        <div class="modal-body">
          <p class="rating-desc">Como avalia a sua experiência de entrega?</p>
          
          <div class="stars-selector">
            <i 
              v-for="n in 5" 
              :key="n" 
              class="bi" 
              :class="(hoverRating || ratingForm.stars) >= n ? 'bi-star-fill' : 'bi-star'"
              @mouseenter="hoverRating = n"
              @mouseleave="hoverRating = 0"
              @click="ratingForm.stars = n"
            ></i>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Notas (Opcional)</label>
            <textarea 
              v-model="ratingForm.notes" 
              class="form-textarea" 
              placeholder="O que correu bem ou mal?"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Fotografia (Opcional)</label>
            <input 
              type="file" 
              class="form-file" 
              accept="image/*"
              @change="handleFileUpload"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel-modal" @click="closeRatingModal">Cancelar</button>
          <button class="btn-submit-modal" :disabled="ratingForm.stars === 0 || isSubmittingRating" @click="submitRating">
            <i class="bi bi-arrow-repeat spin" v-if="isSubmittingRating"></i>
            {{ isSubmittingRating ? 'A enviar...' : 'Enviar Avaliação' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import HomeHeader from "@/components/home/HomeHeader.vue";
import BottomNav from "@/components/BottomNav.vue";
import { useAuthStore } from "@backend/auth/authStore";
import { strapiGet, strapiPut, mapOrder, STRAPI_URL } from "@shared/utils/strapi";

const $router = useRouter();
const authStore = useAuthStore();

const currentClientId = ref(null);
const clientName = ref('');
const isEditingProfile = ref(false);

const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressStreet: '',
  addressDetails: '',
  postalCode: ''
});

let profileSnapshot = { ...profileForm.value };

const allOrders = ref([]);

const activeOrder = computed(() => {
  // Encomenda ativa = qualquer estado que não seja finalizado
  const DONE = ['completed', 'concluída', 'concluido', 'concluida', 'delivered', 'entregue'];
  return allOrders.value.find(order => !DONE.includes((order.status || '').toLowerCase()));
});

const pastOrders = computed(() => {
  // Encomendas passadas = todos os estados finalizados
  const DONE = ['completed', 'concluída', 'concluido', 'concluida', 'delivered', 'entregue'];
  return allOrders.value.filter(order => DONE.includes((order.status || '').toLowerCase()));
});

const showAllPastOrders = ref(false);
const displayedPastOrders = computed(() => {
  if (showAllPastOrders.value) {
    return pastOrders.value;
  }
  return pastOrders.value.slice(0, 2);
});

const progressStep = computed(() => {
  if (!activeOrder.value) return 0;
  const status = (activeOrder.value.status || '').trim().toLowerCase().replace(' ', '_');

  if (['arrived', 'no_destino'].includes(status)) return 4;
  if (['in_traffic', 'em_transito', 'em_trânsito', 'transito', 'a_caminho'].includes(status)) return 3;
  if (['collecting', 'em_recolha'].includes(status)) return 2;
  
  return 1;
});

const progressPercentage = computed(() => {
  switch (progressStep.value) {
    case 1: return 0;
    case 2: return 33;
    case 3: return 66;
    case 4: return 100;
    default: return 0;
  }
});

onMounted(async () => {
  const userEmail = authStore.user?.email;
  if (!userEmail) return;
  
  try {
    const response = await strapiGet(`/api/clients?filters[email][$eq]=${encodeURIComponent(userEmail)}`);
    const c = Array.isArray(response?.data) ? response.data[0] : null;
    
    if (c) {
      currentClientId.value = c.documentId ?? c.id ?? null;
      
      profileForm.value = {
        firstName: c.first_name ?? '',
        lastName: c.last_name ?? '',
        email: c.email ?? userEmail,
        phone: String(c.phone_number ?? ''),
        addressStreet: c.street ?? '',
        addressDetails: String(c.number_floor ?? ''),
        postalCode: String(c.postal_code ?? '')
      };
      
      const first = c.first_name ?? '';
      const last = c.last_name ?? '';
      if (first || last) {
        clientName.value = `${first} ${last}`.trim();
      } else {
        clientName.value = userEmail;
      }
      
      profileSnapshot = { ...profileForm.value };
      
      // Now fetch orders using the client documentId
      try {
        const ordersRes = await strapiGet(`/api/orders?filters[client_id][documentId][$eq]=${currentClientId.value}&populate=*`);
        if (ordersRes && ordersRes.data) {
          allOrders.value = ordersRes.data.map(mapOrder);
        }
      } catch (err) {
        console.error('[ClientArea] Error fetching orders:', err);
      }
    }
  } catch (err) {
    console.error('[ClientArea] Error fetching client data:', err);
  }
});

function toggleEdit() {
  isEditingProfile.value = true;
}

async function saveProfile() {
  if (!currentClientId.value) {
    console.error('[ClientArea] Cannot save profile: No currentClientId found.');
    alert('Erro de sessão. Por favor, recarregue a página e tente novamente.');
    return;
  }

  try {
    const payload = {
      first_name: profileForm.value.firstName,
      last_name: profileForm.value.lastName,
      email: profileForm.value.email,
      phone_number: profileForm.value.phone ? Number(profileForm.value.phone) : null,
      street: profileForm.value.addressStreet || null,
      number_floor: profileForm.value.addressDetails || null,
      postal_code: profileForm.value.postalCode ? Number(profileForm.value.postalCode.replace('-', '')) : null,
    };

    await strapiPut(`/api/clients/${currentClientId.value}`, payload);
    
    // Update local state on success
    profileSnapshot = { ...profileForm.value };
    
    const first = profileForm.value.firstName;
    const last = profileForm.value.lastName;
    clientName.value = (first || last) ? `${first} ${last}`.trim() : profileForm.value.email;

    isEditingProfile.value = false;
  } catch (error) {
    console.error('[ClientArea] Error saving profile:', error);
    alert('Erro ao guardar as alterações na sua conta.');
  }
}

function cancelEdit() {
  profileForm.value = { ...profileSnapshot };
  isEditingProfile.value = false;
}

// Rating Logic
const ratingOrder = ref(null);
const hoverRating = ref(0);
const isSubmittingRating = ref(false);
const ratingForm = ref({
  stars: 0,
  notes: '',
  file: null
});

function openRatingModal(order) {
  ratingOrder.value = order;
  ratingForm.value = { stars: 0, notes: '', file: null };
  hoverRating.value = 0;
}

function closeRatingModal() {
  ratingOrder.value = null;
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    ratingForm.value.file = file;
  }
}

async function submitRating() {
  if (!ratingOrder.value || ratingForm.value.stars === 0) return;
  
  isSubmittingRating.value = true;
  try {
    let imageId = null;

    // Upload image if present
    if (ratingForm.value.file) {
      const formData = new FormData();
      formData.append('files', ratingForm.value.file);
      
      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.length > 0) {
          imageId = uploadData[0].id;
        }
      } else {
        const errText = await uploadRes.text();
        console.error('[ClientArea] Failed to upload image:', uploadRes.status, errText);
        alert(`Não foi possível enviar a fotografia (Erro ${uploadRes.status}). A tentar guardar apenas a avaliação.`);
      }
    }

    // Update order
    const payload = {
      classification: ratingForm.value.stars,
      notes: ratingForm.value.notes
    };
    
    if (imageId) {
      payload.image = [imageId]; // Strapi often prefers an array for media relations even if multiple is false
    }

    const orderDocId = ratingOrder.value.documentId;
    await strapiPut(`/api/orders/${orderDocId}`, payload);
    
    // Update local state
    const targetOrder = allOrders.value.find(o => o.documentId === orderDocId);
    if (targetOrder) {
      targetOrder.classification = ratingForm.value.stars;
      targetOrder.notes = ratingForm.value.notes;
    }

    closeRatingModal();
    alert('Avaliação enviada com sucesso! Obrigado.');
  } catch (error) {
    console.error('[ClientArea] Error submitting rating:', error);
    alert('Ocorreu um erro ao enviar a avaliação.');
  } finally {
    isSubmittingRating.value = false;
  }
}

async function logout() {
  await authStore.logout();
  $router.push('/login');
}
</script>

<style scoped>
.client-area-container {
  background-color: white;
  
}

.client-area-main {
  width: 100%;
  background-color: white;
  padding: 40px 16px;
  max-width: 1440px;
  margin: 0 auto;
}

/* Custom Grid Implementation */
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 32px;
}
@media (min-width: 1024px) {
  .profile-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 0 32px;
  text-align: center;
  border-bottom: 1px solid var(--border-lighter);
}
@media (min-width: 1024px) {
  .profile-header {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 28px;
  }
}

.avatar-wrapper { position: relative; margin-bottom: 4px; }
.avatar {
  width: 88px; height: 88px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
@media (min-width: 600px) {
  .avatar { width: 100px; height: 100px; }
  .avatar i { font-size: 52px; }
}
.avatar i { font-size: 44px; color: white; line-height: 1; }

.header-text { display: flex; flex-direction: column; gap: 4px; }
.profile-name {
  font-family: 'Public Sans', sans-serif; font-size: 28px;
  font-weight: 800; color: var(--dark-text); margin: 0; letter-spacing: -0.5px;
}
.profile-role { font-family: 'Public Sans', sans-serif; font-size: 14px; color: var(--light-text); margin: 0; font-weight: 500; }

/* Sections */
.profile-section {
  background-color: white; border: 1px solid var(--border-lighter); border-radius: 14px;
  padding: 24px; transition: all 0.2s ease;
}
.profile-section:hover { border-color: rgba(253,94,58,.2); }

.section-header-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}

.section-title {
  font-family: 'Public Sans', sans-serif; font-size: 16px; font-weight: 700; color: var(--dark-text); margin: 0;
}

.edit-actions { display: flex; gap: 8px; align-items: center; }
.btn-edit {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background-color: transparent;
  border: 1px solid var(--primary-color); border-radius: 8px; color: var(--primary-color);
  font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-edit:hover { background-color: rgba(253,94,58,.08); }
.btn-cancel {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background-color: transparent;
  border: 1px solid var(--border-color); border-radius: 8px; color: var(--light-text);
  font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-cancel:hover { background-color: var(--bg-lightest); }

/* Info list */
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid #f5f5f5;
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.info-icon-wrap {
  width: 40px; height: 40px; background-color: rgba(253,94,58,.08);
  border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.info-icon { font-size: 18px; color: var(--primary-color); }
.info-content { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.info-label {
  font-family: 'Public Sans', sans-serif; font-size: 11px; font-weight: 700;
  color: var(--light-text); text-transform: uppercase; letter-spacing: 0.5px;
}
.info-value { font-family: 'Public Sans', sans-serif; font-size: 15px; font-weight: 500; color: var(--dark-text); }
.info-input {
  font-family: 'Public Sans', sans-serif; font-size: 14px; font-weight: 500;
  color: var(--dark-text); border: 1px solid var(--border-color); border-radius: 8px;
  padding: 8px 12px; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s;
}
.info-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(253,94,58,.1); }

/* ===== ACTIVE ORDER SECTION ===== */
.active-order-section {
  background-color: white;
  padding: 24px;
  border-radius: 14px;
  margin-bottom: 0;
  border: 1px solid var(--border-lighter);
  transition: all 0.2s ease;
}
.active-order-section:hover { border-color: rgba(253,94,58,.2); }

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-badge {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--primary-color);
  text-transform: uppercase;
  padding: 4px 12px;
  background-color: rgba(253, 94, 58, 0.08);
  border-radius: 6px;
  width: fit-content;
}

.order-title {
  font-family: "Public Sans", sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  line-height: 1.2;
}

.delivery-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.time-label {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--light-text);
  margin: 0;
}

.time-value {
  font-family: "Public Sans", sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

/* Progress Bar */
.progress-container {
  margin-bottom: 32px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.progress-label {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--dark-text);
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.progress-label.label-active {
  color: var(--primary-color);
}

.progress-bar {
  position: relative;
  height: 12px;
  background-color: var(--border-lighter);
  border-radius: 99px;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color) 0%,
    var(--primary-color) 50%,
    rgba(253, 94, 58, 0.3) 100%
  );
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-indicator {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: white;
  border: 3px solid var(--primary-color);
  border-radius: 50%;
  z-index: 3;
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Track Button */
.btn-track-order {
  width: 100%;
  padding: 16px 24px;
  background-color: var(--primary-color);
  color: white;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(253, 94, 58, 0.2);
}

.btn-track-order:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 12px 18px -3px rgba(253, 94, 58, 0.3);
}

.btn-track-order:active {
  transform: translateY(0);
}

/* ===== PAST DELIVERIES SECTION ===== */
.past-deliveries-section {
  padding: 0;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0;
}

.section-title {
  font-family: "Public Sans", sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
}

.view-all-link {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background-color: white;
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto auto;
  gap: 8px 24px;
}

.order-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.1);
}

.order-card-header {
  grid-column: 1 / 3;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}

.order-number {
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  flex: 1;
}

.order-price {
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  text-align: right;
}

.order-meta {
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--light-text);
  margin: 0;
  grid-column: 1 / 3;
}

.btn-reorder {
  padding: 6px 12px;
  background-color: transparent;
  color: var(--primary-color);
  font-family: "Public Sans", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: 1;
  width: fit-content;
  justify-self: start;
}

.btn-reorder:hover {
  background-color: rgba(253, 94, 58, 0.08);
  border-color: var(--primary-color);
  color: var(--primary-dark);
}

.btn-reorder:active {
  transform: scale(0.98);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .client-area-main {
    padding: 24px 16px 80px;
  }

  .content-wrapper {
    padding: 0;
  }

  .active-order-section {
    padding: 24px 16px;
    margin-bottom: 40px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .delivery-time {
    align-self: flex-start;
    text-align: left;
  }

  .order-title {
    font-size: 28px;
    line-height: 1.3;
  }

  .time-value {
    font-size: 24px;
  }

  .section-title {
    font-size: 24px;
  }

  .past-deliveries-section {
    padding: 0 16px;
  }

  .order-card {
    padding: 16px;
    gap: 12px 16px;
  }

  .order-card-header {
    grid-column: 1 / 3;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .order-number {
    font-size: 16px;
  }

  .order-price {
    font-size: 16px;
    text-align: right;
    flex-shrink: 0;
  }

  .order-meta {
    grid-column: 1 / 3;
  }

  .btn-track-order {
    padding: 14px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .client-area-main {
    padding: 16px 12px 80px;
  }

  .active-order-section {
    padding: 16px 12px;
    margin-bottom: 32px;
  }

  .order-badge {
    font-size: 11px;
  }

  .order-title {
    font-size: 22px;
  }

  .time-label {
    font-size: 12px;
  }

  .time-value {
    font-size: 20px;
  }

  .progress-label {
    font-size: 10px;
  }

  .section-title {
    font-size: 20px;
  }

  .past-deliveries-section {
    padding: 0 12px;
  }

  .order-card {
    padding: 12px;
    gap: 10px 12px;
  }

  .order-card-header {
    grid-column: 1 / 3;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
  }

  .order-number {
    font-size: 14px;
  }

  .order-price {
    font-size: 14px;
    flex-shrink: 0;
  }

  .order-meta {
    font-size: 12px;
    grid-column: 1 / 3;
  }

  .btn-reorder {
    font-size: 10px;
    padding: 4px 8px;
  }

  .btn-track-order {
    padding: 12px 12px;
    font-size: 12px;
  }
}

/* Smartphone landscape mode */
@media (max-height: 500px) and (orientation: landscape) {
  .active-order-section {
    margin-bottom: 24px;
  }

  .btn-track-order {
    padding: 12px 16px;
  }
}
.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  background-color: #fff5f5;
  color: #ef4444;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  font-family: 'Public Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal-content {
  background: white; border-radius: 16px; width: 100%; max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  padding: 20px; border-bottom: 1px solid var(--border-lighter);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { margin: 0; font-family: 'Public Sans', sans-serif; font-size: 18px; font-weight: 700; color: var(--dark-text); }
.btn-close { background: none; border: none; font-size: 18px; color: var(--light-text); cursor: pointer; }
.btn-close:hover { color: var(--dark-text); }

.modal-body { padding: 24px 20px; }
.rating-desc { margin: 0 0 16px; font-family: 'Public Sans', sans-serif; font-size: 14px; color: var(--light-text); text-align: center; }

.stars-selector { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
.stars-selector i { font-size: 36px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease; }
.stars-selector i.bi-star-fill { color: #FFB800; }

.form-label { display: block; font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--dark-text); margin-bottom: 8px; }
.form-textarea { width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-family: 'Public Sans', sans-serif; font-size: 14px; outline: none; resize: vertical; }
.form-textarea:focus { border-color: var(--primary-color); }
.form-file { width: 100%; font-family: 'Public Sans', sans-serif; font-size: 14px; color: var(--light-text); }
.form-file::file-selector-button { padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: white; color: var(--dark-text); font-family: 'Public Sans', sans-serif; font-weight: 600; cursor: pointer; margin-right: 12px; transition: background 0.2s; }
.form-file::file-selector-button:hover { background: var(--bg-lightest); }

.modal-footer {
  padding: 16px 20px; border-top: 1px solid var(--border-lighter);
  display: flex; justify-content: flex-end; gap: 12px;
}
.btn-cancel-modal { padding: 10px 16px; border: 1px solid var(--border-color); background: white; border-radius: 8px; font-family: 'Public Sans', sans-serif; font-size: 14px; font-weight: 600; color: var(--light-text); cursor: pointer; }
.btn-cancel-modal:hover { background: var(--bg-lightest); }
.btn-submit-modal { padding: 10px 16px; border: none; background: var(--primary-color); border-radius: 8px; font-family: 'Public Sans', sans-serif; font-size: 14px; font-weight: 600; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
.btn-submit-modal:hover:not(:disabled) { background: var(--primary-dark); }
.btn-submit-modal:disabled { opacity: 0.5; cursor: not-allowed; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
