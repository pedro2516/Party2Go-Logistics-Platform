<template>
  <div class="chat-page">
    <BusinessHeader v-if="isBusiness" />
    <HomeHeader v-else />
    <main class="chat-main">
      <div class="chat-layout" :class="{ 'chat-layout--active': selectedConversation }">
        
        <!-- Sidebar: Conversations List -->
        <aside class="chat-sidebar" :class="{ 'd-none-mobile': selectedConversation }">
          <div class="sidebar-header">
            <h1 class="sidebar-title">Mensagens</h1>
          </div>

          <div class="sidebar-body">
          <div v-if="loadingOrders" class="state-message" style="min-height: 250px;">
            <i class="bi bi-arrow-repeat spin"></i>
            <span>A carregar Conversas...</span>
          </div>

          <template v-else>
            <!-- Support Section -->
            <div class="sidebar-section">
              <span class="section-label">ADMINISTRAÇÃO</span>
              <div 
                class="conversation-item support-item" 
                :class="{ 'item--active': selectedConversation?.id === 'support' }"
                @click="selectSupport"
              >
                <div class="item-avatar admin">
                  <i class="bi bi-shield-lock-fill"></i>
                  <span v-if="supportConversation.hasUnread" class="unread-badge"></span>
                </div>
                <div class="item-content">
                  <h3 class="item-name">Suporte Party2Go</h3>
                  <p class="item-preview">{{ supportConversation.lastMessage }}</p>
                </div>
                <div v-if="selectedConversation?.id === 'support'" class="active-indicator"></div>
              </div>
            </div>

            <!-- Active Orders Section -->
            <div class="sidebar-section">
              <span class="section-label">ENTREGAS ATIVAS</span>
              <div v-if="activeOrderConversations.length === 0" class="list-empty">
                <p>Nenhuma entrega ativa</p>
              </div>
              <div 
                v-for="conv in activeOrderConversations" 
                :key="conv.id" 
                class="conversation-item"
                :class="{ 'item--active': selectedConversation?.id === conv.id }"
                @click="selectConversation(conv)"
              >
                <div class="item-avatar courier">
                  <i class="bi bi-truck"></i>
                  <span v-if="conv.hasUnread" class="unread-badge"></span>
                </div>
                <div class="item-content">
                  <h3 class="item-name">{{ conv.name }} (#{{ conv.orderId }})</h3>
                  <p class="item-preview">{{ conv.lastMessage }}</p>
                </div>
                <div v-if="selectedConversation?.id === conv.id" class="active-indicator"></div>
              </div>
            </div>

            <!-- Past Orders Section -->
            <div class="sidebar-section" v-if="pastOrderConversations.length > 0">
              <span class="section-label">ENTREGAS PASSADAS</span>
              <div 
                v-for="conv in pastOrderConversations" 
                :key="conv.id" 
                class="conversation-item past-item"
                :class="{ 'item--active': selectedConversation?.id === conv.id }"
                @click="selectConversation(conv)"
              >
                <div class="item-avatar courier">
                  <i class="bi bi-truck" style="opacity: 0.6;"></i>
                  <span v-if="conv.hasUnread" class="unread-badge"></span>
                </div>
                <div class="item-content">
                  <h3 class="item-name" style="opacity: 0.8;">{{ conv.name }} (#{{ conv.orderId }})</h3>
                  <p class="item-preview">{{ conv.lastMessage }}</p>
                </div>
                <div v-if="selectedConversation?.id === conv.id" class="active-indicator"></div>
              </div>
            </div>
          </template>
          </div>
        </aside>

        <!-- Main: Chat Window -->
        <section class="chat-window" :class="{ 'd-flex-mobile': selectedConversation }">
          <template v-if="selectedConversation">
            <!-- Chat Header -->
            <div class="chat-header">
              <button class="back-btn-mobile" @click="selectedConversation = null">
                <i class="bi bi-arrow-left"></i>
              </button>
              <div :class="['header-avatar', selectedConversation.type]">
                <i :class="selectedConversation.type === 'admin' ? 'bi bi-shield-lock-fill' : 'bi bi-truck'"></i>
              </div>
              <div class="header-text">
                <h2 class="header-name">{{ selectedConversation.name }}</h2>
                <span class="header-status">{{ selectedConversation.type === 'admin' ? 'Suporte' : 'Estafeta' }}</span>
              </div>
            </div>

            <!-- Messages Area -->
            <div class="messages-area" ref="messagesContainer">
              <div v-if="loadingMessages" class="chat-loading">
                <i class="bi bi-arrow-repeat spin"></i>
                <span>A carregar...</span>
              </div>

              <div v-else-if="messages.length === 0" class="chat-empty-state">
                <i class="bi bi-chat-dots"></i>
                <p>Sem mensagens ainda.</p>
              </div>

              <template v-else>
                <div v-for="msg in messages" :key="msg.id" :class="['message-row', msg.sender === 'client' ? 'row--outgoing' : 'row--incoming']">
                  <div class="message-bubble">
                    <p class="message-text">{{ msg.content }}</p>
                    <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Chat Input -->
            <div class="chat-input-wrapper">
              <div class="input-container">
                <input 
                  v-model="newMessage" 
                  type="text" 
                  class="message-input" 
                  placeholder="Escreva uma mensagem..."
                  @keyup.enter="sendMessage"
                >
                <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim() || sending">
                  <i class="bi bi-send-fill"></i>
                </button>
              </div>
            </div>
          </template>

          <!-- Select Conversation Placeholder -->
          <div v-else class="chat-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <i class="bi bi-chat-dots"></i>
              </div>
              <h2>As Suas Conversas</h2>
              <p>Selecione um contacto à esquerda para começar a falar.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@backend/auth/authStore.js'
import { strapiGet, strapiPost, strapiPut, mapOrder } from '@shared/utils/strapi.js'
import HomeHeader from "@/components/home/HomeHeader.vue"
import BusinessHeader from "@/components/business/BusinessHeader.vue"

const route = useRoute()
const authStore = useAuthStore()
const isBusiness = computed(() => authStore.userRole === 'business' || authStore.userRole === 'enterprise')

const currentClientId = ref(null)

const selectedConversation = ref(null)
const activeOrderConversations = ref([])
const pastOrderConversations = ref([])
const messages = ref([])
const newMessage = ref('')
const loadingOrders = ref(true)
const loadingMessages = ref(false)
const sending = ref(false)
const messagesContainer = ref(null)
let pollingInterval = null

async function getClientDocumentId() {
  const userEmail = authStore.user?.email;
  if (!userEmail) return null;
  
  try {
    const response = await strapiGet(`/api/clients?filters[email][$eq]=${encodeURIComponent(userEmail)}`);
    const c = Array.isArray(response?.data) ? response.data[0] : null;
    return c?.documentId || null;
  } catch (err) {
    return null;
  }
}

async function fetchActiveOrders() {
  currentClientId.value = await getClientDocumentId();
  if (!currentClientId.value) return;
  
  loadingOrders.value = true
  try {
    // 1. Fetch Orders
    const ordersPath = `/api/orders?filters[client_id][documentId][$eq]=${currentClientId.value}&populate=*`
    const ordersJson = await strapiGet(ordersPath)
    const baseOrders = (ordersJson.data ?? []).map(mapOrder)

    const completedStatuses = ['completed', 'delivered', 'entregue', 'cancelled', 'cancelado']
    const activeOrders = baseOrders.filter(o => !completedStatuses.includes(o.status))
    const pastOrders = baseOrders.filter(o => completedStatuses.includes(o.status))

    // 2. Fetch all recent messages for this client to build previews
    const messagesPath = `/api/messages?filters[client][documentId][$eq]=${currentClientId.value}&sort=createdAt:desc&pagination[limit]=100&populate=*`
    const msgsJson = await strapiGet(messagesPath)
    const allMsgs = msgsJson.data ?? []

    // Helper to find last message for a specific filter
    const getLastMsg = (orderDocId) => {
      const match = allMsgs.find(m => {
        if (orderDocId === null) return !m.order
        return m.order?.documentId === orderDocId
      })
      return match ? match.content : null
    }

    // Helper to check if there are unread messages for a specific channel
    const getHasUnread = (orderDocId, expectedSender) => {
      return allMsgs.some(m => {
        const matchesSender = m.sender === expectedSender
        const matchesUnread = !m.is_read
        if (orderDocId === null) {
          return !m.order && matchesSender && matchesUnread
        }
        return m.order?.documentId === orderDocId && matchesSender && matchesUnread
      })
    }

    // 3. Build Support Conversation
    supportConversation.value = {
      id: 'support',
      type: 'admin',
      name: 'Suporte Party2Go',
      lastMessage: getLastMsg(null) || 'Inicie uma conversa com o suporte',
      hasUnread: getHasUnread(null, 'admin')
    }

    // 4. Build Active Conversations
    activeOrderConversations.value = activeOrders.map(order => ({
      id: `order-${order.id}`,
      type: 'courier',
      name: order.courierName || 'Estafeta (A atribuir)',
      orderId: order.id,
      orderDocumentId: order.documentId,
      courierDocumentId: order.courierDocumentId,
      lastMessage: getLastMsg(order.documentId) || 'Sem mensagens ainda',
      hasUnread: getHasUnread(order.documentId, 'courier')
    }))

    // 5. Build Past Conversations
    pastOrderConversations.value = pastOrders.map(order => ({
      id: `order-${order.id}`,
      type: 'courier',
      name: order.courierName || 'Estafeta',
      orderId: order.id,
      orderDocumentId: order.documentId,
      courierDocumentId: order.courierDocumentId,
      lastMessage: getLastMsg(order.documentId) || 'Sem mensagens ainda',
      hasUnread: getHasUnread(order.documentId, 'courier')
    }))

  } catch (err) {
    console.error('[Frontoffice Chat] fetchActiveOrders error:', err)
  } finally {
    loadingOrders.value = false
  }
}

const supportConversation = ref({
  id: 'support',
  type: 'admin',
  name: 'Suporte Party2Go',
  lastMessage: 'A carregar...'
})

function selectSupport() {
  selectedConversation.value = supportConversation.value
  startChat()
}

function selectConversation(conv) {
  selectedConversation.value = conv
  startChat()
}

async function startChat() {
  messages.value = []
  loadingMessages.value = true
  await fetchMessages()
  
  if (pollingInterval) clearInterval(pollingInterval)
  pollingInterval = setInterval(fetchMessages, 5000)
}

async function fetchMessages() {
  if (!currentClientId.value || !selectedConversation.value) return
  
  try {
    let filters = `filters[client][documentId][$eq]=${currentClientId.value}`
    if (selectedConversation.value.type === 'admin') {
      filters += `&filters[order][id][$null]=true`
    } else {
      filters += `&filters[order][documentId][$eq]=${selectedConversation.value.orderDocumentId}`
    }

    const path = `/api/messages?${filters}&sort=createdAt:asc&populate=*`
    const json = await strapiGet(path)
    const newMessages = (json.data ?? []).map(m => ({
      id: m.id,
      documentId: m.documentId,
      content: m.content,
      sender: m.sender,
      timestamp: m.createdAt
    }))

    const shouldScroll = messages.value.length !== newMessages.length
    messages.value = newMessages
    
    if (shouldScroll) {
      await nextTick()
      scrollToBottom()
    }

    // Mark unread incoming messages as read
    const expectedSender = selectedConversation.value.type === 'admin' ? 'admin' : 'courier'
    const unread = (json.data ?? []).filter(m => m.sender === expectedSender && !m.is_read)
    for (const msg of unread) {
      await strapiPut(`/api/messages/${msg.documentId}`, { is_read: true })
    }

    if (unread.length > 0) {
      if (selectedConversation.value.type === 'admin') {
        supportConversation.value.hasUnread = false
      } else {
        let idx = activeOrderConversations.value.findIndex(c => c.orderDocumentId === selectedConversation.value.orderDocumentId)
        if (idx !== -1) {
          activeOrderConversations.value[idx].hasUnread = false
        } else {
          idx = pastOrderConversations.value.findIndex(c => c.orderDocumentId === selectedConversation.value.orderDocumentId)
          if (idx !== -1) {
            pastOrderConversations.value[idx].hasUnread = false
          }
        }
      }
    }
  } catch (err) {
    console.error('[Frontoffice Chat] fetchMessages error:', err)
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !currentClientId.value) return
  
  const text = newMessage.value
  const conv = selectedConversation.value
  newMessage.value = ''
  sending.value = true
  
  try {
    const payload = {
      content: text,
      sender: 'client',
      client: currentClientId.value,
      is_read: false
    }
    if (conv.type === 'courier') {
      payload.order = conv.orderDocumentId
      if (conv.courierDocumentId) {
        payload.courier = conv.courierDocumentId
      }
    }
    
    await strapiPost('/api/messages', payload)
    await fetchMessages()
  } catch (err) {
    console.error('[Frontoffice Chat] sendMessage error:', err)
    alert('Erro ao enviar mensagem.')
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
}

onMounted(async () => {
  await fetchActiveOrders()
  
  // Auto-select if orderId is in query
  const targetOrderId = route.query.orderId
  if (targetOrderId) {
    let found = activeOrderConversations.value.find(c => c.orderDocumentId === targetOrderId)
    if (!found) {
      found = pastOrderConversations.value.find(c => c.orderDocumentId === targetOrderId)
    }
    if (found) selectConversation(found)
  }
})
onUnmounted(() => pollingInterval && clearInterval(pollingInterval))
</script>

<style scoped>
.chat-page {
  width: 100%;
  height: calc(100vh - 72px);
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.chat-main {
  flex: 1;
  width: 100%;
  max-width: 1440px; /* Matched to Header max-width */
  margin: 0 auto;
  padding: 0 24px; /* Matched to Header horizontal padding */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chat-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  background: white;
  overflow: hidden;
}

@media (min-width: 768px) {
  .chat-layout {
    grid-template-columns: 320px 1fr;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
  }
}

@media (min-width: 1024px) {
  .chat-layout {
    grid-template-columns: 380px 1fr;
  }
}

/* Sidebar */
.chat-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f1f5f9;
  background-color: white;
  z-index: 2;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-title {
  font-family: "Public Sans", sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #103841;
  margin: 0;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.sidebar-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  padding: 0 20px 8px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  margin: 2px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.conversation-item:hover {
  background-color: #f8fafc;
}

.conversation-item.item--active {
  background-color: #fef3f0;
}

.active-indicator {
  position: absolute;
  right: 16px;
  width: 6px;
  height: 6px;
  background-color: #fd5e3a;
  border-radius: 50%;
}

.item-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative; /* Set to relative for badge placement */
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: badgePulse 1.5s infinite;
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

.item-avatar.admin { background-color: #fd5e3a; color: white; }
.item-avatar.client { background-color: #f1f5f9; color: #64748b; }

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px;
}

.item--active .item-name { color: #fd5e3a; }

.item-preview {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chat Window */
.chat-window {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #f1f5f9;
}

.back-btn-mobile {
  display: none;
  font-size: 24px;
  color: #fd5e3a;
  background: #fff;
  border: 1px solid #f1f5f9;
  padding: 8px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  line-height: 0;
}

.header-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.header-avatar.admin { background-color: #fd5e3a; color: white; }
.header-avatar.client { background-color: #f1f5f9; color: #64748b; }

.header-text { display: flex; flex-direction: column; }
.header-name { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
.header-status { font-size: 12px; color: #64748b; font-weight: 600; }

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-loading, .chat-empty-state {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Increased gap as requested */
  color: #94a3b8;
}

.chat-loading i, .chat-empty-state i {
  font-size: 32px;
}

.message-row {
  display: flex;
  width: 100%;
}

.row--incoming { justify-content: flex-start; }
.row--outgoing { justify-content: flex-end; }

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.row--incoming .message-bubble {
  background-color: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.row--outgoing .message-bubble {
  background-color: #fd5e3a;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-text { font-size: 14px; line-height: 1.5; margin: 0; }
.message-time { display: block; font-size: 10px; margin-top: 4px; opacity: 0.7; text-align: right; }

.chat-input-wrapper {
  padding: 16px 24px;
  background-color: white;
  border-top: 1px solid #f1f5f9;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f1f5f9;
  padding: 8px 12px;
  border-radius: 999px;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
}

.action-btn { background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; display: flex; align-items: center; }
.send-btn {
  background-color: #fd5e3a;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}
.send-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; }

/* Placeholder */
.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #94a3b8;
  padding: 40px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #e2e8f0;
}

.placeholder-content h2 { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.placeholder-content p { font-size: 14px; max-width: 250px; margin: 0 auto; }

/* Mobile logic */
@media (max-width: 767px) {
  .chat-layout { border-radius: 0; border: none; }
  .chat-main { padding: 0; height: 100%; }
  .chat-sidebar { height: 100%; }
  .chat-window { height: 100%; display: none; position: fixed; top: 0; left: 0; width: 100%; z-index: 10000; }
  
  .chat-layout--active .chat-sidebar { display: none; }
  .chat-layout--active .chat-window { display: flex; }
  .back-btn-mobile { display: block; }

  .messages-area { height: calc(100vh - 140px); }
  .chat-input-wrapper { padding-bottom: 40px; }
}

.spin { 
  display: inline-block;
  animation: spin 1s linear infinite; 
}
@keyframes spin { 
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); } 
}

.list-loading, .list-empty { padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; }
</style>
