<template>
  <div class="delivery-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="state-message" style="min-height: 80vh;">
      <i class="bi bi-arrow-repeat spin"></i>
      <span>A carregar dados...</span>
    </div>

    <!-- Main Content -->
    <main v-else class="mobile-main">
      <!-- Profile Section -->
      <section class="mobile-profile">
        <div class="mobile-truck-icon">
          <i class="bi bi-truck"></i>
        </div>

        <h1 class="mobile-greeting">Bem-vindo, {{ displayName }}!</h1>

      </section>

      <!-- Status Card -->
      <section class="status-card" :class="isOnline ? 'status-card--online' : 'status-card--offline'">
        <div class="status-card-top">
          <div class="status-indicator">
            <span class="status-dot" :class="isOnline ? 'status-dot--online' : 'status-dot--offline'"></span>
            <div class="status-info">
              <span class="status-label">{{ isOnline ? 'Está Online' : 'Está Offline' }}</span>
              <span class="status-time" v-if="isOnline">
                <i class="bi bi-clock"></i> Online há {{ formattedTime }}
              </span>
            </div>
          </div>
          <button
            class="status-toggle-btn"
            :class="isOnline ? 'status-toggle-btn--online' : 'status-toggle-btn--offline'"
            @click="toggleStatus"
          >
            {{ isOnline ? 'Ficar Offline' : 'Ficar Online' }}
          </button>
        </div>
      </section>

      <!-- Mobile Cards (Single Column) -->
      <section class="row g-3 w-100 m-0">
        <!-- Last Delivery Card -->
        <div class="col-12 col-lg-6">
          <div class="mobile-card last-delivery-card h-100" @click="$router.push('/deliveries')">
            <div class="mobile-card-header">
            <i class="bi bi-clock-history mobile-card-icon"></i>
            <span class="mobile-card-label">ÚLTIMA ENTREGA</span>
          </div>
          <div class="last-delivery-row">
            <i class="bi bi-box-seam last-delivery-icon"></i>
            <span class="last-delivery-text">{{ lastDelivery.id }}</span>
          </div>
          <div class="last-delivery-row">
            <i class="bi bi-geo-alt last-delivery-icon"></i>
            <span class="last-delivery-text">{{ lastDelivery.distance }}</span>
          </div>
          <div class="last-delivery-row">
            <i class="bi bi-alarm last-delivery-icon"></i>
            <span class="last-delivery-text">{{ timeAgo(lastDelivery.timestamp) }}</span>
          </div>
          </div>
        </div>

        <!-- Total Deliveries Card -->
        <div class="col-12 col-lg-6">
          <div class="mobile-card h-100">
            <div class="mobile-card-header">
            <i class="bi bi-bar-chart-fill mobile-card-icon"></i>
            <span class="mobile-card-label">TOTAL DE ENTREGAS</span>
          </div>
            <div class="mobile-card-value">{{ totalDeliveries }}</div>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStatusStore, useCourierStore } from '../stores/index.js';
import { storeToRefs } from 'pinia';
import { strapiGet, mapOrder } from '@shared/utils/strapi.js';

const isMobile = ref(window.innerWidth < 1024);

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024;
  });
});

const statusStore = useStatusStore();
const { isOnline, formattedTime } = storeToRefs(statusStore);
const toggleStatus = statusStore.toggleStatus;

const courierStore = useCourierStore();
const displayName = computed(() => courierStore.displayName);
const loading = ref(true);

// ── Last delivery & total deliveries (live from Strapi) ───────────────────────────
const totalDeliveries = ref(0);
const lastDelivery = ref({
  id: '—',
  distance: '—',
  timestamp: null,
});

async function fetchDashboardData() {
  loading.value = true;
  try {
    const json = await strapiGet('/api/orders?populate=*&sort=createdAt:desc');
    const all = (json.data ?? []).map(mapOrder);
    
    // Filter to only include orders assigned to this courier
    const myCourierId = courierStore.courierProfile?.id;
    const myOrders = myCourierId 
      ? all.filter((o) => o.courierId === myCourierId) 
      : all;

    // Total delivered orders
    const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
    totalDeliveries.value = deliveredOrders.length;

    // Last completed order
    const lastCompleted = deliveredOrders[0];
    if (lastCompleted) {
      lastDelivery.value = {
        id: lastCompleted.order_id ? `Pedido #${lastCompleted.order_id.slice(0, 8).toUpperCase()}` : `Pedido #${lastCompleted.id}`,
        distance: lastCompleted.address || '—',
        timestamp: lastCompleted.updatedAt || lastCompleted.date,
      };
    }
  } catch (err) {
    console.warn('[DeliveryDashboard] fetchDashboardData error:', err);
  } finally {
    loading.value = false;
  }
}



function timeAgo(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' às');
}

onMounted(fetchDashboardData);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=PT+Sans:wght@400;500;700&family=Public+Sans:wght@800&family=Plus+Jakarta+Sans:wght@700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css');

/* =================================================================
   MOBILE-FIRST DELIVERY DASHBOARD
   Optimized for 320px - 430px screens
   ================================================================= */

.delivery-dashboard {
  width: 100%;
  flex: 1;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

/* =================================================================
   MAIN CONTENT
   ================================================================= */

.mobile-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 80px 16px;
  gap: 0;
  min-height: auto;
  background-color: #ffffff;
  width: 100%;
}

/* =================================================================
   MOBILE PROFILE SECTION
   ================================================================= */

.mobile-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  margin-bottom: 28px;
  width: 100%;
}

.mobile-truck-icon {
  width: 120px;
  height: 120px;
  background-color: #7a8c98;
  opacity: 0.5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: translateY(-12px);
}

.mobile-truck-icon i {
  font-size: 56px;
  color: #ffffff;
  line-height: 1;
}

.mobile-greeting {
  font-family: 'Public Sans', sans-serif;
  font-size: 24px;
  font-weight: 800;
  line-height: 30px;
  letter-spacing: -0.6px;
  color: #103841;
  margin: 0;
  padding: 0;
  text-align: center;
}

.mobile-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  margin-top: 12px;
}

.mobile-status-dot {
  width: 8px;
  height: 8px;
  background-color: #1e7e34;
  border-radius: 50%;
  flex-shrink: 0;
}

.mobile-status-text {
  font-family: 'Public Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1e7e34;
  white-space: nowrap;
}

/* =================================================================
   STATUS CARD
   ================================================================= */

.status-card {
  width: 100%;
  box-sizing: border-box;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: background-color 0.3s, border-color 0.3s;
}

.status-card--online {
  background-color: #f0faf3;
  border: 1px solid #b7e4c7;
}

.status-card--offline {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
}

.status-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.status-dot--online {
  background-color: #1e7e34;
  box-shadow: 0 0 0 3px rgba(30, 126, 52, 0.2);
}

.status-dot--offline {
  background-color: #9ca3af;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.status-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  color: #103841;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-time {
  font-family: 'Public Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-time i {
  font-size: 11px;
}

.status-toggle-btn {
  flex-shrink: 0;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-family: 'Public Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.25s, color 0.25s, transform 0.15s;
  white-space: nowrap;
}

.status-toggle-btn:active {
  transform: scale(0.96);
}

.status-toggle-btn--online {
  background-color: #ff6b35;
  color: #ffffff;
}

.status-toggle-btn--online:hover {
  background-color: #e85d2a;
}

.status-toggle-btn--offline {
  background-color: #1e7e34;
  color: #ffffff;
}

.status-toggle-btn--offline:hover {
  background-color: #166128;
}

/* =================================================================
   MOBILE CARDS (Single Column)
   ================================================================= */

.mobile-cards {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

.mobile-card {
  background-color: #ffffff;
  border-left: 4px solid #ff6b35;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1px solid #f0f0f0;
  border-left: 4px solid #ff6b35;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.mobile-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transform: translateY(-0.5px);
}

.last-delivery-card {
  cursor: pointer;
}

.last-delivery-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.last-delivery-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.last-delivery-icon {
  font-size: 14px;
  color: #ff6b35;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.last-delivery-text {
  font-family: 'Public Sans', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #103841;
  line-height: 1.4;
}

.mobile-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.mobile-card-icon {
  font-size: 14px;
  line-height: 1;
  color: #64748b;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-card-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #64748b;
  white-space: normal;
  overflow-wrap: break-word;
}

.mobile-card-value {
  font-family: 'Public Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: 0;
  color: #103841;
  margin: 0;
  padding: 0;
}

.mobile-progress {
  margin-top: 6px;
}

.mobile-progress-fill {
  display: none;
}

.mobile-progress {
  width: 100%;
  height: 5px;
  background-color: #f0f0f0;
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 6px;
}

.mobile-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fd5e3a, #e94f2b);
  border-radius: 9999px;
  width: 0%;
  transition: width 0.3s ease;
  display: block;
}

/* =================================================================
   MOBILE BOTTOM NAVIGATION BAR
   ================================================================= */

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 70px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  gap: 0;
  z-index: 100;
}

.mobile-bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  color: #64748b;
}

.mobile-bottom-nav-item:hover {
  background-color: #f8f8f8;
}

.mobile-bottom-nav-item--active {
  color: #ff6b35;
}

.mobile-bottom-nav-icon {
  font-size: 20px;
  line-height: 1;
  color: inherit;
}

.mobile-bottom-nav-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 9px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 0.45px;
  text-transform: uppercase;
  color: inherit;
  white-space: nowrap;
}

/* =================================================================
   RESPONSIVE - TABLET & UP (768px+)
   ================================================================= */

@media (min-width: 1024px) {
  .mobile-bottom-nav {
    display: none;
  }

  /* Update main content padding */
  .mobile-main {
    padding: 40px 32px;
    max-width: 960px;
    margin: 0 auto;
    box-sizing: border-box;
    align-items: stretch;
  }

  .mobile-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 100%;
    align-self: center;
  }

  .mobile-greeting {
    font-size: 34px;
    line-height: 40px;
    letter-spacing: -0.8px;
  }

  .mobile-truck-icon {
    width: 140px;
    height: 140px;
    transform: translateY(-10px);
  }

  .mobile-truck-icon i {
    font-size: 68px;
  }

  .mobile-card {
    padding: 24px;
    gap: 10px;
    border-radius: 12px;
  }

  .mobile-card-value {
    font-size: 22px;
    line-height: 30px;
  }

  .mobile-status {
    margin-top: 20px;
    padding: 10px 20px;
    gap: 10px;
  }

  .mobile-status-text {
    font-size: 12px;
    letter-spacing: 2.2px;
  }

  .mobile-status-dot {
    width: 9px;
    height: 9px;
  }

  .mobile-profile {
    margin-bottom: 24px;
    gap: 12px;
  }
}

/* =================================================================
   RESPONSIVE - DESKTOP (1024px+)
   ================================================================= */

@media (min-width: 1024px) {
  .mobile-main {
    padding: 48px 40px;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
  }

  .mobile-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .mobile-card {
    padding: 28px;
    gap: 12px;
    border-radius: 14px;
  }

  .mobile-card-value {
    font-size: 26px;
    line-height: 34px;
  }

  .mobile-card-label {
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .mobile-card-icon {
    font-size: 15px;
    width: 15px;
    height: 15px;
  }

  .mobile-greeting {
    font-size: 38px;
    line-height: 44px;
    letter-spacing: -0.9px;
  }

  .mobile-profile {
    margin-bottom: 32px;
    gap: 14px;
  }

  .mobile-truck-icon {
    width: 150px;
    height: 150px;
    transform: translateY(-12px);
  }

  .mobile-truck-icon i {
    font-size: 70px;
  }
}

/* =================================================================
   RESPONSIVE - LARGE DESKTOP (1280px+)
   ================================================================= */

@media (min-width: 1280px) {
  .mobile-main {
    padding: 56px 48px;
    max-width: 1040px;
    width: 100%;
  }

  .mobile-cards {
    gap: 28px;
  }

  .mobile-card {
    padding: 32px;
  }

  .mobile-greeting {
    font-size: 42px;
    line-height: 48px;
  }

  .mobile-truck-icon {
    width: 160px;
    height: 160px;
  }

  .mobile-truck-icon i {
    font-size: 76px;
  }
}

/* =================================================================
   RESPONSIVE - SMALL MOBILE (320px - 380px)
   ================================================================= */

@media (max-width: 380px) {
  .mobile-main {
    padding: 20px 12px 80px 12px;
  }

  .mobile-profile {
    margin-bottom: 24px;
    gap: 14px;
  }

  .mobile-truck-icon {
    width: 110px;
    height: 110px;
  }

  .mobile-truck-icon i {
    font-size: 50px;
  }

  .mobile-greeting {
    font-size: 22px;
    line-height: 28px;
    letter-spacing: -0.5px;
  }

  .mobile-status {
    padding: 7px 14px;
    gap: 7px;
  }

  .mobile-status-text {
    font-size: 10px;
    letter-spacing: 1.8px;
  }

  .mobile-card {
    padding: 16px;
    gap: 5px;
    border-radius: 10px;
  }

  .mobile-card-icon {
    font-size: 13px;
  }

  .mobile-card-label {
    font-size: 10px;
  }

  .mobile-card-value {
    font-size: 18px;
    line-height: 24px;
  }

  .mobile-cards {
    gap: 12px;
  }

  .mobile-bottom-nav {
    height: 64px;
  }

  .mobile-bottom-nav-icon {
    font-size: 18px;
  }

  .mobile-bottom-nav-label {
    font-size: 8px;
    letter-spacing: 0.4px;
  }
}
</style>

