<template>
  <div class="checkout-page">
    <HomeHeader />

    <main class="checkout-main">
      <!-- Page Content -->
      <div class="checkout-container">
        <div class="checkout-content">
          <!-- Page Title -->
          <div class="checkout-title-section">
            <h1 class="page-title">Checkout</h1>
            <p class="page-subtitle">Confirme os detalhes de entrega da sua encomenda</p>
          </div>

          <!-- Layout: Form + Summary -->
          <div class="row m-0 w-100 g-4">
            <!-- Left Column: Delivery Form -->
            <div class="col-12 col-lg-8">
              <!-- Delivery Details Card -->
              <div class="delivery-card">
                <div class="card-header">
                  <h2 class="card-title">Detalhes da Entrega</h2>
                </div>

                <form class="delivery-form" @submit.prevent="submitTestOrder">
                  <!-- Loading State -->
                  <div v-if="isFetchingClient" class="loading-placeholder">
                    <i class="bi bi-hourglass-split spinner"></i>
                    <span>Carregando dados do cliente...</span>
                  </div>

                  <!-- Name and Phone (Side by Side) -->
                  <div class="row m-0 w-100 g-3">
                    <!-- Client Name -->
                    <div class="col-12 col-md-6 form-group">
                      <label for="clientName" class="form-label">Nome</label>
                      <div class="input-wrapper">
                        <i class="bi bi-person input-icon"></i>
                        <input
                          id="clientName"
                          v-model="clientName"
                          type="text"
                          class="form-input"
                          placeholder="Nome completo"
                          required
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>

                    <!-- Client Phone -->
                    <div class="col-12 col-md-6 form-group">
                      <label for="clientPhone" class="form-label">Telemóvel</label>
                      <div class="input-wrapper">
                        <i class="bi bi-telephone input-icon"></i>
                        <input
                          id="clientPhone"
                          v-model="clientPhone"
                          type="tel"
                          class="form-input"
                          placeholder="9XXXXXXXX"
                          required
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Address Grid -->
                  <div class="row m-0 w-100 g-3 mt-1">
                    <!-- Row 2: Rua (full width) -->
                    <div class="col-12 form-group">
                      <label for="addressStreet" class="form-label">Rua</label>
                      <AddressAutocomplete
                        v-model:street="addressStreet"
                        v-model:postalCode="postalCode"
                        @validation-change="isAddressValid = $event"
                        :disabled="isFetchingClient"
                      />
                    </div>

                    <!-- Row 3: Nº/Andar + Código Postal -->
                    <div class="col-12 col-md-6 form-group">
                      <label for="addressDetails" class="form-label">Nº/Andar</label>
                      <div class="input-wrapper">
                        <i class="bi bi-building input-icon"></i>
                        <input
                          id="addressDetails"
                          v-model="addressDetails"
                          type="text"
                          class="form-input"
                          placeholder="Nº, andar"
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>

                    <div class="col-12 col-md-6 form-group">
                      <label for="postalCode" class="form-label">Código Postal</label>
                      <div class="input-wrapper">
                        <i class="bi bi-signpost input-icon"></i>
                        <input
                          id="postalCode"
                          v-model="postalCode"
                          type="text"
                          class="form-input"
                          placeholder="0000-000"
                          required
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>

                    <!-- Row 4: Data + Hora -->
                    <div class="col-12 col-md-6 form-group">
                      <label for="deliveryDate" class="form-label">Data de Entrega</label>
                      <div class="input-wrapper">
                        <i class="bi bi-calendar input-icon"></i>
                        <input
                          id="deliveryDate"
                          v-model="deliveryDate"
                          type="date"
                          class="form-input"
                          required
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>

                    <div class="col-12 col-md-6 form-group">
                      <label for="deliveryTime" class="form-label">Hora de Entrega</label>
                      <div class="input-wrapper">
                        <i class="bi bi-clock input-icon"></i>
                        <input
                          id="deliveryTime"
                          v-model="deliveryTime"
                          type="time"
                          class="form-input"
                          required
                          :disabled="isFetchingClient"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Row 5: Instruções -->
                  <div class="form-group mt-3">
                    <label for="instructions" class="form-label">Instruções de Entrega (Opcional)</label>
                    <div class="input-wrapper" style="align-items: flex-start;">
                      <i class="bi bi-chat-left-text input-icon" style="top: 20px;"></i>
                      <textarea
                        id="instructions"
                        v-model="deliveryInstructions"
                        class="form-input"
                        placeholder="Ex: Deixar na portaria, campainha avariada..."
                        rows="2"
                        :disabled="isFetchingClient"
                        style="resize: vertical; min-height: 52px; padding-top: 12px;"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Save profile info opt-in -->
                  <div class="save-info-row">
                    <label class="save-info-label">
                      <input
                        id="saveProfileInfo"
                        v-model="saveProfileInfo"
                        type="checkbox"
                        class="save-info-checkbox"
                      />
                      <span> Pretende guardar as informações para compras futuras?</span>
                    </label>
                  </div>
                </form>
              </div>
            </div>

            <!-- Right Column: Order Summary (Fixed Width) -->
            <div class="col-12 col-lg-4">
              <CheckoutSummary
                :items="cartStore.items"
                :shipping-cost="cartStore.shippingCost"
                @confirm="submitTestOrder"
                :is-submitting="submitting"
                :is-blocked="clientNotReady"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile only) -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@shared/stores/useCartStore";
import { strapiGet, strapiPut } from "@shared/utils/strapi";
import HomeHeader from "@/components/home/HomeHeader.vue";
import BottomNav from "@/components/BottomNav.vue";
import AddressAutocomplete from "@/components/AddressAutocomplete.vue";
import CheckoutSummary from "@shared/components/CheckoutSummary.vue";
import { useAuthStore } from "@backend/auth/authStore";

const STRAPI_URL = "http://localhost:1337";

const cartStore = useCartStore();
const router = useRouter();
const authStore = useAuthStore();

// Form fields
const clientName = ref("");
const clientPhone = ref("");
const addressStreet = ref("");
const addressDetails = ref("");
const postalCode = ref("");
const deliveryDate = ref("");
const deliveryTime = ref("");
const deliveryInstructions = ref("");

// Address strict validation state
const isAddressValid = ref(false);

// Opt-in to save delivery details back to the client's Strapi profile
const saveProfileInfo = ref(true);

// Strapi internal id of the fetched client — required to link the order relation
const currentClientId = ref(null);

// Loading and submission states
const isFetchingClient = ref(false);
const submitting = ref(false);

// Disable the confirm button (silently) while the client id is not yet available
const clientNotReady = computed(() => currentClientId.value === null);

/**
 * Fetch the Strapi client record that matches the logged-in Firebase user's email.
 * Filters by email so each user always sees and updates their own data.
 */
async function fetchClientData() {
  const userEmail = authStore.user?.email;

  if (!userEmail) {
    console.warn('[Checkout] No authenticated user — cannot fetch client data.');
    return;
  }

  try {
    isFetchingClient.value = true;

    // Filter the Strapi clients collection by email to get the current user's record.
    // encodeURIComponent keeps special chars (e.g. '+') safe in the query string.
    const response = await strapiGet(
      `/api/clients?filters[email][$eq]=${encodeURIComponent(userEmail)}`
    );

    // Filtered list endpoint returns { data: [ {...}, ... ] }
    const c = Array.isArray(response?.data) ? response.data[0] : null;

    if (!c) {
      console.warn('[Checkout] No Strapi client found for email:', userEmail);
      return;
    }

    // Store the documentId used to set the order → client relation
    currentClientId.value = c.documentId ?? c.id ?? null;

    // Pre-fill form fields from the Client schema
    const firstName = c.first_name ?? '';
    const lastName  = c.last_name  ?? '';
    if (firstName || lastName) {
      clientName.value = `${firstName} ${lastName}`.trim();
    }

    if (c.phone_number) {
      clientPhone.value = String(c.phone_number);
    }

    if (c.street) {
      addressStreet.value = c.street;
    }

    if (c.number_floor) {
      addressDetails.value = String(c.number_floor);
    }

    if (c.postal_code) {
      postalCode.value = String(c.postal_code);
    }

    console.log('[Checkout] Client pre-filled for', userEmail, '| documentId:', currentClientId.value);
  } catch (err) {
    console.warn('[Checkout] Could not fetch client data:', err.message);
    // currentClientId stays null → confirm button stays disabled
  } finally {
    isFetchingClient.value = false;
  }
}

/**
 * Wait for Firebase auth to settle before fetching client data.
 * watchEffect re-runs whenever isAuthReady or user changes.
 */
watchEffect(() => {
  if (authStore.isAuthReady) {
    fetchClientData();
  }
});

/**
 * Push the current form values back to the client's Strapi record.
 * Maps form fields to the actual Client schema columns:
 *   first_name, last_name ← clientName (split on first space)
 *   phone_number           ← clientPhone
 *   street                 ← addressStreet
 *   number_floor           ← addressDetails
 *   postal_code            ← postalCode
 *
 * Uses strapiPut from shared/utils/strapi.js.
 * Throws on failure so the caller can decide how to handle it.
 */
async function updateClientProfile() {
  if (!currentClientId.value) return; // nothing to update without a known id

  // Split "First Last" → first_name / last_name
  const nameParts  = clientName.value.trim().split(/\s+/);
  const first_name = nameParts[0] ?? '';
  const last_name  = nameParts.slice(1).join(' ') || '';

  // Strapi PUT /api/clients/:documentId
  // strapiPut wraps the payload in { data: { ... } } automatically
  await strapiPut(`/api/clients/${currentClientId.value}`, {
    first_name,
    last_name,
    phone_number: clientPhone.value ? Number(clientPhone.value) : null,
    street:       addressStreet.value  || null,
    number_floor: addressDetails.value || null,
    postal_code:  postalCode.value     ? Number(postalCode.value.replace('-', '')) : null,
  });

  console.log('[Checkout] Client profile updated successfully.');
}

/**
 * Sends the current cart to the Strapi /api/orders endpoint.
 *
 * Payload matches the Strapi 'orders' schema exactly:
 *   order_id (UID), client_id (Relation), products (JSON), combos (JSON),
 *   date (Datetime), address (Text), price (Number), num_products (Number)
 */
async function submitTestOrder() {
  // Guard: block if already submitting, cart is empty, or no client was loaded
  if (submitting.value || cartStore.items.length === 0) return;

  if (!isAddressValid.value) {
    alert('❌ Por favor, selecione uma morada válida na lista para continuar.');
    return;
  }

  if (currentClientId.value === null) {
    alert('❌ Não foi possível identificar o cliente. Por favor, recarregue a página.');
    return;
  }

  submitting.value = true;

  // ── 1. Update client profile with the latest form data (only if opted-in) ───
  if (saveProfileInfo.value) {
    try {
      await updateClientProfile();
    } catch (profileErr) {
      console.warn('[Checkout] Could not update client profile (non-blocking):', profileErr.message);
    }
  }

  // ── Auto-generated order ID ──────────────────────────────────────────────
  const orderId = `ORD-${Date.now()}`;

  // ── Split and serialize items by type with the correct ID key ───────────
  const products = cartStore.items
    .filter((item) => item.type !== 'combo')
    .map((item) => ({
      // Prefer the mapped product_id; fall back to item.id (also the documentId)
      product_id: item.product_id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

  const combos = cartStore.items
    .filter((item) => item.type === 'combo')
    .map((item) => ({
      // Prefer the mapped combo_id; fall back to item.id (also the documentId)
      combo_id: item.combo_id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

  // ── Endereço de entrega — usa o place_name do Mapbox (já é geocodível)
  // addressStreet já contém o endereço completo: ex: "Rua X, 4800-000 Guimarães, Portugal"
  // Não re-concatenar o postal code porque já está dentro do place_name
  const fullAddress = addressDetails.value
    ? `${addressStreet.value}, ${addressDetails.value}`
    : addressStreet.value;
  const fullDateTime = new Date(`${deliveryDate.value}T${deliveryTime.value}`).toISOString();

  // ── Payload — strictly mapped to the Strapi schema, no extra keys ────────
  const payload = {
    data: {
      order_id: orderId,
      client_id: {
        connect: [{ documentId: currentClientId.value }],
      },
      products,
      combos,
      date_delivery: fullDateTime,
      address: fullAddress,
      collection_address: "Av. da Universidade, 4800-058 Guimarães",
      price: cartStore.total,
      num_products: cartStore.itemCount,
      intructions: deliveryInstructions.value,
    },
  };

  try {
    const response = await fetch(`${STRAPI_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[Checkout] submitTestOrder — Strapi error:', errorBody);
      throw new Error(
        errorBody?.error?.message ?? `Erro ao submeter encomenda (${response.status})`
      );
    }

    const result = await response.json();
    console.log('[Checkout] Order created successfully:', result);

    // Success — clear cart and navigate home
    cartStore.clearCart();
    alert(`✅ Encomenda ${orderId} submetida com sucesso!`);
    router.push('/home');
  } catch (err) {
    console.error('[Checkout] submitTestOrder error:', err);
    alert('❌ Erro ao submeter a encomenda: ' + (err.message ?? 'Erro desconhecido.'));
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.checkout-page {
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.checkout-main {
  padding: 40px 0;
}

.checkout-container {
  padding: 0 20px;
}

.checkout-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Title Section ===== */
.checkout-title-section {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-lighter);
}

.page-title {
  font-family: "Public Sans", sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0 0 8px 0;
  line-height: 40px;
}

.page-subtitle {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: var(--secondary-light);
  margin: 0;
  line-height: 24px;
}

/* ===== Layout ===== */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
}

/* Left Column: Form (takes all available space) */
.checkout-form-column {
  display: flex;
  flex-direction: column;
}

/* Right Column: Summary (fixed 360px width) */
.checkout-summary-column {
  position: relative;
}

/* ===== Delivery Card ===== */
.delivery-card {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--dark-text) 0%, var(--dark-text) 100%);
  padding: 24px;
  text-align: center;
}

.card-title {
  font-family: "Public Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 28px;
}

/* ===== Form Styles ===== */
.delivery-form {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background-color: var(--bg-lightest);
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: var(--secondary-light);
  margin-bottom: 12px;
}

.spinner {
  display: inline-block;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Form grid for the address / date-time section */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Full-width inside .form-grid */
.form-group.grid-full {
  grid-column: 1 / -1;
}

/* Legacy side-by-side row (Name + Phone) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-text);
  margin: 0;
}

/* Wrapper that provides the positioning context for the inside icon */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Icon pinned to the left inside the input */
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #103841;
  pointer-events: none;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 16px 12px 42px; /* left room for the icon */
  border: 1.5px solid var(--border-lighter);
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: var(--dark-text);
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: var(--secondary-light);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.1);
}

.form-input:disabled {
  background-color: var(--bg-lightest);
  color: var(--secondary-light);
  cursor: not-allowed;
}

/* ===== Responsive Design ===== */
@media (max-width: 1023px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .checkout-summary-column {
    position: relative;
    top: auto;
  }

  .page-title {
    font-size: 32px;
  }
}

@media (max-width: 767px) {
  .checkout-main {
    padding: 20px 0;
  }

  .checkout-container {
    padding: 0 16px;
  }

  .checkout-title-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .page-title {
    font-size: 28px;
    line-height: 32px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .card-header {
    padding: 20px;
  }

  .card-title {
    font-size: 18px;
  }

  .delivery-form {
    padding: 24px;
    gap: 20px;
  }

  .form-row,
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input {
    font-size: 14px;
    padding: 10px 12px;
  }
}

@media (max-width: 389px) {
  .page-title {
    font-size: 24px;
  }

  .checkout-container {
    padding: 0 12px;
  }
}
</style>
