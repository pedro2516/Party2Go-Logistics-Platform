<template>
  <section class="stats-section" id="stats-section">
    <!-- Section Badge + Title -->
    <div class="stats-badge">RESULTADOS</div>
    <h2 class="stats-title">Entregas com Excelência</h2>
    <p class="stats-subtitle">
      A confiança de centenas de clientes, refletida em cada entrega.
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="stats-loading">
      <div class="stats-spinner"></div>
      <span class="stats-loading-text">A carregar estatísticas...</span>
    </div>

    <!-- Error State (silent — shows fallback) -->
    <div v-else-if="error" class="stats-grid">
      <div class="stat-card stat-card--muted">
        <div class="stat-icon-wrap stat-icon-wrap--orange">
          <i class="bi bi-box-seam-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">—</div>
          <div class="stat-label">Entregas Concluídas</div>
        </div>
      </div>
      <div class="stat-card stat-card--muted">
        <div class="stat-icon-wrap stat-icon-wrap--teal">
          <i class="bi bi-clock-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">—</div>
          <div class="stat-label">Tempo Médio de Entrega</div>
        </div>
      </div>
      <div class="stat-card stat-card--muted">
        <div class="stat-icon-wrap stat-icon-wrap--yellow">
          <i class="bi bi-star-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">—</div>
          <div class="stat-label">Satisfação dos Clientes</div>
        </div>
      </div>
      <p class="stats-error-hint">
        <i class="bi bi-info-circle"></i>
        Não foi possível carregar as estatísticas de momento.
      </p>
    </div>

    <!-- Data Loaded -->
    <div v-else class="stats-grid">
      <!-- Card 1: Total Deliveries -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-wrap--orange">
          <i class="bi bi-box-seam-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span ref="counterDeliveries">0</span>
          </div>
          <div class="stat-label">Entregas Concluídas</div>
          <div class="stat-bar">
            <div class="stat-bar-fill stat-bar-fill--orange" :style="{ width: barDeliveries }"></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Average Delivery Time -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-wrap--teal">
          <i class="bi bi-clock-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span ref="counterTime">0</span>
            <span class="stat-unit">min</span>
          </div>
          <div class="stat-label">Tempo Médio de Entrega</div>
          <div class="stat-bar">
            <div class="stat-bar-fill stat-bar-fill--teal" :style="{ width: barTime }"></div>
          </div>
        </div>
      </div>

      <!-- Card 3: Average Satisfaction -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-wrap--yellow">
          <i class="bi bi-star-fill"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span ref="counterRating">0</span>
            <span class="stat-unit">/ 5</span>
          </div>
          <div class="stat-label">Satisfação dos Clientes</div>
          <div class="stat-stars">
            <i
              v-for="n in 5"
              :key="n"
              class="bi"
              :class="n <= Math.round(avgRating) ? 'bi-star-fill star-filled' : 'bi-star star-empty'"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { strapiGet } from "@shared/utils/strapi.js";

// ── Reactive state ──────────────────────────────────────────────────────────
const loading = ref(true);
const error = ref(false);

const totalDeliveries = ref(0);
const avgDeliveryTime = ref(0);
const avgRating = ref(0);

// Progress bar widths (animated via CSS transition)
const barDeliveries = ref("0%");
const barTime = ref("0%");

// Template refs for animated counters
const counterDeliveries = ref(null);
const counterTime = ref(null);
const counterRating = ref(null);

// ── Fetch & compute ─────────────────────────────────────────────────────────
async function fetchStats() {
  loading.value = true;
  error.value = false;

  try {
    // 1. Fetch Orders for Completed Deliveries
    const ordersRes = await strapiGet("/api/orders?pagination[pageSize]=1000");
    const orders = ordersRes?.data ?? [];

    const completedOrders = orders.filter((o) => {
      const status = (o.order_status || "").toLowerCase();
      return status === "delivered";
    });
    totalDeliveries.value = completedOrders.length;

    // 2. Average Delivery Time
    const ordersWithDuration = completedOrders.filter((o) => o.delivery_duration != null);

    if (ordersWithDuration.length > 0) {
      const totalSeconds = ordersWithDuration.reduce((acc, o) => acc + Number(o.delivery_duration), 0);
      const avgSeconds = totalSeconds / ordersWithDuration.length;
      avgDeliveryTime.value = Math.round(avgSeconds / 60);
    } else {
      avgDeliveryTime.value = 0;
    }

    // 3. Calculate Customer Satisfaction from Orders classification
    const ratedOrders = orders.filter((o) => typeof o.classification === "number" && o.classification > 0);
    if (ratedOrders.length > 0) {
      const sum = ratedOrders.reduce((acc, o) => acc + o.classification, 0);
      const avg = sum / ratedOrders.length;
      avgRating.value = Math.min(5, parseFloat(avg.toFixed(1)));
    } else {
      avgRating.value = 0;
    }

    // Stop loading so the DOM renders the stats grid
    loading.value = false;
    // Wait for DOM, then animate counters
    await nextTick();
    animateCounters();
  } catch (err) {
    console.warn("[HomeStats] Could not fetch stats:", err.message);
    error.value = true;
    loading.value = false;
  }
}

// ── Counter animation ───────────────────────────────────────────────────────
function animateValue(el, start, end, duration, decimals = 0) {
  if (!el) return;
  const range = end - start;
  const startTime = performance.now();

  function step(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;
    el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function animateCounters() {
  const duration = 2000;

  animateValue(counterDeliveries.value, 0, totalDeliveries.value, duration);
  animateValue(counterTime.value, 0, avgDeliveryTime.value, duration);
  animateValue(counterRating.value, 0, avgRating.value, duration, 1);

  // Animate progress bars with a slight delay
  setTimeout(() => {
    // Delivery bar: cap at 100 for visual purposes
    barDeliveries.value = Math.min(100, (totalDeliveries.value / Math.max(totalDeliveries.value, 1)) * 100) + "%";
    
    // Time bar: smaller average time means a higher completion bar (assuming 60 mins is the max acceptable)
    if (avgDeliveryTime.value > 0) {
       barTime.value = Math.min(100, Math.max(20, 100 - (avgDeliveryTime.value / 60) * 100)) + "%";
    } else {
       barTime.value = "0%";
    }
  }, 300);
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
/* ===== STATS SECTION ===== */
.stats-section {
  padding: 80px 24px 100px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.stats-badge {
  display: inline-block;
  background-color: rgba(253, 94, 58, 0.1);
  border-radius: 9999px;
  padding: 9px 25px;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1.4px;
  margin-bottom: 24px;
  text-align: center;
}

.stats-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: var(--dark-text);
  text-align: center;
  margin: 0 auto 16px;
  max-width: 768px;
  line-height: 1.15;
}

.stats-subtitle {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 17px;
  color: var(--secondary-light);
  text-align: center;
  margin: 0 auto 56px;
  max-width: 520px;
  line-height: 28px;
}

/* ===== LOADING STATE ===== */
.stats-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
}

.stats-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(253, 94, 58, 0.15);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: statsSpinner 0.8s linear infinite;
}

@keyframes statsSpinner {
  to {
    transform: rotate(360deg);
  }
}

.stats-loading-text {
  font-family: "Public Sans", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--secondary-light);
}

/* ===== GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  max-width: 1100px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ===== STAT CARD ===== */
.stat-card {
  background: white;
  border-radius: 24px;
  padding: 36px 28px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.35s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  transition: background 0.3s ease;
  border-radius: 24px 24px 0 0;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 16px 48px rgba(0, 0, 0, 0.1);
}

.stat-card:nth-child(1):hover::before {
  background: var(--primary-color);
}

.stat-card:nth-child(2):hover::before {
  background: var(--dark-text);
}

.stat-card:nth-child(3):hover::before {
  background: #f59e0b;
}

.stat-card--muted {
  opacity: 0.5;
}

/* ===== ICON WRAP ===== */
.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 4px;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1);
}

.stat-icon-wrap--orange {
  background: rgba(253, 94, 58, 0.1);
  color: var(--primary-color);
}

.stat-icon-wrap--teal {
  background: rgba(16, 56, 65, 0.08);
  color: var(--dark-text);
}

.stat-icon-wrap--yellow {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* ===== VALUE ===== */
.stat-value {
  font-family: "Public Sans", sans-serif;
  font-weight: 800;
  font-size: 44px;
  color: var(--dark-text);
  line-height: 1;
  letter-spacing: -1px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-unit {
  font-size: 18px;
  font-weight: 600;
  color: var(--secondary-light);
  letter-spacing: 0;
}

/* ===== LABEL ===== */
.stat-label {
  font-family: "Public Sans", sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: var(--secondary-light);
  line-height: 1.4;
}

/* ===== PROGRESS BAR ===== */
.stat-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 4px;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-bar-fill--orange {
  background: linear-gradient(90deg, var(--primary-color), #ff8c66);
}

.stat-bar-fill--teal {
  background: linear-gradient(90deg, var(--dark-text), #1e6b7a);
}

/* ===== STARS ===== */
.stat-stars {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.star-filled {
  color: #f59e0b;
  font-size: 18px;
  animation: starPop 0.3s ease backwards;
}

.star-filled:nth-child(1) { animation-delay: 1.6s; }
.star-filled:nth-child(2) { animation-delay: 1.75s; }
.star-filled:nth-child(3) { animation-delay: 1.9s; }
.star-filled:nth-child(4) { animation-delay: 2.05s; }
.star-filled:nth-child(5) { animation-delay: 2.2s; }

@keyframes starPop {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.star-empty {
  color: #e2e8f0;
  font-size: 18px;
}

/* ===== ERROR HINT ===== */
.stats-error-hint {
  grid-column: 1 / -1;
  text-align: center;
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  color: var(--secondary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1199px) {
  .stats-title {
    font-size: 36px;
  }

  .stats-grid {
    gap: 20px;
  }

  .stat-value {
    font-size: 38px;
  }
}

@media (max-width: 991px) {
  .stats-section {
    padding: 60px 20px 80px;
  }

  .stats-title {
    font-size: 28px;
  }

  .stats-subtitle {
    font-size: 15px;
    margin-bottom: 40px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 28px 20px 24px;
    border-radius: 20px;
  }

  .stat-value {
    font-size: 32px;
  }

  .stat-icon-wrap {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .stats-section {
    padding: 32px 16px 100px;
  }

  .stats-title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .stats-subtitle {
    font-size: 14px;
    line-height: 24px;
    margin-bottom: 32px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    max-width: 100%;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
    align-items: center;
    padding: 18px 20px;
    gap: 16px;
    border-radius: 16px;
  }

  .stat-card::before {
    width: 4px;
    height: 100%;
    top: 0;
    left: 0;
    right: auto;
    border-radius: 16px 0 0 16px;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-icon-wrap {
    width: 44px;
    height: 44px;
    font-size: 18px;
    border-radius: 12px;
    flex-shrink: 0;
    margin-bottom: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .stat-value {
    font-size: 24px;
    letter-spacing: -0.5px;
  }

  .stat-unit {
    font-size: 13px;
  }

  .stat-label {
    font-size: 13px;
    white-space: nowrap;
  }

  .stat-bar {
    display: none;
  }

  .stat-stars {
    margin-top: 2px;
  }

  .star-filled,
  .star-empty {
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .stats-section {
    padding: 24px 16px 100px;
  }

  .stats-badge {
    margin-bottom: 16px;
    font-size: 12px;
    padding: 7px 20px;
  }

  .stats-title {
    font-size: 20px;
  }

  .stats-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 16px 20px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
