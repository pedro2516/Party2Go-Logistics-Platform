<template>
  <div class="logistics-dashboard">
    <!-- Header -->
    <Header />

    <!-- Mobile Bottom Nav -->
    <BackofficeBottomNav />

    <!-- Main Content -->
    <main class="logistics-main">
      <div
        class="container-fluid"
        style="max-width: 1440px; margin: 0 auto; padding: 40px 24px"
      >
        <!-- Page Title Section -->
        <div class="page-title-section mb-5">
          <h1 class="page-title">Logística Operacional</h1>
          <p class="page-subtitle">Bem-vindo, Gestor!</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="state-message">
          <i class="bi bi-arrow-repeat spin"></i>
          <span>A carregar dados...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="state-message state-error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ error }}</span>
          <button class="btn-retry" @click="fetchData">Tentar novamente</button>
        </div>

        <template v-else>
          <!-- KPI Cards Row -->
          <div class="row mb-5 g-4">
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon truck-icon">
                  <i class="bi bi-truck"></i>
                </div>
                <div class="kpi-content">
                  <h3 class="kpi-label">Entregas Hoje</h3>
                  <p class="kpi-value">{{ kpiEntregasHoje }}</p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon box-icon">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div class="kpi-content">
                  <h3 class="kpi-label">Entregas Totais</h3>
                  <p class="kpi-value">{{ kpiEntregasTotais }}</p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon users-icon">
                  <i class="bi bi-people"></i>
                </div>
                <div class="kpi-content">
                  <h3 class="kpi-label">Estafetas Ativos</h3>
                  <p class="kpi-value">{{ kpiEstafetasAtivos }}</p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <div class="kpi-card">
                <div class="kpi-icon pending-icon">
                  <i class="bi bi-clock-history"></i>
                </div>
                <div class="kpi-content">
                  <h3 class="kpi-label">Entregas Pendentes</h3>
                  <p class="kpi-value">{{ kpiPendentes }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary Dashboard Row -->
          <div class="row mb-5 g-4">
            <!-- Left: Deliveries by Region Donut -->
            <div class="col-12 col-lg-4">
              <div class="column-card region-card h-100">
                <h2 class="column-title">Entregas por Área</h2>
                <div class="donut-container">
                  <div class="donut-chart" :style="{ background: donutGradient }">
                    <div class="donut-inner">
                      <span class="donut-total">{{ regionStats.total }}</span>
                      <span class="donut-label">Total</span>
                    </div>
                  </div>
                  <div class="donut-legend">
                    <div class="legend-item">
                      <span class="dot" style="background-color: #fd5e3a;"></span>
                      <span>Norte ({{ regionStats.norte }}%)</span>
                    </div>
                    <div class="legend-item">
                      <span class="dot" style="background-color: #103841;"></span>
                      <span>Centro ({{ regionStats.centro }}%)</span>
                    </div>
                    <div class="legend-item">
                      <span class="dot" style="background-color: #64748b;"></span>
                      <span>Sul ({{ regionStats.sul }}%)</span>
                    </div>
                    <div class="legend-item" v-if="regionStats.outros > 0">
                      <span class="dot" style="background-color: #e2e8f0;"></span>
                      <span>Outros ({{ regionStats.outros }}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Extra KPIs Grid -->
            <div class="col-12 col-lg-8">
              <div class="row m-0 w-100 g-3 h-100">
                <div class="col-12 col-sm-4">
                <div class="mini-kpi-card h-100">
                  <div class="mini-kpi-header">Tempo Médio</div>
                  <div class="mini-kpi-val">{{ kpiTempoMedio }}</div>
                </div>
                </div>
                <div class="col-12 col-sm-4">
                <div class="mini-kpi-card h-100">
                  <div class="mini-kpi-header">Taxa Sucesso</div>
                  <div class="mini-kpi-val text-green">{{ kpiTaxaSucesso }}</div>
                </div>
                </div>
                <div class="col-12 col-sm-4">
                <div class="mini-kpi-card h-100">
                  <div class="mini-kpi-header">Satisfação</div>
                  <div class="mini-kpi-val text-yellow">{{ kpiSatisfacao }}</div>
                </div>
                </div>
                
                <!-- Volume por periodo -->
                <div class="col-12">
                <div class="mini-kpi-card h-100 volume-evolution-card">
                  <div class="mini-kpi-header">Volume de Pedidos (Acumulado)</div>
                  <div class="row m-0 w-100 g-3 mt-1">
                    <div class="col-6 col-md-3">
                    <div class="volume-stat">
                      <div class="vol-label">Hoje</div>
                      <div class="vol-val">{{ kpiVolumeDiario }}</div>
                    </div>
                    </div>
                    <div class="col-6 col-md-3">
                    <div class="volume-stat">
                      <div class="vol-label">7 Dias</div>
                      <div class="vol-val">{{ kpiVolumeSemanal }}</div>
                    </div>
                    </div>
                    <div class="col-6 col-md-3">
                    <div class="volume-stat">
                      <div class="vol-label">30 Dias</div>
                      <div class="vol-val">{{ kpiVolumeMensal }}</div>
                    </div>
                    </div>
                    <div class="col-6 col-md-3">
                    <div class="volume-stat">
                      <div class="vol-label">365 Dias</div>
                      <div class="vol-val">{{ kpiVolumeAnual }}</div>
                    </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Full Width Validation Queue -->
          <div class="row">
            <div class="col-12">
              <div class="column-card">
              <h2 class="column-title">Fila de Validação</h2>

              <!-- Empty state -->
              <p v-if="pendingOrders.length === 0" class="empty-queue">
                <i class="bi bi-check2-circle"></i>
                Sem pedidos pendentes de atribuição.
              </p>

              <div v-else class="table-responsive">
                <table class="validation-table">
                  <thead>
                    <tr>
                      <th>PEDIDO</th>
                      <th>CLIENTE</th>
                      <th>LOCAL</th>
                      <th>PRIORIDADE</th>
                      <th>ESTAFETA</th>
                      <th>VEÍCULO</th>
                      <th>MATRÍCULA</th>
                      <th class="actions-header">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in pendingOrders" :key="order.id" :class="{'urgent-row': order.priority == 5}">
                      <td class="order-id">{{ order.order_id ?? order.id }}</td>
                      <td class="client-name">{{ order.clientName }}</td>
                      <td class="location">{{ order.address }}</td>
                      <td>
                        <select
                          v-model="order.priority"
                          @change="updatePriority(order)"
                          class="priority-select"
                        >
                          <option :value="1">Baixa</option>
                          <option :value="2">Normal</option>
                          <option :value="3">Média</option>
                          <option :value="4">Alta</option>
                          <option :value="5">Urgente</option>
                        </select>
                      </td>
                      <td>
                        <select
                          v-model="order.selectedCourier"
                          class="courier-select"
                        >
                          <option value="">Selecionar Estafeta</option>
                          <option
                            v-for="courier in getCompatibleCouriers(order)"
                            :key="courier.id"
                            :value="courier.id"
                          >
                            {{ courier.name }}
                          </option>
                        </select>
                      </td>
                      <td class="vehicle-cell">
                        {{ getSelectedCourierVehicle(order.selectedCourier) }}
                      </td>
                      <td class="capacity-cell">
                        {{ getSelectedCourierCapacity(order.selectedCourier) }}
                      </td>
                      <td class="actions-cell">
                        <button
                          class="assign-btn"
                          @click="assignOrder(order)"
                          :disabled="!order.selectedCourier"
                          :title="
                            order.selectedCourier
                              ? 'Atribuir Entrega'
                              : 'Selecione um estafeta primeiro'
                          "
                        >
                          <i class="bi bi-check-lg"></i> Atribuir
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, computed, onMounted, onUnmounted } from "vue";
import Header from "@/components/Header.vue";
import BackofficeBottomNav from "@/components/BackofficeBottomNav.vue";
import { STRAPI_URL, strapiGet, strapiPut, mapOrder, mapCourier, mapProduct } from "@shared/utils/strapi.js";

const $router = useRouter();

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const orders = ref([]);
const availableCouriers = ref([]);
const allProducts = ref([]); // To calculate order weight/volume/tags
const loading = ref(false);
const error = ref(null);

// ---------------------------------------------------------------------------
// KPIs (derived from live data)
// ---------------------------------------------------------------------------
const today = new Date().toDateString();

const kpiEntregasHoje = computed(() => {
  const todayStr = new Date().toDateString();
  return orders.value.filter((o) => 
    o.status === 'delivered' && o.updatedAt && new Date(o.updatedAt).toDateString() === todayStr
  ).length;
});

const kpiPendentes = computed(() =>
  orders.value.filter((o) => o.status === "pending" || o.status === "assigned").length
);

const kpiEstafetasAtivos = computed(() => {
  const total = availableCouriers.value.length;
  const active = availableCouriers.value.filter((c) => c.isActive).length;
  return total > 0 ? `${active}/${total}` : "—";
});

// ---------------------------------------------------------------------------
// NEW KPIs & CHARTS
// ---------------------------------------------------------------------------
const kpiVolumeDiario = computed(() => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return orders.value.filter(o => o.createdAt && new Date(o.createdAt) >= startOfDay).length;
});

const kpiVolumeSemanal = computed(() => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return orders.value.filter((o) => o.createdAt && new Date(o.createdAt) >= weekAgo).length;
});

const kpiVolumeMensal = computed(() => {
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return orders.value.filter(o => o.createdAt && new Date(o.createdAt) >= monthAgo).length;
});

const kpiVolumeAnual = computed(() => {
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  return orders.value.filter(o => o.createdAt && new Date(o.createdAt) >= yearAgo).length;
});

// Calculate bar height relative to the max value (Anual will naturally be max)
function getBarHeight(val) {
  const max = Math.max(1, kpiVolumeAnual.value);
  const percentage = (val / max) * 100;
  return `${Math.max(15, percentage)}%`; // Minimum 15% height just to be visible
}

const kpiTempoMedio = computed(() => {
  const completed = orders.value.filter(o => o.status === "delivered" && o.delivery_duration != null);
  if (completed.length === 0) return "—";

  const sumSeconds = completed.reduce((acc, o) => acc + Number(o.delivery_duration), 0);
  const avgSeconds = sumSeconds / completed.length;
  
  const hStr = (avgSeconds / 3600).toFixed(2).replace('.', ',');
  return `${hStr}h`;
});

const kpiTaxaSucesso = computed(() => {
  const delivered = orders.value.filter(o => o.status === "delivered").length;
  const cancelled = orders.value.filter(o => o.status === "cancelled").length;
  const total = delivered + cancelled;
  if (total === 0) return "—";
  return Math.round((delivered / total) * 100) + "%";
});

const kpiSatisfacao = computed(() => {
  const rated = orders.value.filter(o => typeof o.classification === 'number' && o.classification > 0);
  if (rated.length === 0) return "—";
  const sum = rated.reduce((acc, o) => acc + o.classification, 0);
  return (sum / rated.length).toFixed(1) + " / 5";
});

const kpiEntregasTotais = computed(() => {
  return orders.value.filter(o => o.status === "delivered").length;
});

// Regions logic for Donut Chart
const regionStats = computed(() => {
  let norte = 0, centro = 0, sul = 0, outros = 0;
  orders.value.forEach(o => {
    const addr = (o.destinationAddress || o.address || "").toLowerCase();
    
    // 1. Try zip code
    const match = addr.match(/\b(\d)\d{3}-\d{3}\b/);
    if (match) {
      const fd = parseInt(match[1]);
      if ([4, 5].includes(fd)) { norte++; return; }
      if ([3, 6].includes(fd)) { centro++; return; }
      if ([1, 2, 7, 8].includes(fd)) { sul++; return; }
    }
    
    // 2. Fallback to keywords if zip code is missing or malformed
    if (addr.includes("porto") || addr.includes("braga") || addr.includes("vila real") || addr.includes("viana") || addr.includes("bragança") || addr.includes("guimarães") || addr.includes("felgueiras")) {
      norte++;
    } else if (addr.includes("coimbra") || addr.includes("aveiro") || addr.includes("viseu") || addr.includes("leiria") || addr.includes("castelo branco") || addr.includes("guarda")) {
      centro++;
    } else if (addr.includes("lisboa") || addr.includes("setúbal") || addr.includes("setubal") || addr.includes("faro") || addr.includes("algarve") || addr.includes("santarém") || addr.includes("santarem") || addr.includes("beja") || addr.includes("évora") || addr.includes("evora") || addr.includes("portalegre")) {
      sul++;
    } else {
      outros++;
    }
  });

  const total = norte + centro + sul + outros;
  if (total === 0) return { norte: 0, centro: 0, sul: 0, outros: 0, total: 0 };
  
  return {
    norte: Math.round((norte/total)*100),
    centro: Math.round((centro/total)*100),
    sul: Math.round((sul/total)*100),
    outros: Math.round((outros/total)*100),
    total
  };
});

const donutGradient = computed(() => {
  const r = regionStats.value;
  if (r.total === 0) return "conic-gradient(#e0e7ff 0% 100%)";
  const p1 = r.norte;
  const p2 = p1 + r.centro;
  const p3 = p2 + r.sul;
  return `conic-gradient(#fd5e3a 0% ${p1}%, #103841 ${p1}% ${p2}%, #64748b ${p2}% ${p3}%, #e2e8f0 ${p3}% 100%)`;
});

// ---------------------------------------------------------------------------
// Pending orders in the validation queue (not yet assigned/completed)
// ---------------------------------------------------------------------------
const pendingOrders = computed(() =>
  orders.value
    .filter((o) => o.status === "pending")
    .sort((a, b) => (b.priority || 1) - (a.priority || 1))
);

// ---------------------------------------------------------------------------
// Helpers for the selected courier info
// ---------------------------------------------------------------------------
function getSelectedCourierVehicle(courierId) {
  if (!courierId) return "—";
  const c = availableCouriers.value.find((c) => c.id === courierId);
  return c ? c.vehicleBrand || "—" : "—";
}

function getSelectedCourierCapacity(courierId) {
  if (!courierId) return "—";
  const c = availableCouriers.value.find((c) => c.id === courierId);
  return c ? c.licencePlate : "—";
}

// ---------------------------------------------------------------------------
// Courier Compatibility Filter
// ---------------------------------------------------------------------------
function parseWeight(weightStr) {
  if (!weightStr) return 0;
  const match = weightStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseDimensions(dimStr) {
  if (!dimStr) return [0, 0, 0];
  const isMeters = dimStr.toLowerCase().includes('m') && !dimStr.toLowerCase().includes('cm');
  const matches = dimStr.match(/(\d+(?:\.\d+)?)/g);
  if (matches && matches.length >= 3) {
    let l = parseFloat(matches[0]);
    let w = parseFloat(matches[1]);
    let h = parseFloat(matches[2]);
    if (isMeters || (l < 10 && w < 10 && h < 10)) {
      l *= 100;
      w *= 100;
      h *= 100;
    }
    return [l, w, h];
  }
  return [0, 0, 0];
}

function getCompatibleCouriers(order) {
  let requiredTags = new Set();
  let totalWeight = 0;
  let totalVolume = 0;
  let maxCartL = 0;
  let maxCartW = 0;
  let maxCartH = 0;

  const orderProducts = order.products || [];
  for (const op of orderProducts) {
    const pId = op.product_id || op.id;
    const fullProd = allProducts.value.find(p => p.id === pId || p.documentId === pId);
    
    const itemData = fullProd || op;

    if (itemData) {
      if (Array.isArray(itemData.tags)) itemData.tags.forEach(t => requiredTags.add(t));
      
      const qty = op.quantity || 1;
      
      if (Array.isArray(itemData.specs)) {
        const weightSpec = itemData.specs.find(s => s.label === "Peso");
        const dimSpec = itemData.specs.find(s => s.label === "Dimensão");
        
        if (weightSpec && weightSpec.value) {
          totalWeight += parseWeight(weightSpec.value) * qty;
        }
        
        if (dimSpec && dimSpec.value) {
          const dims = parseDimensions(dimSpec.value);
          const l = dims[0];
          const w = dims[1];
          const h = dims[2];
          
          totalVolume += (l * w * h) * qty;
          
          const orderedDims = [l, w, h].sort((a, b) => b - a);
          
          if (orderedDims[0] > maxCartL) maxCartL = orderedDims[0];
          if (orderedDims[1] > maxCartW) maxCartW = orderedDims[1];
          if (orderedDims[2] > maxCartH) maxCartH = orderedDims[2];
        }
      }
    }
  }

  return availableCouriers.value.filter(courier => {
    // Limit: Max 5 active deliveries
    if (courier.activeTasks >= 5) return false;

    // Rule: Tag compatibility
    for (const tag of requiredTags) {
      if (!courier.tags.includes(tag)) return false;
    }

    // Rule: Weight capacity
    if (courier.maxWeight !== null && courier.maxWeight !== undefined) {
      if (totalWeight > courier.maxWeight) return false;
    }

    // Rule: Volume and Fit capacity
    if (courier.maxDimensions) {
      let vL, vW, vH;
      
      // Check if it's the new structure { length, width, height }
      if (courier.maxDimensions.length !== undefined && courier.maxDimensions.width !== undefined && courier.maxDimensions.height !== undefined) {
        vL = Number(courier.maxDimensions.length);
        vW = Number(courier.maxDimensions.width);
        vH = Number(courier.maxDimensions.height);
      }
      // Fallback for old structure { valor: "150x100x150" }
      else if (courier.maxDimensions.valor) {
        const parsedDims = parseDimensions(courier.maxDimensions.valor);
        vL = parsedDims[0];
        vW = parsedDims[1];
        vH = parsedDims[2];
      }

      if (vL !== undefined && vL > 0) {
        const maxVol = vL * vW * vH;
        
        // Volume Rule
        if (totalVolume > maxVol) return false;
        
        // Fit Rule
        const vDims = [vL, vW, vH].sort((a, b) => b - a);
        if (maxCartL > vDims[0] || maxCartW > vDims[1] || maxCartH > vDims[2]) return false;
      }
      // Old fallback Volume Rule if only max_volume exists
      else if (courier.maxDimensions.max_volume !== undefined && courier.maxDimensions.length === undefined) {
        if (totalVolume > Number(courier.maxDimensions.max_volume)) return false;
      }
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------
async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const [ordersJson, couriersJson, productsJson] = await Promise.all([
      strapiGet("/api/orders?populate=*"),
      strapiGet("/api/couriers?populate=*"),
      strapiGet("/api/products?populate=*"),
    ]);
    orders.value = (ordersJson.data ?? []).map((o) => ({
      ...mapOrder(o),
      selectedCourier: o.courier_id?.id ?? "",
    }));
    availableCouriers.value = (couriersJson.data ?? []).map(mapCourier);
    allProducts.value = (productsJson.data ?? []).map(mapProduct);
  } catch (err) {
    console.error("[LogisticsDashboard] fetchData error:", err);
    error.value = err.message ?? "Erro ao carregar dados.";
  } finally {
    loading.value = false;
  }
}

async function assignOrder(order) {
  if (!order.selectedCourier) {
    console.warn("No courier selected");
    return;
  }

  const selectedCourier = availableCouriers.value.find(
    (c) => c.id === order.selectedCourier
  );
  if (!selectedCourier) return;

  try {
    // Strapi v5: update via documentId
    await strapiPut(`/api/orders/${order.documentId}`, {
      courier_id: selectedCourier.documentId,
      order_status: "assigned",
    });
    // Update local state
    order.status = "assigned";
    order.courierName = selectedCourier.name;
    alert(`✓ Entrega ${order.order_id ?? order.id} atribuída a ${selectedCourier.name}`);
  } catch (err) {
    console.error("[LogisticsDashboard] assignOrder error:", err);
    alert(`Erro ao atribuir entrega: ${err.message}`);
  }
}

async function updatePriority(order) {
  try {
    await strapiPut(`/api/orders/${order.documentId}`, {
      priority: Number(order.priority)
    });
  } catch (err) {
    console.error("[LogisticsDashboard] updatePriority error:", err);
    alert("Erro ao atualizar prioridade. Verifique a consola.");
  }
}

import { io } from "socket.io-client";
let socket = null;

onMounted(() => {
  fetchData();

  socket = io("http://localhost:1337");
  socket.on("admin_alert", (data) => {
    alert("📢 ALERTA SISTEMA: " + data.message);
    fetchData(); // Atualiza a dashboard
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>

<style scoped>
/* Main Content */
.logistics-main {
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

.box-icon {
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

/* Full Width Container */
.full-width-container {
  width: 100%;
}

/* Two Column Layout - REMOVED */
.content-row {
  display: none;
}

.column-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7ff;
}

.column-title {
  font-size: 18px;
  font-weight: 700;
  color: #103841;
  margin: 0 0 20px 0;
  font-family: "Public Sans", sans-serif;
}

/* Secondary Dashboard Row */
.dashboard-secondary-row {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}

.region-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.donut-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.5s ease;
}

.donut-inner {
  width: 110px;
  height: 110px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 24px;
  font-weight: 800;
  color: #103841;
  line-height: 1.1;
  font-family: "Public Sans", sans-serif;
}

.donut-label {
  font-size: 12px;
  color: #64748b;
  font-family: "Public Sans", sans-serif;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  font-family: "Public Sans", sans-serif;
}

.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.extra-kpis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.mini-kpi-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.col-span-3 {
  grid-column: span 3;
}

.mini-kpi-header {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-family: "Public Sans", sans-serif;
}

.mini-kpi-val {
  font-size: 24px;
  font-weight: 700;
  color: #103841;
  font-family: "Public Sans", sans-serif;
}

.text-green { color: #22c55e; }
.text-yellow { color: #f59e0b; }

.volume-evolution-card {
  justify-content: flex-start;
}

.volume-evolution-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px 24px;
}

.volume-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  flex: 1;
}

.volume-stat:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  width: 1px;
  background-color: #cbd5e1;
}

.vol-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Public Sans", sans-serif;
}

.vol-val {
  font-size: 28px;
  font-weight: 800;
  color: #103841;
  font-family: "Public Sans", sans-serif;
}

/* Validation Queue Table */
.table-responsive {
  overflow-x: auto;
}

.validation-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Public Sans", sans-serif;
}

.validation-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e7ff;
}

.validation-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.validation-table th.actions-header {
  text-align: center;
}

.validation-table tbody tr {
  border-bottom: 1px solid #e0e7ff;
  transition: background-color 0.2s ease;
}

.validation-table tbody tr:hover {
  background-color: #f8f9fa;
}

.validation-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #475569;
}

.order-id {
  font-weight: 600;
  color: #103841;
}

.client-name {
  font-weight: 500;
  color: #103841;
}

.location {
  color: #64748b;
  font-size: 12px;
}

.priority-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  color: #103841;
  font-size: 13px;
  font-family: "Public Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23103841' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
}

.priority-select:hover {
  border-color: #fd5e3a;
}

.priority-select:focus {
  outline: none;
  border-color: #fd5e3a;
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
}

tr.urgent-row .priority-select {
  border-color: #fca5a5;
  color: #dc2626;
  font-weight: 700;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23dc2626' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
}

tr.urgent-row {
  background-color: #fff5f5 !important;
}

tr.urgent-row td {
  color: #991b1b;
}


.btn-retry {
  background-color: #fd5e3a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-retry:hover { background-color: #e04e2a; }

/* Empty queue */
.empty-queue {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: #64748b;
  padding: 24px 0;
  margin: 0;
}

.actions-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e0e7ff;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.approve-btn {
  color: #22c55e;
  border-color: #e0ffe0;
}

.approve-btn:hover {
  background-color: #f0fdf4;
  border-color: #22c55e;
}

.reject-btn {
  color: #ef4444;
  border-color: #ffe0e0;
}

.reject-btn:hover {
  background-color: #fef2f2;
  border-color: #ef4444;
}

/* Courier Select Dropdown */
.courier-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  color: #103841;
  font-size: 13px;
  font-family: "Public Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23103841' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
}

.courier-select:hover {
  border-color: #fd5e3a;
}

.courier-select:focus {
  outline: none;
  border-color: #fd5e3a;
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
}

.vehicle-cell,
.capacity-cell {
  font-weight: 500;
  color: #103841;
}

/* Action Button */
.actions-cell {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 16px;
}

.assign-btn {
  background-color: #fd5e3a;
  color: white;
  font-weight: 700;
  font-size: 12px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  gap: 6px;
  transition: all 0.2s ease;
  font-family: "Public Sans", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.assign-btn:hover:not(:disabled) {
  background-color: #e94f2b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.assign-btn:active:not(:disabled) {
  transform: translateY(0);
}

.assign-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Timeline - HIDDEN */
.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  gap: 16px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-dot.done {
  background-color: #22c55e;
}

.timeline-dot.delayed {
  background-color: #ef4444;
}

.timeline-dot.pending {
  background-color: #cbd5e1;
}

.timeline-content {
  flex: 1;
  font-family: "Public Sans", sans-serif;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.timeline-time {
  font-size: 13px;
  font-weight: 700;
  color: #103841;
}

.timeline-vehicle {
  font-size: 11px;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.delay-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fd5e3a;
  background-color: #fef3f0;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.timeline-title {
  font-size: 13px;
  font-weight: 600;
  color: #103841;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 28px;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .courier-select {
    font-size: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px !important;
  }

  .logo-text {
    font-size: 20px;
  }

  .brand-name,
  .brand-accent {
    font-size: 18px;
  }

  .business-label {
    font-size: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .nav-link {
    margin: 0 8px;
    font-size: 11px;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .validation-table th,
  .validation-table td {
    padding: 10px 8px;
    font-size: 12px;
  }

  .validation-table {
    font-size: 12px;
  }

  .courier-select {
    font-size: 11px;
    padding: 6px 8px;
  }
}
</style>
