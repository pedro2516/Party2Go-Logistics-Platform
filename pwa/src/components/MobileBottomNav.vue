<template>
  <section class="m-bottom-nav-section d-lg-none">
    <nav class="bottom-nav">
      <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard' }">
        <i class="bi bi-house" style="font-size: 1.2rem"></i>
        <span class="nav-label">Início</span>
      </router-link>

      <router-link to="/deliveries" class="nav-item" :class="{ active: $route.path === '/deliveries' || $route.path === '/deliveries-pending' }">
        <i class="bi bi-truck" style="font-size: 1.2rem"></i>
        <span class="nav-label">Entregas</span>
      </router-link>

      <router-link to="/map" class="nav-item" :class="{ active: $route.path === '/map' }">
        <i class="bi bi-map" style="font-size: 1.2rem"></i>
        <span class="nav-label">Mapa</span>
      </router-link>

      <router-link to="/chat" class="nav-item" :class="{ active: $route.path === '/chat' }">
        <div style="position: relative; display: inline-flex;">
          <i class="bi bi-chat-dots" style="font-size: 1.2rem"></i>
          <span v-if="hasUnread" class="nav-unread-badge"></span>
        </div>
        <span class="nav-label">Chat</span>
      </router-link>
    </nav>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useCourierStore } from "../stores/index.js";
import { storeToRefs } from "pinia";
import { strapiGet } from "@shared/utils/strapi.js";

const courierStore = useCourierStore();
const { courierProfile } = storeToRefs(courierStore);

const hasUnread = ref(false);
let polling = null;

async function checkUnread() {
  if (!courierProfile.value?.documentId) return;
  try {
    const path = `/api/messages?filters[courier][documentId][$eq]=${courierProfile.value.documentId}&filters[is_read][$eq]=false&filters[sender][$ne]=courier&pagination[limit]=1`;
    const json = await strapiGet(path);
    hasUnread.value = (json.data ?? []).length > 0;
  } catch (err) {
    console.error("[MobileBottomNav] checkUnread error:", err);
  }
}

onMounted(() => {
  checkUnread();
  polling = setInterval(checkUnread, 10000); // Poll every 10s
});

onUnmounted(() => {
  if (polling) clearInterval(polling);
});
</script>

<style scoped>
/* Align position rules across all layouts */
.bottom-nav, .mobile-bottom-nav, .business-bottom-nav, footer, .backoffice-bottom-nav {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  width: 100% !important;
}

.m-bottom-nav-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff !important;
  border-top: 1px solid #f1f5f9;
  z-index: 9999 !important;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  padding: 0;
  margin: 0;
  background-color: #ffffff !important;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #64748b;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  height: 100%;
}

.nav-item:hover,
.nav-item.active {
  color: #fd5e3a;
}

.nav-label {
  font-family: "Public Sans", sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

/* Hide on desktop */
@media (min-width: 1024px) {
  .m-bottom-nav-section {
    display: none;
  }
}

.nav-unread-badge {
  position: absolute;
  top: -2px;
  right: -6px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: navPulse 1.5s infinite;
  border: 1px solid white;
}

@keyframes navPulse {
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

<style>
/* Global footer hiding rule when hide-footer is active on body */
body.hide-footer .m-bottom-nav-section {
  display: none !important;
}
</style>
