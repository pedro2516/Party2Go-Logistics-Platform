<template>
  <div class="profile-page">
    <main class="profile-main">

      <!-- Loading -->
      <div v-if="isLoading" class="state-message" style="min-height: 50vh;">
        <i class="bi bi-arrow-repeat spin"></i>
        <span>A carregar perfil...</span>
      </div>      <template v-else>
        <!-- Profile Header -->
        <section class="profile-header">
          <div class="header-main-info">
            <div class="avatar-wrapper">
              <div class="avatar"><i class="bi bi-person-fill"></i></div>
              <div class="online-indicator" :class="isOnline ? 'indicator--online' : 'indicator--offline'"></div>
            </div>
            <div class="header-text">
              <h1 class="profile-name">{{ displayName }}</h1>
              <p class="profile-role">Estafeta · {{ form.courier_id || '—' }}</p>
              <span class="profile-status-badge" :class="isOnline ? 'badge--online' : 'badge--offline'">
                <span class="badge-dot"></span>
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Stats Row -->
        <section class="row m-0 w-100 g-3 mb-4">
          <div class="col-4">
            <div class="stat-card h-100">
              <span class="stat-value">{{ totalDeliveries }}</span>
              <span class="stat-label">TOTAL ENTREGAS</span>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-card h-100">
              <span class="stat-value">{{ courierProfile?.rating || '0.0' }}</span>
              <span class="stat-label">CLASSIFICAÇÃO</span>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-card h-100">
              <span class="stat-value">{{ thisMonthDeliveries }}</span>
              <span class="stat-label">ESTE MÊS</span>
            </div>
          </div>
        </section>

        <!-- Global Edit Actions -->
        <div class="edit-actions-global-row">
          <button v-if="editMode" class="btn-cancel" @click="cancelEdit">
            <i class="bi bi-x"></i> Cancelar
          </button>
          <button class="btn-edit-global" :disabled="isSaving" @click="editMode ? saveProfile() : (editMode = true)">
            <i :class="editMode ? 'bi-check-lg' : 'bi-pencil-fill'"></i>
            {{ isSaving ? 'A guardar…' : editMode ? 'Guardar' : 'Editar' }}
          </button>
        </div>

        <!-- Save banners -->
        <div v-if="saveError" class="banner banner--error">
          <i class="bi bi-exclamation-circle"></i> {{ saveError }}
        </div>
        <div v-if="saveSuccess" class="banner banner--success">
          <i class="bi bi-check-circle"></i> Perfil guardado com sucesso!
        </div>

        <!-- ── Split Grid ──────────────────────────────────────────── -->
        <div class="row m-0 w-100 g-4 mt-2">

          <!-- Left column (2/3): Dados Pessoais + Veículo -->
          <div class="col-12 col-lg-8 d-flex flex-column">

            <!-- Dados Pessoais -->
            <section class="profile-section">
              <div class="section-header-row">
                <h2 class="section-title">Dados Pessoais</h2>
                <div class="edit-actions" v-if="false">
                  <button v-if="editMode" class="btn-cancel" @click="cancelEdit">
                    <i class="bi bi-x"></i> Cancelar
                  </button>
                  <button class="btn-edit" :disabled="isSaving" @click="editMode ? saveProfile() : (editMode = true)">
                    <i :class="editMode ? 'bi bi-check-lg' : 'bi bi-pencil'"></i>
                    {{ isSaving ? 'A guardar…' : editMode ? 'Guardar' : 'Editar' }}
                  </button>
                </div>
              </div>

              <!-- Unified Name Row -->
              <div class="info-row info-row--name-unified">
                <div class="info-icon-wrap"><i class="bi bi-person info-icon"></i></div>
                <div class="info-content name-content-unified">
                  <div class="name-field-block">
                    <span class="info-label">Primeiro Nome</span>
                    <span v-if="!editMode" class="info-value">{{ form.first_name || '—' }}</span>
                    <input v-else v-model="form.first_name" type="text" class="info-input" placeholder="Primeiro nome" />
                  </div>
                  <div class="name-field-block">
                    <span class="info-label">Apelido</span>
                    <span v-if="!editMode" class="info-value">{{ form.last_name || '—' }}</span>
                    <input v-else v-model="form.last_name" type="text" class="info-input" placeholder="Apelido" />
                  </div>
                </div>
              </div>

              <!-- Email full width -->
              <div class="info-list">
                <div class="info-row">
                  <div class="info-icon-wrap"><i class="bi bi-envelope info-icon"></i></div>
                  <div class="info-content">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ form.email || '—' }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Veículo -->
            <section class="profile-section">
              <div class="section-header-row">
                <h2 class="section-title">Veículo</h2>
              </div>
              <div class="info-list">
                <div class="info-row">
                  <div class="info-icon-wrap"><i class="bi bi-truck info-icon"></i></div>
                  <div class="info-content">
                    <span class="info-label">Descrição do Veículo</span>
                    <span class="info-value">{{ form.vehicle || '—' }}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon-wrap"><i class="bi bi-hash info-icon"></i></div>
                  <div class="info-content">
                    <span class="info-label">Matrícula</span>
                    <span class="info-value">{{ form.licence_plate || '—' }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Logout – desktop only -->
            <div class="logout-desktop mt-4" style="margin-bottom: 24px;">
              <button class="btn-logout" @click="handleLogout">
                <i class="bi bi-box-arrow-right"></i> Terminar Sessão
              </button>
            </div>
          </div>

          <!-- Right column (1/3): Capacidades -->
          <div class="col-12 col-lg-4 d-flex flex-column">
            <section class="profile-section">
              <div class="section-header-row">
                <h2 class="section-title">Especialidades</h2>
                <span class="section-subtitle">{{ form.tags.length }} selecionadas</span>
              </div>
              <div class="tags-grid">
                <label
                  v-for="tag in AVAILABLE_TAGS"
                  :key="tag.id"
                  class="tag-card"
                  :class="{ 'tag-card--active': form.tags.includes(tag.id), 'tag-card--disabled': true }"
                >
                  <input
                    type="checkbox"
                    class="tag-checkbox"
                    :value="tag.id"
                    :checked="form.tags.includes(tag.id)"
                    disabled
                  />
                  <i :class="['tag-icon', 'bi', tag.icon]"></i>
                  <div class="tag-body">
                    <span class="tag-name">{{ tag.label }}</span>
                    <span class="tag-desc">{{ tag.desc }}</span>
                  </div>
                  <i v-if="form.tags.includes(tag.id)" class="bi bi-check-circle-fill tag-check"></i>
                </label>
              </div>
            </section>
          </div>
        </div>
        <!-- ── End Split Grid ─────────────────────────────────────── -->

        <!-- Logout – mobile only (below grid) -->
        <div class="logout-mobile mt-4" style="margin-bottom: 24px;">
          <button class="btn-logout" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Terminar Sessão
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStatusStore, useCourierStore } from '../stores/index.js'
import { storeToRefs } from 'pinia'
import { strapiGet, mapOrder } from '@shared/utils/strapi.js'
import { auth } from '@backend/firebase'

const router = useRouter()

const AVAILABLE_TAGS = [
  {
    id: 'superficie_estavel',
    label: 'Superfície Estável',
    icon: 'bi-layers',
    desc: 'Mala ou suporte 100% nivelado para transportar bolos sem danos.',
  },
  {
    id: 'carga_pesada',
    label: 'Carga Pesada',
    icon: 'bi-shop-window',
    desc: 'Capacidade física (e carrinho de mão) para descarregar insufláveis pesados sozinho.',
  },
  {
    id: 'suporta_volumosos',
    label: 'Suporta Volumosos',
    icon: 'bi-box-seam',
    desc: 'Veículo completamente livre para balões cheios ou painéis decorativos.',
  },
  {
    id: 'alimentar_higiene',
    label: 'Alimentar / Higiene',
    icon: 'bi-cake',
    desc: 'Veículo cumpre normas de higiene para transportar comida (bolos, pipocas, algodão doce).',
  },
  {
    id: 'servico_instalacao',
    label: 'Serviço de Instalação',
    icon: 'bi-gear',
    desc: 'Formação básica para ligar máquinas de pipocas ou encher/fixar insufláveis no chão.',
  },
]

const statusStore = useStatusStore()
const { isOnline } = storeToRefs(statusStore)

const courierStore = useCourierStore()
const { courierProfile, displayName } = storeToRefs(courierStore)

const isLoading = ref(true)
const isSaving = ref(false)
const editMode = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

// Editable form state
const form = ref({
  courier_id: '',
  first_name: '',
  last_name: '',
  email: '',
  vehicle: '',
  licence_plate: '',
  tags: [],
})

// Snapshot for cancel
let snapshot = null

function populateForm(profile) {
  if (!profile) return
  form.value = {
    courier_id: profile.courier_id ?? '',
    first_name: profile.firstName ?? '',
    last_name: profile.lastName ?? '',
    email: profile.email ?? '',
    vehicle: profile.vehicleBrand ?? '',
    licence_plate: profile.licencePlate ?? '',
    tags: Array.isArray(profile.tags) ? [...profile.tags] : [],
  }
}

function cancelEdit() {
  if (snapshot) form.value = { ...snapshot, tags: [...snapshot.tags] }
  editMode.value = false
  saveError.value = ''
}

function toggleTag(tagId) {
  const idx = form.value.tags.indexOf(tagId)
  if (idx === -1) form.value.tags.push(tagId)
  else form.value.tags.splice(idx, 1)
}

async function saveProfile() {
  saveError.value = ''
  saveSuccess.value = false
  isSaving.value = true
  try {
    await courierStore.updateCourierProfile({
      first_name: form.value.first_name,
      last_name: form.value.last_name,
    })
    // Re-populate from updated profile
    populateForm(courierStore.courierProfile)
    snapshot = { ...form.value, tags: [...form.value.tags] }
    editMode.value = false
    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch (err) {
    console.error('[Profile] Save error:', err)
    saveError.value = 'Erro ao guardar. Tenta novamente.'
  } finally {
    isSaving.value = false
  }
}

async function handleLogout() {
  try {
    const { signOut } = await import('firebase/auth')
    if (auth) await signOut(auth)
  } catch (e) {
    console.warn('[Profile] logout error:', e)
  }
  courierStore.logout()
  router.push('/login')
}

// Stats
const totalDeliveries = ref(0)
const thisMonthDeliveries = ref(0)

async function fetchStats() {
  try {
    if (!courierProfile.value || !courierProfile.value.documentId) return
    
    const path = `/api/orders?filters[courier_id][documentId][$eq]=${courierProfile.value.documentId}&populate=*`
    const json = await strapiGet(path)
    const all = (json.data ?? []).map(mapOrder)
    
    // We count 'completed' or 'delivered' or 'entregue'
    const completed = all.filter((o) => ['completed', 'delivered', 'entregue'].includes(o.status))
    
    totalDeliveries.value = completed.length
    const now = new Date()
    thisMonthDeliveries.value = completed.filter((o) => {
      // Use updatedAt or date
      const dateToUse = o.updatedAt || o.date
      if (!dateToUse) return false
      const d = new Date(dateToUse)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  } catch (err) {
    console.warn('[PWA Profile] fetchStats error:', err)
  }
}

onMounted(async () => {
  // Load courier profile from Strapi if not yet in store
  if (!courierProfile.value) {
    // auth.currentUser is available synchronously once Firebase is initialised
    const email = auth?.currentUser?.email
    if (email) {
      await courierStore.resolveCourierFromStrapi(email)
    }
  }
  populateForm(courierProfile.value)
  snapshot = { ...form.value, tags: [...(form.value.tags ?? [])] }
  isLoading.value = false
  fetchStats()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css');

.profile-page {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.profile-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 100px;
  gap: 0;
  width: 100%;
  max-width: 1440px; /* Matched to Business Header */
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

/* ── Split Grid ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  align-items: start;
  margin-top: 0;
}

.col-left {
  display: flex;
  flex-direction: column;
}

.col-right {
  display: flex;
  flex-direction: column;
}

/* Name grid: side-by-side first/last name on md+ */
.name-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin-bottom: 0;
}

/* Logout visibility */
.logout-desktop { display: none; }
.logout-mobile  { display: block; }

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  font-family: 'Public Sans', sans-serif;
  font-size: 14px;
  color: #67737e;
}
.spin { animation: spin 1s linear infinite; font-size: 28px; color: #fd5e3a; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Banners */
.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.banner--error { background: #fff1f2; border: 1px solid #fecdd3; color: #dc2626; }
.banner--success { background: #f0faf3; border: 1px solid #bbf7d0; color: #166534; }

/* Header */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0 32px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
}
.header-main-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.edit-actions-global-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 8px 0 24px;
  width: 100%;
}
.btn-edit-global {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #fd5e3a;
  border: none;
  border-radius: 8px;
  color: white;
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.2);
  transition: all 0.2s ease;
}
.btn-edit-global:hover:not(:disabled) {
  background-color: #e94f2b;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(253, 94, 58, 0.3);
}
.btn-edit-global:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.avatar-wrapper { position: relative; margin-bottom: 4px; }
.avatar {
  width: 88px; height: 88px;
  background-color: #fd5e3a;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.avatar i { font-size: 44px; color: white; line-height: 1; }
.online-indicator {
  position: absolute; bottom: 4px; right: 4px;
  width: 18px; height: 18px;
  border-radius: 50%; border: 3px solid white;
}
.indicator--online { background-color: #22c55e; }
.indicator--offline { background-color: #9ca3af; }
.profile-name {
  font-family: 'Public Sans', sans-serif; font-size: 24px;
  font-weight: 800; color: #103841; margin: 0; letter-spacing: -0.5px;
}
.profile-role { font-family: 'Public Sans', sans-serif; font-size: 13px; color: #67737e; margin: 0; }
.profile-status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 9999px;
  font-family: 'Public Sans', sans-serif; font-size: 12px; font-weight: 600;
  letter-spacing: 0.3px; margin-top: 4px;
}
.badge--online { background-color: #f0faf3; color: #166534; border: 1px solid #bbf7d0; }
.badge--offline { background-color: #f8f8f8; color: #6b7280; border: 1px solid #e5e7eb; }
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background-color: currentColor; }

/* Stats */
.stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin-bottom: 28px;
}
.stat-card {
  background-color: #f8f9fa; border: 1px solid #f0f0f0; border-radius: 12px;
  padding: 16px 8px; display: flex; flex-direction: column;
  align-items: center; gap: 4px; text-align: center;
  transition: all 0.2s ease;
}
.stat-card:hover { border-color: #fd5e3a; box-shadow: 0 2px 8px rgba(253,94,58,.1); }
.stat-value { font-family: 'Public Sans', sans-serif; font-size: 22px; font-weight: 800; color: #103841; line-height: 1; }
.stat-label { font-family: 'Public Sans', sans-serif; font-size: 9px; font-weight: 700; color: #67737e; text-transform: uppercase; letter-spacing: 0.5px; }

/* Sections */
.profile-section {
  background-color: white; border: 1px solid #f0f0f0; border-radius: 14px;
  padding: 20px; margin-bottom: 16px; transition: all 0.2s ease;
}
.profile-section:hover { border-color: rgba(253,94,58,.2); }
.profile-section--danger { border-color: #fecaca; }
.section-header-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.section-title { font-family: 'Public Sans', sans-serif; font-size: 15px; font-weight: 700; color: #103841; margin: 0; }
.section-subtitle { font-family: 'Public Sans', sans-serif; font-size: 12px; color: #67737e; }

.edit-actions { display: flex; gap: 8px; align-items: center; }
.btn-edit {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; background-color: transparent;
  border: 1px solid #fd5e3a; border-radius: 6px; color: #fd5e3a;
  font-family: 'Public Sans', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-edit:hover:not(:disabled) { background-color: rgba(253,94,58,.08); }
.btn-edit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; background-color: transparent;
  border: 1px solid #e0e0e0; border-radius: 6px; color: #67737e;
  font-family: 'Public Sans', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
}
.btn-cancel:hover { background-color: #f8f8f8; }

/* Info list */
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.info-icon-wrap {
  width: 36px; height: 36px; background-color: rgba(253,94,58,.08);
  border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.info-icon { font-size: 16px; color: #fd5e3a; }
.info-content { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.name-content-unified {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  width: 100%;
}
.name-field-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.info-label {
  font-family: 'Public Sans', sans-serif; font-size: 11px; font-weight: 700; /* Increased weight */
  color: #67737e; text-transform: uppercase; letter-spacing: 0.4px;
}
.info-value { font-family: 'Public Sans', sans-serif; font-size: 15px; font-weight: 500; color: #103841; } /* Increased size */
.info-input {
  font-family: 'Public Sans', sans-serif; font-size: 14px; font-weight: 500;
  color: #103841; border: 1px solid #e0e0e0; border-radius: 6px;
  padding: 6px 10px; outline: none; width: 100%; box-sizing: border-box; transition: border-color 0.2s;
}
.info-input:focus { border-color: #fd5e3a; box-shadow: 0 0 0 3px rgba(253,94,58,.1); }

/* Tags */
.tags-grid { display: flex; flex-direction: column; gap: 10px; }
.tag-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; border: 1.5px solid #f0f0f0; border-radius: 12px;
  cursor: pointer; transition: all 0.2s ease; position: relative;
  background: white;
}
.tag-card--active { border-color: #fd5e3a; background: rgba(253,94,58,.04); }
.tag-card--disabled { cursor: default; }
.tag-card:not(.tag-card--disabled):hover { border-color: #fd5e3a; box-shadow: 0 2px 8px rgba(253,94,58,.08); }
.tag-checkbox { position: absolute; opacity: 0; pointer-events: none; }
.tag-icon { font-size: 24px; flex-shrink: 0; color: #fd5e3a; line-height: 1; margin-top: 2px; }
.tag-body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.tag-name { font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 700; color: #103841; }
.tag-desc { font-family: 'Public Sans', sans-serif; font-size: 12px; color: #67737e; line-height: 1.4; }
.tag-check { color: #fd5e3a; font-size: 18px; flex-shrink: 0; margin-top: 2px; }

/* Logout */
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

/* Responsive */
@media (min-width: 600px) {
  .profile-main { padding: 32px 24px 80px; }
  .avatar { width: 100px; height: 100px; }
  .avatar i { font-size: 52px; }
  .profile-name { font-size: 28px; }
  /* Unified Name Layout side-by-side */
  .name-content-unified {
    flex-direction: row !important;
    gap: 24px !important;
    align-items: center !important;
  }
}

@media (min-width: 1024px) {
  .profile-main { padding: 40px 24px 60px; max-width: 1440px; } /* Set horizontal padding to 24px to match Header */
  /* Header: avatar left, text right */
  .profile-header {
    flex-direction: row !important;
    align-items: center !important;
    text-align: left !important;
    gap: 28px;
    padding: 0 0 40px;
    margin-bottom: 32px;
  }
  .header-main-info {
    flex-direction: row !important;
    align-items: center !important;
    gap: 28px !important;
  }
  .header-text { display: flex; flex-direction: column; gap: 4px; }
  .profile-status-badge { margin-top: 4px; }
  /* 2/3 + 1/3 split */
  .content-grid {
    grid-template-columns: 2fr 1fr;
    gap: 32px;
    margin-top: 8px;
  }
  /* Logout: show inside left col, hide mobile version */
  .logout-desktop { display: block; }
  .logout-mobile  { display: none; }
  /* Tags: single column in the narrow right panel */
  .tags-grid { display: flex; flex-direction: column; gap: 10px; }
}

@media (max-width: 380px) {
  .stats-row { gap: 8px; }
  .stat-value { font-size: 18px; }
  .stat-card { padding: 12px 6px; }
}
</style>
