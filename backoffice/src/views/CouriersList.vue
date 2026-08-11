<template>
  <div class="couriers-list">
    <!-- Header -->
    <Header />

    <!-- Mobile Bottom Nav -->
    <BackofficeBottomNav />

    <!-- Main Content -->
    <main class="couriers-main">
      <div
        class="container-fluid"
        style="max-width: 1440px; margin: 0 auto; padding: 40px 24px"
      >
        <!-- Page Title Section -->
        <div class="page-title-section mb-5">
          <h1 class="page-title">Gestão de Estafetas</h1>
          <p class="page-subtitle">
            Consulte o estado, disponibilidade e tarefas atribuídas à equipa.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="state-message">
          <i class="bi bi-arrow-repeat spin"></i>
          <span>A carregar estafetas...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="state-message state-error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ error }}</span>
          <button class="btn-retry" @click="fetchData">Tentar novamente</button>
        </div>

        <template v-else>


          <!-- Search & Filter Bar -->
          <div class="search-filter-container mb-4">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Pesquisar por nome, ID ou veículo..."
                class="search-input"
              />
            </div>
            <div class="filter-actions">
              <button 
                class="filter-btn" 
                :class="{ 'filter-btn--active': isFilterOpen || activeFilterCount > 0 }"
                @click="isFilterOpen = !isFilterOpen"
              >
                <i class="bi bi-funnel"></i>
                Filtros
                <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
              </button>
              <button v-if="activeFilterCount > 0" class="clear-btn" @click="clearFilters">
                Limpar
              </button>
            </div>
          </div>

          <!-- Advanced Filter Panel -->
          <transition name="fade-slide">
            <div v-if="isFilterOpen" class="filter-panel mb-5">
              <div class="filter-group">
                <h4 class="filter-title">Estado</h4>
                <div class="filter-options">
                  <button 
                    v-for="status in filterOptions.statuses" 
                    :key="status"
                    class="filter-pill"
                    :class="{ 'filter-pill--active': activeFilters.status === status }"
                    @click="activeFilters.status = status"
                  >
                    {{ status }}
                  </button>
                </div>
              </div>

              <div class="filter-group">
                <h4 class="filter-title">Especialidades (Tags)</h4>
                <div class="filter-options flex-wrap">
                  <button 
                    v-for="tag in filterOptions.tags" 
                    :key="tag"
                    class="filter-pill"
                    :class="{ 'filter-pill--active': activeFilters.tags.includes(tag) }"
                    @click="toggleTag(tag)"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>

              <div class="filter-group">
                <h4 class="filter-title">Carga de Trabalho (Entregas Ativas)</h4>
                <div class="filter-slider-container">
                  <div class="slider-header">
                    <span class="slider-min">0</span>
                    <span class="slider-max">4+</span>
                  </div>
                  <input 
                    type="range" 
                    v-model.number="activeFilters.minTasks" 
                    min="0" 
                    max="4" 
                    step="0.1"
                    class="filter-range"
                    :style="`background: linear-gradient(to right, #fd5e3a 0%, #fd5e3a ${(activeFilters.minTasks / 4) * 100}%, #e2e8f0 ${(activeFilters.minTasks / 4) * 100}%, #e2e8f0 100%)`"
                  />
                  <p class="slider-hint">Filtrar estafetas com pelo menos {{ Math.round(activeFilters.minTasks) }} entregas em curso.</p>
                </div>
              </div>
            </div>
          </transition>

        <!-- Couriers Grid -->
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-4 col-xl-3"
            v-for="courier in filteredCouriers"
            :key="courier.id"
          >
            <div class="courier-card h-100">
            <!-- Card Header: Avatar, Info, Menu -->
            <div class="card-header">
              <div class="avatar-section">
                <div class="avatar">
                  <i class="bi bi-person-fill" style="font-size: 24px; color: #94a3b8;"></i>
                </div>
              </div>
              <div class="info-section">
                <div class="name-id-row">
                  <h3 class="courier-name">{{ courier.name }}</h3>
                  <span class="courier-id-badge">#{{ courier.id }}</span>
                </div>
                <p class="vehicle-info">
                  <template v-if="courier.vehicleBrand">
                    <i class="bi bi-truck" style="margin-right: 4px;"></i>{{ courier.vehicleBrand }}
                    <span v-if="courier.licencePlate" style="margin-left: 6px; font-weight: 700;">· {{ courier.licencePlate }}</span>
                  </template>
                  <template v-else><span style="color: #cbd5e1;">Sem veículo atribuído</span></template>
                </p>
              </div>
              <div class="menu-wrapper">
                <button 
                  class="menu-btn" 
                  title="Opções" 
                  @click.stop="toggleMenu(courier.id)"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                
                <!-- Dropdown Menu -->
                <transition name="fade">
                  <div v-if="activeMenuId === courier.id" class="card-dropdown">
                    <button class="dropdown-item" @click.stop="editCourier(courier)">
                      <i class="bi bi-pencil"></i>
                      Editar Estafeta
                    </button>
                    <button class="dropdown-item" @click.stop="viewHistory(courier)">
                      <i class="bi bi-clock-history"></i>
                      Ver Histórico
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="status-section">
              <div
                :class="[
                  'status-badge',
                  `status-${courier.status.toLowerCase()}`,
                ]"
              >
                <span class="status-dot"></span>
                <span class="status-text">{{ courier.status }}</span>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-label">Tarefas Ativas</span>
                <span class="stat-value">{{ courier.activeTasks }} entregas</span>
              </div>
              <div class="stat-item" v-if="courier.ratingCount > 0">
                <span class="stat-label">Avaliação</span>
                <span class="stat-value"><i class="bi bi-star-fill" style="color: #FFB800; font-size: 12px; margin-right: 2px;"></i> {{ courier.rating }} ({{ courier.ratingCount }})</span>
              </div>
            </div>

            <!-- Tags Section -->
            <div v-if="courier.tags && courier.tags.length > 0" class="tags-section">
              <span v-for="tag in courier.tags" :key="tag" class="courier-tag">
                {{ formatTag(tag) }}
              </span>
            </div>

            <!-- Action Button -->
            <button class="action-button" @click="openChat(courier)">
              <i class="bi bi-chat-dots"></i>
              Abrir Conversa
              <span v-if="courier.hasUnread" class="unread-badge"></span>
            </button>
            </div>
          </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Edit Courier Modal -->
    <transition name="fade">
      <div v-if="editingCourier" class="modal-backdrop" @click="editingCourier = null">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Editar Estafeta</h2>
            <button class="modal-close-btn" @click="editingCourier = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome</label>
                <input type="text" v-model="editingCourier.firstName" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Apelido</label>
                <input type="text" v-model="editingCourier.lastName" class="form-input" />
              </div>
            </div>

            <!-- Vehicle Selector -->
            <div class="form-group">
              <label class="form-label">Veículo Atribuído</label>

              <div v-if="loadingVehicles" class="vehicle-loading">
                <i class="bi bi-arrow-repeat spin"></i> A carregar veículos...
              </div>

              <template v-else>
                <!-- Search within vehicles -->
                <div class="vehicle-search-wrap">
                  <i class="bi bi-search vehicle-search-icon"></i>
                  <input
                    v-model="vehicleSearch"
                    type="text"
                    placeholder="Pesquisar marca ou matrícula..."
                    class="form-input vehicle-search-input"
                  />
                </div>

                <div class="vehicle-picker">
                  <!-- None option -->
                  <button
                    type="button"
                    class="vehicle-option"
                    :class="{ 'vehicle-option--active': selectedVehicleDocumentId === null }"
                    @click="selectedVehicleDocumentId = null"
                  >
                    <div class="vehicle-option-icon">
                      <i class="bi bi-x-circle"></i>
                    </div>
                    <div class="vehicle-option-info">
                      <span class="vehicle-option-brand">Sem veículo</span>
                      <span class="vehicle-option-plate">Remover associação</span>
                    </div>
                    <i v-if="selectedVehicleDocumentId === null" class="bi bi-check-circle-fill vehicle-option-check"></i>
                  </button>

                  <!-- Available vehicles -->
                  <button
                    v-for="v in filteredAvailableVehicles"
                    :key="v.documentId"
                    type="button"
                    class="vehicle-option"
                    :class="{
                      'vehicle-option--active': selectedVehicleDocumentId === v.documentId,
                      'vehicle-option--taken': v.courierDocumentId && v.courierDocumentId !== editingCourier.documentId
                    }"
                    @click="selectedVehicleDocumentId = v.documentId"
                  >
                    <div class="vehicle-option-icon">
                      <i class="bi bi-truck"></i>
                    </div>
                    <div class="vehicle-option-info">
                      <span class="vehicle-option-brand">{{ v.brand || 'Sem marca' }}</span>
                      <span class="vehicle-option-plate">{{ v.licencePlate || '—' }}</span>
                      <span v-if="v.maxWeight" class="vehicle-option-detail">{{ v.maxWeight }} kg</span>
                    </div>
                    <span
                      v-if="v.courierDocumentId && v.courierDocumentId !== editingCourier.documentId"
                      class="vehicle-taken-badge"
                    >Em uso</span>
                    <i v-else-if="selectedVehicleDocumentId === v.documentId" class="bi bi-check-circle-fill vehicle-option-check"></i>
                  </button>

                  <div v-if="filteredAvailableVehicles.length === 0" class="vehicle-empty">
                    Nenhum veículo encontrado.
                  </div>
                </div>
              </template>
            </div>

            <div class="form-group">
              <label class="form-label">Especialidades (Tags) do Veículo</label>
              <div class="tag-selector readonly-tags">
                <button
                  v-for="tag in filterOptions.tags"
                  :key="tag"
                  type="button"
                  class="tag-option"
                  :class="{ 'tag-option--active': currentSelectedVehicleTags.includes(tag) }"
                  style="cursor: default;"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="editingCourier = null">Cancelar</button>
            <button class="btn-save" @click="saveCourier" :disabled="saving">
              <i v-if="saving" class="bi bi-arrow-repeat spin"></i>
              {{ saving ? 'A guardar...' : 'Guardar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Courier History Modal -->
    <transition name="fade">
      <div v-if="viewingHistoryCourier" class="modal-backdrop" @click="viewingHistoryCourier = null">
        <div class="modal-container history-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title-group">
              <h2 class="modal-title">Histórico de Entregas</h2>
              <p class="modal-subtitle">{{ viewingHistoryCourier.name }} (#{{ viewingHistoryCourier.id }})</p>
            </div>
            <button class="modal-close-btn" @click="viewingHistoryCourier = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div class="modal-body history-body">
            <!-- Loading State -->
            <div v-if="loadingHistory" class="history-state">
              <i class="bi bi-arrow-repeat spin"></i>
              <span>A carregar histórico...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="courierOrders.length === 0" class="history-state">
              <i class="bi bi-box-seam"></i>
              <span>Este estafeta ainda não realizou entregas.</span>
            </div>

            <!-- Orders List -->
            <div v-else class="orders-history-list">
              <div v-for="order in courierOrders" :key="order.id" class="history-order-item">
                <div class="order-item-main">
                  <div class="order-id-date">
                    <span class="order-id">{{ order.id }}</span>
                    <span class="order-date">{{ formatDate(order.date) }}</span>
                  </div>
                  <div class="order-address">
                    <i class="bi bi-geo-alt"></i>
                    {{ order.address }}
                  </div>
                </div>
                <div class="order-item-meta">
                  <span :class="['status-badge', `status-${order.status.toLowerCase()}`]">
                    {{ order.status }}
                  </span>
                  <span class="order-price">{{ formatPrice(order.price) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="viewingHistoryCourier = null">Fechar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Chat Modal -->
    <transition name="fade">
      <div v-if="activeChatCourier" class="modal-backdrop" @click="closeChat">
        <div class="modal-container chat-modal" @click.stop>
          <div class="modal-header">
            <div class="chat-header-info">
              <div class="chat-avatar">
                <img :src="activeChatCourier.avatar" :alt="activeChatCourier.name" />
              </div>
              <div class="chat-title-group">
                <h2 class="modal-title">{{ activeChatCourier.name }}</h2>
                <p class="modal-subtitle">Chat Privado</p>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeChat">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div class="modal-body chat-body" ref="chatBody">
            <div v-if="chatMessages.length === 0" class="chat-empty">
              <i class="bi bi-chat-dots"></i>
              <p>Inicie uma conversa com {{ activeChatCourier.firstName }}.</p>
            </div>
            
            <div v-else class="messages-list">
              <div 
                v-for="msg in chatMessages" 
                :key="msg.id" 
                :class="['message-wrapper', msg.sender === 'admin' ? 'sent' : 'received']"
              >
                <div class="message-bubble">
                  {{ msg.content }}
                  <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer chat-footer">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Escreva uma mensagem..." 
              class="chat-input"
              @keyup.enter="sendChatMessage"
            />
            <button class="btn-send" @click="sendChatMessage" :disabled="!newMessage.trim()">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import Header from "@/components/Header.vue";
import BackofficeBottomNav from "@/components/BackofficeBottomNav.vue";
import { strapiGet, strapiPut, strapiPost, mapCourier, mapOrder, mapVehicle } from "@shared/utils/strapi.js";

const $router = useRouter();
const searchQuery = ref("");
const isFilterOpen = ref(false);
const activeMenuId = ref(null);

// State
const couriers = ref([]);
const loading = ref(false);
const saving = ref(false);
const loadingHistory = ref(false);
const error = ref(null);
const editingCourier = ref(null);
const viewingHistoryCourier = ref(null);
const activeChatCourier = ref(null);
const courierOrders = ref([]);
const chatMessages = ref([]);
const newMessage = ref("");
let chatPolling = null;

// Vehicle picker state
const availableVehicles = ref([]);
const loadingVehicles = ref(false);
const vehicleSearch = ref("");
const selectedVehicleDocumentId = ref(null);

const tagToDisplay = {
  "superficie_estavel": "Superfície Estável",
  "carga_pesada": "Carga Pesada",
  "suporta_volumosos": "Suporta Volumosos",
  "alimentar_higiene": "Alimentar / Higiene",
  "servico_instalacao": "Serviço de Instalação"
};
const displayToTag = Object.fromEntries(Object.entries(tagToDisplay).map(([k,v]) => [v, k]));

function formatTag(rawTag) {
  return tagToDisplay[rawTag] || rawTag;
}

const currentSelectedVehicleTags = computed(() => {
  if (!selectedVehicleDocumentId.value) return [];
  const v = availableVehicles.value.find(v => v.documentId === selectedVehicleDocumentId.value);
  if (!v) return [];
  return v.tags.map(t => formatTag(t));
});

const filteredAvailableVehicles = computed(() => {
  const q = vehicleSearch.value.toLowerCase();
  return availableVehicles.value.filter(v =>
    !q ||
    v.brand.toLowerCase().includes(q) ||
    v.licencePlate.toLowerCase().includes(q)
  );
});

const filterOptions = {
  tags: [
    "Superfície Estável",
    "Carga Pesada",
    "Suporta Volumosos",
    "Alimentar / Higiene",
    "Serviço de Instalação",
  ],
  statuses: ["Todos", "Online", "Offline"],
};

const activeFilters = ref({
  status: "Todos",
  tags: [],
  minTasks: 0,
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (activeFilters.value.status !== "Todos") count++;
  count += activeFilters.value.tags.length;
  if (activeFilters.value.minTasks > 0) count++;
  return count;
});

function toggleTag(tag) {
  const index = activeFilters.value.tags.indexOf(tag);
  if (index === -1) {
    activeFilters.value.tags.push(tag);
  } else {
    activeFilters.value.tags.splice(index, 1);
  }
}

function clearFilters() {
  activeFilters.value = {
    status: "Todos",
    tags: [],
    minTasks: 0,
  };
  searchQuery.value = "";
}

function toggleMenu(id) {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
  } else {
    activeMenuId.value = id;
  }
}

async function editCourier(courier) {
  activeMenuId.value = null;
  // Clone the courier object to avoid direct mutation
  editingCourier.value = {
    ...courier,
    tags: [...courier.tags]
  };

  // Initialise vehicle selector with the courier's current vehicle
  selectedVehicleDocumentId.value = courier.vehicleDocumentId ?? null;
  vehicleSearch.value = "";

  // Fetch all vehicles dynamically
  loadingVehicles.value = true;
  try {
    const json = await strapiGet("/api/vehicle-ids?populate[courier][fields][0]=documentId&sort=brand:asc");
    availableVehicles.value = (json.data ?? []).map(mapVehicle);
  } catch (err) {
    console.error("[CouriersList] editCourier – fetch vehicles error:", err);
  } finally {
    loadingVehicles.value = false;
  }
}

async function saveCourier() {
  if (!editingCourier.value) return;

  saving.value = true;
  try {
    const previousVehicleDocId = editingCourier.value.vehicleDocumentId;
    const newVehicleDocId = selectedVehicleDocumentId.value;
    const vehicleChanged = previousVehicleDocId !== newVehicleDocId;

    // 1. Update basic courier fields (tags no longer live on courier — skip it)
    const courierPayload = {
      first_name: editingCourier.value.firstName,
      last_name: editingCourier.value.lastName,
    };
    await strapiPut(`/api/couriers/${editingCourier.value.documentId}`, courierPayload);

    // 2. The vehicle entity owns the FK (mappedBy: "courier" on vehicle side,
    //    inversedBy: "courier" on courier side). Strapi only persists from the
    //    owning side, so we must write to /api/vehicle-ids.
    if (vehicleChanged) {
      // Detach previous vehicle — clear its courier relation
      if (previousVehicleDocId) {
        await strapiPut(`/api/vehicle-ids/${previousVehicleDocId}`, {
          courier: { disconnect: [{ documentId: editingCourier.value.documentId }] },
        });
      }
      // Attach new vehicle — set its courier relation
      if (newVehicleDocId) {
        await strapiPut(`/api/vehicle-ids/${newVehicleDocId}`, {
          courier: { connect: [{ documentId: editingCourier.value.documentId }] },
        });
      }
    }

    // 3. Refresh to reflect changes
    await fetchData();
    editingCourier.value = null;
  } catch (err) {
    console.error("[CouriersList] saveCourier error:", err);
    alert(`Erro ao guardar alterações: ${err.message}`);
  } finally {
    saving.value = false;
  }
}

async function viewHistory(courier) {
  activeMenuId.value = null;
  viewingHistoryCourier.value = courier;
  courierOrders.value = [];
  loadingHistory.value = true;
  
  try {
    const path = `/api/orders?filters[courier_id][documentId][$eq]=${courier.documentId}&populate=*&sort=createdAt:desc`;
    const json = await strapiGet(path);
    courierOrders.value = (json.data ?? []).map(mapOrder);
  } catch (err) {
    console.error("[CouriersList] viewHistory error:", err);
    alert("Erro ao carregar histórico de entregas.");
  } finally {
    loadingHistory.value = false;
  }
}

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatPrice(price) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

// Chat Functionality
async function openChat(courier) {
  activeMenuId.value = null;
  activeChatCourier.value = courier;
  chatMessages.value = [];
  newMessage.value = "";
  
  await fetchChatMessages();
  
  // Start polling every 5 seconds
  if (chatPolling) clearInterval(chatPolling);
  chatPolling = setInterval(fetchChatMessages, 5000);
}

function closeChat() {
  activeChatCourier.value = null;
  if (chatPolling) {
    clearInterval(chatPolling);
    chatPolling = null;
  }
}

async function fetchChatMessages() {
  if (!activeChatCourier.value) return;
  
  try {
    const path = `/api/messages?filters[courier][documentId][$eq]=${activeChatCourier.value.documentId}&filters[order][id][$null]=true&sort=createdAt:asc&populate=*`;
    const json = await strapiGet(path);
    chatMessages.value = (json.data ?? []).map(m => ({
      id: m.id,
      content: m.content,
      sender: m.sender,
      timestamp: m.createdAt,
    }));

    // Mark unread messages sent by the courier as read
    const unread = (json.data ?? []).filter(m => m.sender === 'courier' && !m.is_read);
    for (const msg of unread) {
      await strapiPut(`/api/messages/${msg.documentId}`, { is_read: true });
    }

    if (unread.length > 0) {
      const index = couriers.value.findIndex(c => c.documentId === activeChatCourier.value.documentId);
      if (index !== -1) {
        couriers.value[index].hasUnread = false;
      }
    }
  } catch (err) {
    console.error("[CouriersList] fetchChatMessages error:", err);
  }
}

async function sendChatMessage() {
  if (!newMessage.value.trim() || !activeChatCourier.value) return;
  
  const text = newMessage.value;
  newMessage.value = ""; // Clear input immediately
  
  try {
    const payload = {
      content: text,
      sender: "admin",
      courier: activeChatCourier.value.documentId,
      is_read: false
    };
    
    await strapiPost("/api/messages", payload);
    await fetchChatMessages(); // Refresh list
  } catch (err) {
    console.error("[CouriersList] sendChatMessage error:", err);
    alert("Erro ao enviar mensagem.");
  }
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

// Close menu on click outside
onMounted(() => {
  window.addEventListener("click", () => {
    activeMenuId.value = null;
  });
});

// Search & Advanced filtering on live data
const filteredCouriers = computed(() => {
  return couriers.value.filter((courier) => {
    // 1. Text Search
    const query = searchQuery.value.toLowerCase();
    const matchesSearch = !query ||
      courier.name.toLowerCase().includes(query) ||
      courier.courier_id?.toString().includes(query) ||
      courier.vehicleBrand.toLowerCase().includes(query) ||
      courier.licencePlate.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    // 2. Status Filter
    if (activeFilters.value.status !== "Todos") {
      if (courier.status !== activeFilters.value.status) return false;
    }

    // 3. Tags Filter (AND logic: must have all selected tags)
    if (activeFilters.value.tags.length > 0) {
      const hasAllTags = activeFilters.value.tags.every(displayTag => {
        const rawTag = displayToTag[displayTag] || displayTag;
        return courier.tags.includes(rawTag) || courier.tags.includes(displayTag);
      });
      if (!hasAllTags) return false;
    }

    // 4. Min Tasks Filter (Range)
    if (activeFilters.value.minTasks > 0) {
      const min = Math.round(activeFilters.value.minTasks);
      if (courier.activeTasks < min) return false;
    }

    return true;
  });
});

async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const json = await strapiGet("/api/couriers?populate=*");
    const mappedCouriers = (json.data ?? []).map(mapCourier);

    // Fetch unread messages from couriers to admin
    const unreadPath = "/api/messages?filters[sender][$eq]=courier&filters[is_read][$eq]=false&filters[order][id][$null]=true&populate=*";
    const unreadJson = await strapiGet(unreadPath);
    const unreadMsgs = unreadJson.data ?? [];

    // Create a Set of courier documentIds with unread messages
    const unreadCourierIds = new Set(
      unreadMsgs
        .filter(m => m.courier?.documentId)
        .map(m => m.courier.documentId)
    );

    // Map the hasUnread field
    couriers.value = mappedCouriers.map(c => ({
      ...c,
      hasUnread: unreadCourierIds.has(c.documentId)
    }));
  } catch (err) {
    console.error("[CouriersList] fetchData error:", err);
    error.value = err.message ?? "Erro ao carregar estafetas.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* Main Content */
.couriers-main {
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

/* Page Title Section */
.page-title-section {
  text-align: left;
}

.page-title {
  font-size: 40px;
  font-weight: 800;
  color: #103841;
  margin: 0;
  margin-bottom: 12px;
  font-family: "Public Sans", sans-serif;
  line-height: 52px;
}

.page-subtitle {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  font-family: "Public Sans", sans-serif;
  line-height: 24px;
}

/* KPI Cards */
.kpi-row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.kpi-card {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7ff;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  margin-bottom: 12px;
}

.truck-icon {
  background-color: #fef3f0;
  color: #fd5e3a;
}

.package-icon {
  background-color: #f0f9f7;
  color: #103841;
}

.users-icon {
  background-color: #f0f3f9;
  color: #103841;
}

.pending-icon {
  background-color: #f9f3f0;
  color: #fd5e3a;
}

.kpi-content {
  width: 100%;
}

.kpi-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-family: "Public Sans", sans-serif;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #103841;
  margin: 0;
  font-family: "Public Sans", sans-serif;
}

/* Search & Filter Bar */
.search-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 16px;
  font-size: 16px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  background-color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: "Public Sans", sans-serif;
  color: #103841;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
  border: 1px solid #fd5e3a;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-btn {
  padding: 12px 20px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  font-family: "Public Sans", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
}

.filter-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.filter-btn--active {
  border-color: #fd5e3a;
  color: #fd5e3a;
  background-color: #fef3f0;
}

.filter-badge {
  background-color: #fd5e3a;
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: 4px;
}

.clear-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  text-decoration: underline;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #fd5e3a;
}

/* Filter Panel */
.filter-panel {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-title {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background-color: #e2e8f0;
}

.filter-pill--active {
  background-color: #fef3f0;
  color: #fd5e3a;
  border-color: #fd5e3a;
}

.filter-checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  font-weight: 600;
  color: #103841;
}

/* Range Slider */
.filter-slider-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "Public Sans", sans-serif;
}

.slider-min, .slider-max {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
}

.slider-hint {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.filter-range {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  outline: none;
}

.filter-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #fd5e3a;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(253, 94, 58, 0.3);
  transition: transform 0.2s;
}

.filter-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.filter-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #fd5e3a;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(253, 94, 58, 0.3);
}

/* Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Couriers Grid */
.couriers-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}

@media (min-width: 768px) {
  .couriers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .couriers-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .couriers-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Courier Card */
.courier-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7ff;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.courier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  flex: 1;
}

.courier-name {
  font-size: 15px;
  font-weight: 700;
  color: #103841;
  margin: 0;
  font-family: "Public Sans", sans-serif;
}

.name-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.courier-id-badge {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: "Public Sans", sans-serif;
}

.vehicle-info {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0 0 0;
  font-family: "Public Sans", sans-serif;
}

.menu-wrapper {
  position: relative;
}

.menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background-color: #f1f5f9;
  color: #103841;
}

/* Card Dropdown */
.card-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 100;
  overflow: hidden;
  margin-top: 4px;
}

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  font-family: "Public Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #fd5e3a;
}

.dropdown-item i {
  font-size: 14px;
}

/* Simple fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: "Public Sans", sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #103841;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #103841;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: #103841;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  background-color: white;
  border-color: #fd5e3a;
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-option--active {
  background-color: #fef3f0;
  color: #fd5e3a;
  border-color: #fd5e3a;
}

/* Vehicle Picker */
.vehicle-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  padding: 12px 0;
  font-family: "Public Sans", sans-serif;
}

.vehicle-search-wrap {
  position: relative;
  margin-bottom: 10px;
}

.vehicle-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.vehicle-search-input {
  padding-left: 40px !important;
}

.vehicle-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
  background: #f8fafc;
}

.vehicle-picker::-webkit-scrollbar {
  width: 6px;
}
.vehicle-picker::-webkit-scrollbar-track {
  background: transparent;
}
.vehicle-picker::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.vehicle-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
}

.vehicle-option:hover {
  border-color: #fd5e3a;
  background: #fef9f8;
}

.vehicle-option--active {
  border-color: #fd5e3a;
  background: #fef3f0;
  box-shadow: 0 0 0 2px rgba(253, 94, 58, 0.12);
}

.vehicle-option--taken {
  opacity: 0.6;
}

.vehicle-option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.vehicle-option--active .vehicle-option-icon {
  background: #fee8e3;
  color: #fd5e3a;
}

.vehicle-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vehicle-option-brand {
  font-size: 14px;
  font-weight: 700;
  color: #103841;
  font-family: "Public Sans", sans-serif;
}

.vehicle-option-plate {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  font-family: "Public Sans", sans-serif;
  letter-spacing: 0.3px;
}

.vehicle-option-detail {
  font-size: 11px;
  color: #94a3b8;
  font-family: "Public Sans", sans-serif;
}

.vehicle-option-check {
  color: #fd5e3a;
  font-size: 18px;
  flex-shrink: 0;
}

.vehicle-taken-badge {
  font-size: 10px;
  font-weight: 700;
  background: #fee2e2;
  color: #ef4444;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.vehicle-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  font-family: "Public Sans", sans-serif;
}

/* Make the modal body scrollable for the vehicle picker */
.modal-container {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-body {
  overflow-y: auto;
}

.modal-footer {
  padding: 24px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 12px 24px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #f1f5f9;
  color: #103841;
}

.btn-save {
  padding: 12px 24px;
  background-color: #fd5e3a;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  background-color: #e94f2b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    max-height: 90vh;
    overflow-y: auto;
  }
}

/* History Modal Specifics */
.history-modal {
  max-width: 800px;
}

.modal-title-group {
  display: flex;
  flex-direction: column;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.history-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
}

.history-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
  color: #94a3b8;
}

.history-state i {
  font-size: 40px;
}

.orders-history-list {
  display: flex;
  flex-direction: column;
}

.history-order-item {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  transition: background-color 0.2s;
}

.history-order-item:hover {
  background-color: #f8fafc;
}

.order-item-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.order-id-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-id {
  font-size: 14px;
  font-weight: 800;
  color: #103841;
}

.order-date {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.order-address {
  font-size: 13px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
}

.order-price {
  font-size: 14px;
  font-weight: 800;
  color: #103841;
}

@media (max-width: 768px) {
  .history-order-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-item-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}

/* Chat Modal Styles */
.chat-modal {
  max-width: 800px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f1f5f9;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-body {
  flex: 1;
  background-color: #f8fafc;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-empty {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}

.chat-empty i {
  font-size: 32px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sent .message-bubble {
  background-color: #fd5e3a;
  color: white;
  border-bottom-right-radius: 4px;
}

.received .message-bubble {
  background-color: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  align-self: flex-end;
}

.chat-footer {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
}

.chat-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #fd5e3a;
}

.btn-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fd5e3a;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.1);
}

.btn-send:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

/* Status Section */
.status-section {
  display: flex;
  justify-content: flex-start;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: "Public Sans", sans-serif;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  text-transform: capitalize;
}

.status-online {
  background-color: #dcfce7;
  color: #166534;
}

.status-online .status-dot {
  background-color: #22c55e;
}

.status-offline {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-offline .status-dot {
  background-color: #ef4444;
}

.status-em\ serviço {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-em\ serviço .status-dot {
  background-color: #3b82f6;
}

/* Stats Row */
.stats-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid #e0e7ff;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-family: "Public Sans", sans-serif;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: #103841;
  font-family: "Public Sans", sans-serif;
}

/* Tags Section */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.courier-tag {
  font-size: 10px;
  font-weight: 700;
  color: #103841;
  background-color: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Action Button */
.action-button {
  width: 100%;
  padding: 12px;
  background-color: #fef3f0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fd5e3a;
  font-family: "Public Sans", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: auto;
}

.action-button:hover {
  background-color: #fd5e3a;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.action-button i {
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
    line-height: 36px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .search-filter-container {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .filter-btn {
    width: 100%;
    justify-content: center;
  }
}

.unread-badge {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  display: inline-block;
  margin-left: 6px;
  animation: badgePulse 1.5s infinite;
  box-shadow: 0 0 0 2px white;
}

@keyframes badgePulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
