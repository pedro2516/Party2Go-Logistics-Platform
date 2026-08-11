<template>
  <div class="active-deliveries">
    <!-- Header -->
    <Header />

    <!-- Mobile Bottom Nav -->
    <BackofficeBottomNav />

    <!-- Main Content -->
    <main class="deliveries-main">
      <div
        class="container-fluid"
        style="max-width: 1440px; margin: 0 auto; padding: 40px 24px"
      >
        <!-- Page Title Section -->
        <div class="page-title-section mb-5">
          <h1 class="page-title">Entregas</h1>
          <p class="page-subtitle">Visualize todas as entregas</p>
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
          <!-- Deliveries List -->
          <div class="row">
            <div class="col-12">
              <div class="column-card">
              <h2 class="column-title">
                <i class="bi bi-list-task"></i>
                Lista de Entregas
              </h2>

              <!-- Empty state -->
              <p v-if="allOrders.length === 0" class="empty-state">
                <i class="bi bi-inbox"></i>
                Nenhuma entrega encontrada.
              </p>

              <div v-else class="table-responsive">
                <table class="deliveries-table">
                  <thead>
                    <tr>
                      <th>PEDIDO</th>
                      <th>CLIENTE</th>
                      <th>LOCAL</th>
                      <th>STATUS</th>
                      <th>ESTAFETA</th>
                      <th>VEÍCULO</th>
                      <th>MATRÍCULA</th>
                      <th class="actions-header">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="order in allOrders"
                      :key="order.id"
                      :class="getRowClass(order)"
                    >
                      <td class="order-id">{{ order.order_id ?? order.id }}</td>
                      <td class="client-name">{{ order.clientName }}</td>
                      <td class="location">{{ order.address }}</td>
                      <td class="status-cell">
                        <span :class="getStatusBadgeClass(order.status)">
                          {{ formatStatus(order.status) }}
                        </span>
                      </td>
                      <td>
                        <select
                          v-model="order.selectedCourier"
                          class="courier-select"
                          :disabled="order.status === 'delivered' || order.status === 'cancelled'"
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
                        <div class="action-buttons">
                          <!-- Assign / Reassign Button -->
                          <button
                            v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                            class="assign-btn"
                            @click="assignOrder(order)"
                            :disabled="!order.selectedCourier"
                            :title="order.selectedCourier ? 'Atribuir Entrega' : 'Selecione um estafeta primeiro'"
                          >
                            <i class="bi bi-check-lg"></i>
                            {{ order.status === 'pending' ? 'Atribuir' : 'Reatribuir' }}
                          </button>

                          <!-- Cancel Button -->
                          <button
                            v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                            class="action-btn cancel-btn"
                            @click="cancelDelivery(order)"
                            title="Cancelar entrega"
                          >
                            <i class="bi bi-x-circle"></i>
                          </button>
                        </div>
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
import { ref, computed, onMounted } from "vue";
import Header from "@/components/Header.vue";
import BackofficeBottomNav from "@/components/BackofficeBottomNav.vue";
import { strapiGet, strapiPut, mapOrder, mapCourier, mapProduct } from "@shared/utils/strapi.js";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const orders = ref([]);
const availableCouriers = ref([]);
const allProducts = ref([]);
const loading = ref(false);
const error = ref(null);

// ---------------------------------------------------------------------------
// Computed Properties
// ---------------------------------------------------------------------------
const STATUS_RANK = { in_progress: 0, assigned: 1, pending: 2, delivered: 3, cancelled: 4 };

const allOrders = computed(() =>
  orders.value.slice().sort((a, b) => {
    const rankDiff = (STATUS_RANK[a.status] ?? 2) - (STATUS_RANK[b.status] ?? 2);
    if (rankDiff !== 0) return rankDiff;
    return (b.priority || 1) - (a.priority || 1);
  })
);

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------
function formatStatus(status) {
  const statusMap = {
    pending: "Pendente",
    assigned: "Atribuída",
    in_progress: "Em Progresso",
    delivered: "Entregue",
    cancelled: "Cancelada",
  };
  return statusMap[status] || status;
}

function getStatusBadgeClass(status) {
  return `status-badge status-${status}`;
}

function getRowClass(order) {
  return {
    "urgent-row": order.priority === 5,
    "in-progress-row": order.status === "in_progress",
    "delivered-row": order.status === "delivered",
    "cancelled-row": order.status === "cancelled",
  };
}

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
  const isMeters = dimStr.toLowerCase().includes("m") && !dimStr.toLowerCase().includes("cm");
  const matches = dimStr.match(/(\d+(?:\.\d+)?)/g);
  if (matches && matches.length >= 3) {
    let l = parseFloat(matches[0]);
    let w = parseFloat(matches[1]);
    let h = parseFloat(matches[2]);
    if (isMeters || (l < 10 && w < 10 && h < 10)) {
      l *= 100; w *= 100; h *= 100;
    }
    return [l, w, h];
  }
  return [0, 0, 0];
}

function getCompatibleCouriers(order) {
  let requiredTags = new Set();
  let totalWeight = 0;
  let totalVolume = 0;
  let maxCartL = 0, maxCartW = 0, maxCartH = 0;

  const orderProducts = order.products || [];
  for (const op of orderProducts) {
    const pId = op.product_id || op.id;
    const fullProd = allProducts.value.find((p) => p.id === pId || p.documentId === pId);
    const itemData = fullProd || op;

    if (itemData) {
      if (Array.isArray(itemData.tags)) itemData.tags.forEach((t) => requiredTags.add(t));
      const qty = op.quantity || 1;
      if (Array.isArray(itemData.specs)) {
        const weightSpec = itemData.specs.find((s) => s.label === "Peso");
        const dimSpec = itemData.specs.find((s) => s.label === "Dimensão");
        if (weightSpec?.value) totalWeight += parseWeight(weightSpec.value) * qty;
        if (dimSpec?.value) {
          const [l, w, h] = parseDimensions(dimSpec.value);
          totalVolume += l * w * h * qty;
          const sorted = [l, w, h].sort((a, b) => b - a);
          if (sorted[0] > maxCartL) maxCartL = sorted[0];
          if (sorted[1] > maxCartW) maxCartW = sorted[1];
          if (sorted[2] > maxCartH) maxCartH = sorted[2];
        }
      }
    }
  }

  return availableCouriers.value
    .filter((courier) => {
      if (courier.activeTasks >= 5) return false;
      for (const tag of requiredTags) {
        if (!courier.tags.includes(tag)) return false;
      }
      if (courier.maxWeight !== null && courier.maxWeight !== undefined) {
        if (totalWeight > courier.maxWeight) return false;
      }
      if (courier.maxDimensions) {
        let vL, vW, vH;
        if (courier.maxDimensions.length !== undefined && courier.maxDimensions.width !== undefined && courier.maxDimensions.height !== undefined) {
          vL = Number(courier.maxDimensions.length);
          vW = Number(courier.maxDimensions.width);
          vH = Number(courier.maxDimensions.height);
        } else if (courier.maxDimensions.valor) {
          [vL, vW, vH] = parseDimensions(courier.maxDimensions.valor);
        }
        if (vL !== undefined && vL > 0) {
          if (totalVolume > vL * vW * vH) return false;
          const vDims = [vL, vW, vH].sort((a, b) => b - a);
          if (maxCartL > vDims[0] || maxCartW > vDims[1] || maxCartH > vDims[2]) return false;
        } else if (courier.maxDimensions.max_volume !== undefined && courier.maxDimensions.length === undefined) {
          if (totalVolume > Number(courier.maxDimensions.max_volume)) return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.activeTasks - b.activeTasks);
}

// ---------------------------------------------------------------------------
// API Calls
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
    console.error("[ActiveDeliveries] fetchData error:", err);
    error.value = err.message ?? "Erro ao carregar dados.";
  } finally {
    loading.value = false;
  }
}

async function assignOrder(order) {
  if (!order.selectedCourier) return;
  const selectedCourier = availableCouriers.value.find((c) => c.id === order.selectedCourier);
  if (!selectedCourier) return;

  try {
    await strapiPut(`/api/orders/${order.documentId}`, {
      courier_id: selectedCourier.documentId,
      order_status: "assigned",
    });
    order.status = "assigned";
    order.courierId = selectedCourier.id;
    order.courierName = selectedCourier.name;
    alert(`✓ Entrega ${order.order_id ?? order.id} atribuída a ${selectedCourier.name}`);
  } catch (err) {
    console.error("[ActiveDeliveries] assignOrder error:", err);
    alert(`Erro ao atribuir entrega: ${err.message}`);
  }
}

async function cancelDelivery(order) {
  const confirmed = confirm(
    `Tem a certeza que deseja cancelar a entrega ${order.order_id ?? order.id}?`
  );
  if (!confirmed) return;

  try {
    await strapiPut(`/api/orders/${order.documentId}`, {
      order_status: "cancelled",
    });
    order.status = "cancelled";
    alert(`✓ Entrega ${order.order_id ?? order.id} cancelada`);
  } catch (err) {
    console.error("[ActiveDeliveries] cancelDelivery error:", err);
    alert(`Erro ao cancelar entrega: ${err.message}`);
  }
}

async function updatePriority(order) {
  try {
    await strapiPut(`/api/orders/${order.documentId}`, {
      priority: Number(order.priority),
    });
  } catch (err) {
    console.error("[ActiveDeliveries] updatePriority error:", err);
    alert("Erro ao atualizar prioridade.");
  }
}

onMounted(fetchData);
</script>

<style scoped>
/* Main Content */
.deliveries-main {
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

/* Full Width Container */
.full-width-container {
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Deliveries Table */
.table-responsive {
  overflow-x: auto;
}

.deliveries-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Public Sans", sans-serif;
}

.deliveries-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e7ff;
}

.deliveries-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.deliveries-table th.actions-header {
  text-align: center;
}

.deliveries-table tbody tr {
  border-bottom: 1px solid #e0e7ff;
  transition: background-color 0.2s ease;
}

.deliveries-table tbody tr:hover {
  background-color: #f8f9fa;
}

.deliveries-table td {
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

/* Status Badge */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 120px;
  text-align: center;
}

.status-pending {
  background-color: #f0f9f7;
  color: #103841;
}

.status-assigned {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-in_progress {
  background-color: #fef3f0;
  color: #fd5e3a;
}

.status-delivered {
  background-color: #f0fdf4;
  color: #22c55e;
}

.status-cancelled {
  background-color: #fef2f2;
  color: #ef4444;
}

/* Priority Select */
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

/* Courier Select */
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

.courier-select:hover:not(:disabled) {
  border-color: #fd5e3a;
}

.courier-select:focus {
  outline: none;
  border-color: #fd5e3a;
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
}

.courier-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vehicle-cell,
.capacity-cell {
  font-weight: 500;
  color: #103841;
}

/* Action Buttons */
.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
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
  white-space: nowrap;
}

.assign-btn:hover:not(:disabled) {
  background-color: #e04e2a;
  transform: translateY(-1px);
}

.assign-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
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

.cancel-btn {
  color: #ef4444;
  border-color: #fecaca;
}

.cancel-btn:hover {
  background-color: #fef2f2;
  border-color: #ef4444;
}

/* Row States */
.urgent-row {
  background-color: #fff5f5 !important;
}

.urgent-row td {
  color: #991b1b;
}

.urgent-row .priority-select {
  border-color: #fca5a5;
  color: #dc2626;
  font-weight: 700;
}

.in-progress-row {
  background-color: #fef9f6;
}

.delivered-row {
  opacity: 0.7;
}

.cancelled-row {
  opacity: 0.5;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  padding: 60px 24px;
  text-align: center;
  font-family: "Public Sans", sans-serif;
}

.empty-state i {
  font-size: 48px;
  color: #cbd5e1;
}

/* State Messages */
.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  padding: 40px 24px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
}

.state-message i {
  font-size: 24px;
}

.spin {
  animation: spin 1s linear infinite;
}

.state-error {
  color: #ef4444;
  background-color: #fef2f2;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #fecaca;
  flex-direction: column;
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
  margin-top: 12px;
}

.btn-retry:hover {
  background-color: #e04e2a;
}

/* Animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
    line-height: 36px;
  }

  .deliveries-table {
    font-size: 12px;
  }

  .deliveries-table th,
  .deliveries-table td {
    padding: 10px 8px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
    line-height: 32px;
  }
}
</style>
