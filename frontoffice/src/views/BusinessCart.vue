<template>
  <div class="cart-page">
    <!-- Business Header -->
    <BusinessHeader />

    <main class="cart-main">
      <!-- Empty Cart State -->
      <div v-if="cartItems.length === 0" class="cart-container-empty">
        <div class="empty-cart-message-wrapper">
          <i class="bi bi-bag-check empty-icon"></i>
          <h2 class="empty-title">O Carrinho Está Vazio</h2>
          <p class="empty-description">Nenhuma entrega foi adicionada. Volta para criar uma nova entrega.</p>
          <router-link to="/request-delivery" class="btn-back-home">
            <i class="bi bi-arrow-left"></i>
            Nova Entrega
          </router-link>
        </div>
      </div>

      <!-- Cart with Items -->
      <div v-else class="cart-container-with-items">
        <div class="cart-content">
          <!-- Page Title -->
          <div class="cart-title-section">
            <h1 class="page-title">Carrinho de Entregas</h1>
            <span class="item-count">{{ cartItems.length }} {{ cartItems.length === 1 ? 'entrega' : 'Entregas' }}</span>
          </div>

          <div class="row m-0 w-100 g-4 align-items-start">
            <!-- Cart Items Column (same CartItem component) -->
            <div class="col-12 col-lg-8 cart-items-column">
              <div class="cart-items-list">
                <CartItem
                  v-for="(item, index) in adaptedItems"
                  :key="index"
                  :item="item"
                  @remove="removeItem"
                />
              </div>
            </div>

            <!-- Cart Summary Column (same CartSummary component) -->
            <div class="col-12 col-lg-4 cart-summary-column">
              <CartSummary
                :items="adaptedItems"
                :shipping-cost="8"
                @checkout="handleCheckout"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Business Bottom Nav (Mobile) -->
    <BusinessBottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BusinessHeader from '@/components/business/BusinessHeader.vue'
import BusinessBottomNav from '@/components/business/BusinessBottomNav.vue'
import CartItem from '@shared/components/CartItem.vue'
import CartSummary from '@shared/components/CartSummary.vue'
import { strapiPost } from '@shared/utils/strapi'
import { useAuthStore } from '@backend/auth/authStore'

const router = useRouter()
const authStore = useAuthStore()
const cartItems = ref([])
const submitting = ref(false)
const deliveryPrices = ref({}) // Map: index -> price

const STRAPI_URL = 'http://localhost:1337'
const RATE_PER_KM = 0.65
const SERVICE_FEE = 2.50
const MIN_PRICE = 3.50
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

/**
 * Calculate distance in km between two GPS points using the Haversine formula.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Geocode an address string to { lat, lng } using Mapbox.
 */
async function geocodeAddress(address) {
  if (!MAPBOX_TOKEN || !address) return null
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=pt&limit=1`
    const res = await fetch(url)
    const data = await res.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return { lat, lng }
    }
  } catch (err) {
    console.error('[BusinessCart] Geocoding error:', err)
  }
  return null
}

/**
 * Calculate delivery price for a cart item based on distance.
 * price = (distance_km × RATE_PER_KM) + SERVICE_FEE, min MIN_PRICE
 */
async function calculateDeliveryPrice(item) {
  let pickupCoords = item.recolha?.coords
  let deliveryCoords = item.entrega?.coords

  // Fallback: geocode from address text if no coordinates stored
  if (!pickupCoords && item.recolha?.endereco) {
    pickupCoords = await geocodeAddress(item.recolha.endereco)
  }
  if (!deliveryCoords && item.entrega?.endereco) {
    deliveryCoords = await geocodeAddress(item.entrega.endereco)
  }

  if (!pickupCoords || !deliveryCoords) {
    return MIN_PRICE // Fallback minimum price if we can't geocode
  }

  const distKm = haversineDistance(
    pickupCoords.lat, pickupCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  )

  const price = (distKm * RATE_PER_KM) + SERVICE_FEE
  return Math.max(price, MIN_PRICE)
}

/**
 * Calculate prices for all cart items.
 */
async function calculateAllPrices() {
  const prices = {}
  for (let i = 0; i < cartItems.value.length; i++) {
    prices[i] = await calculateDeliveryPrice(cartItems.value[i])
  }
  deliveryPrices.value = prices
}

onMounted(async () => {
  const savedCart = localStorage.getItem('party2go-business-cart')
  if (savedCart) {
    try {
      cartItems.value = JSON.parse(savedCart)
    } catch (e) {
      cartItems.value = []
    }
  }
  if (cartItems.value.length > 0) {
    await calculateAllPrices()
  }
})

/**
 * Adapt delivery items to the shape CartItem expects:
 * { id, name, image, price, quantity }
 */
const adaptedItems = computed(() =>
  cartItems.value.map((item, index) => ({
    id: `delivery-${index}`,
    name: `Entrega ${index + 1}`,
    image: '',
    price: deliveryPrices.value[index] ?? 0,
    quantity: 1,
    _raw: item,
  }))
)

/**
 * Total shipping cost = sum of all delivery prices
 */
const totalShippingCost = computed(() => {
  return Object.values(deliveryPrices.value).reduce((sum, p) => sum + p, 0)
})

/**
 * Calculate total price from all items in cart
 */
const totalPrice = computed(() => {
  return Object.values(deliveryPrices.value).reduce((sum, p) => sum + p, 0)
})

function removeItem(itemId) {
  const index = parseInt(itemId.replace('delivery-', ''))
  cartItems.value.splice(index, 1)
  localStorage.setItem('party2go-business-cart', JSON.stringify(cartItems.value))
  // Recalculate prices after removal
  calculateAllPrices()
}

/**
 * Main checkout handler: validates cart, fetches client data, constructs order payload,
 * and submits to Strapi /api/orders endpoint.
 */
async function handleCheckout() {
  // Guard: prevent duplicate submissions
  if (submitting.value) return

  // Guard: ensure cart is not empty
  if (cartItems.value.length === 0) {
    alert('❌ O carrinho está vazio. Adicione entregas antes de prosseguir.')
    return
  }

  // Guard: ensure user is authenticated
  if (!authStore.user?.email) {
    alert('❌ Utilizador não autenticado. Por favor, faça login novamente.')
    return
  }

  submitting.value = true

  try {
    // ── Step 1: Fetch the current user's client record from Strapi ───────────
    const clientResponse = await fetch(
      `${STRAPI_URL}/api/clients?filters[email][$eq]=${encodeURIComponent(authStore.user.email)}`
    )

    if (!clientResponse.ok) {
      throw new Error(`Não foi possível carregar dados do cliente (${clientResponse.status})`)
    }

    const clientData = await clientResponse.json()
    const client = Array.isArray(clientData?.data) ? clientData.data[0] : null

    if (!client) {
      alert('❌ Cliente não encontrado no sistema. Por favor, contacte o suporte.')
      return
    }

    const clientId = client.documentId ?? client.id

    // ── Step 2: Transform each delivery item into the order format ───────────
    // Each item in cartItems is a business delivery with recolha, entrega, mercadoriaList
    // We'll create one order per delivery item (or group them if needed)
    
    // For now, we'll create a single order with all deliveries as products
    const orders = cartItems.value.map((delivery, index) => {
      const calculatedPrice = deliveryPrices.value[index] ?? 0

      // Map merchandise list to products array
      const products = (delivery.mercadoriaList || []).map((item) => ({
        product_id: `delivery-item-${index}-${Date.now()}`,
        name: item.tipoLabel || item.tipo || 'Entrega',
        price: calculatedPrice,
        quantity: 1,
        specs: [
          { label: "Peso", value: item.peso ? `${item.peso} kg` : "0 kg" },
          { label: "Dimensão", value: item.dimensoes || "0x0x0" }
        ],
        tags: item.requirements || []
      }))

      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${index}`

      // Collect all requirements/tags across every merchandise item
      const tags = [
        ...new Set(
          (delivery.mercadoriaList || []).flatMap((item) => item.requirements || [])
        ),
      ]

      return {
        order_id: orderId,
        client_id: {
          connect: [{ documentId: clientId }],
        },
        products: products.length > 0 ? products : [
          {
            product_id: `delivery-${index}`,
            name: `Entrega ${index + 1}`,
            price: calculatedPrice,
            quantity: 1,
          },
        ],
        combos: [],
        date_collection: delivery.recolha?.datetime
          ? new Date(delivery.recolha.datetime).toISOString()
          : new Date().toISOString(),
        date_delivery: delivery.entrega?.datetime
          ? new Date(delivery.entrega.datetime).toISOString()
          : new Date().toISOString(),
        address: delivery.entrega?.endereco || '',
        collection_address: delivery.recolha?.endereco || '',
        price: calculatedPrice,
        num_products: products.length > 0 ? products.length : 1,
        intructions: delivery.entrega?.instructions || '',
        tags,
      }
    })

    // ── Step 3: Submit each order to Strapi ───────────────────────────────
    const results = []
    for (const order of orders) {
      try {
        console.log('[BusinessCart] Submitting order payload:', JSON.stringify(order, null, 2))
        const response = await strapiPost('/api/orders', order)
        results.push(response)
        console.log('[BusinessCart] Order created successfully:', response)
      } catch (err) {
        console.error('[BusinessCart] Failed to create order:', err.message)
        console.error('[BusinessCart] Order payload that failed:', JSON.stringify(order, null, 2))
        throw new Error(`Erro ao submeter encomenda: ${err.message}`)
      }
    }

    // ── Step 4: Success — clear cart and redirect ──────────────────────────
    cartItems.value = []
    localStorage.removeItem('party2go-business-cart')

    alert(
      `✅ ${results.length} encomenda${results.length !== 1 ? 's' : ''} submetida${
        results.length !== 1 ? 's' : ''
      } com sucesso!`
    )

    // Redirect to home page
    router.push('/business')
  } catch (err) {
    console.error('[BusinessCart] Checkout error:', err)
    alert(`❌ Erro ao processar checkout: ${err.message ?? 'Erro desconhecido.'}`)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ============================================================
   Cart Styles
   ============================================================ */

.cart-page {
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.cart-main {
  padding: 40px 0;
}

/* ===== Empty Cart State ===== */
.cart-container-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 40px 20px;
}

.empty-cart-message-wrapper {
  text-align: center;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  padding: 60px 40px;
  border-radius: 32px;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 80px;
  color: #fd5e3a;
  display: block;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-title {
  font-family: "Public Sans", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #103841;
  margin: 0 0 12px 0;
  line-height: 36px;
}

.empty-description {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 24px;
}

.btn-back-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #fd5e3a 0%, #e04e2a 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.btn-back-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 94, 58, 0.4);
}

/* ===== Cart with Items ===== */
.cart-container-with-items {
  padding: 0 20px;
}

.cart-content {
  max-width: 1400px;
  margin: 0 auto;
}

.cart-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.page-title {
  font-family: "Public Sans", sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #103841;
  margin: 0;
  line-height: 40px;
  flex: 1;
}

.item-count {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: #64748b;
  background-color: #f0f0f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;
}

.cart-items-column {
  display: flex;
  flex-direction: column;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease;
}

.cart-summary-column {
  position: relative;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Tablet Responsive (768px - 1023px) ===== */
@media (max-width: 1023px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .page-title {
    font-size: 32px;
  }

  .empty-cart-message-wrapper {
    padding: 50px 30px;
  }
}

/* ===== Mobile Responsive (390px - 767px - iPhone 16) ===== */
@media (max-width: 767px) {
  .cart-main {
    padding: 20px 0;
  }

  .cart-container-empty {
    min-height: 500px;
    padding: 24px 16px;
  }

  .empty-cart-message-wrapper {
    padding: 40px 24px;
    border-radius: 24px;
    max-width: 100%;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .empty-title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .empty-description {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .btn-back-home {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
  }

  .cart-container-with-items {
    padding: 0 16px;
  }

  .cart-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 16px;
  }

  .page-title {
    font-size: 28px;
    line-height: 32px;
    width: 100%;
  }

  .item-count {
    font-size: 12px;
    padding: 4px 10px;
  }

  .cart-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* ===== Extra Small (320px - 389px) ===== */
@media (max-width: 389px) {
  .page-title {
    font-size: 24px;
  }

  .cart-container-with-items {
    padding: 0 12px;
  }

  .cart-content {
    margin: 0 auto;
  }
}
</style>
