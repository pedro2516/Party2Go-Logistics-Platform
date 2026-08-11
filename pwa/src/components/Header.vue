<template>
  <header class="home-header">
    <nav
      class="navbar navbar-expand-lg navbar-light bg-white px-4 py-3 sticky-top"
    >
      <div
        class="container-fluid"
        style="max-width: 1440px; margin: 0 auto; padding: 0"
      >
        <div class="navbar-brand d-flex align-items-center gap-2">
          <div class="logo-icon">
            <img
              src="@/assets/logo.svg"
              alt="Logótipo Party2Go"
              class="logo-img"
            />
          </div>
          <div class="logo-text">
            <span class="brand-name">Party</span
            ><span class="brand-accent">2Go</span>
          </div>
        </div>

        <router-link
          to="/profile"
          class="navbar-client-mobile d-lg-none border-0"
          aria-label="Perfil"
        >
          <i
            class="bi bi-person"
            :style="{
              fontSize: '1.8rem',
              color:
                $route.path === '/profile'
                  ? 'var(--primary-color)'
                  : 'var(--dark-text)',
            }"
          ></i>
        </router-link>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/dashboard' }]"
                to="/dashboard"
                >INÍCIO</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/deliveries' }]"
                to="/deliveries"
                >ENTREGAS</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/map' }]"
                to="/map"
                >MAPA</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/chat' }]"
                to="/chat"
                style="position: relative;"
              >
                CHAT
                <span v-if="hasUnread" class="header-unread-badge"></span>
              </router-link>
            </li>
          </ul>
        </div>

        <div
          class="navbar-section right-section d-none d-lg-flex align-items-center gap-2"
        >
          <button class="btn btn-client-area" @click="$router.push('/profile')">
            Perfil
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useCourierStore } from "../stores/index.js";
import { storeToRefs } from "pinia";
import { strapiGet } from "@shared/utils/strapi.js";

const $router = useRouter();

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
    console.error("[Header] checkUnread error:", err);
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
header,
.home-header,
.dm-desktop-header,
.dm-mobile-header,
.navbar,
.cart-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 9999 !important;
}

.home-header {
  background-color: white;
  border-bottom: 1px solid var(--border-lighter);
}

.navbar {
  padding: 16px 24px !important;
}

.navbar-brand {
  flex: 1;
  gap: 8px;
}

.navbar-collapse {
  flex: 0 0 auto !important;
  justify-content: center;
}

.right-section {
  flex: 1;
  justify-content: flex-end;
}

.logo-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  align-items: center;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 24px;
  gap: 2px;
}

.brand-name {
  color: var(--dark-text);
}

.brand-accent {
  color: var(--primary-color);
}

.navbar-nav .nav-link {
  color: var(--dark-text) !important;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 16px;
  padding: 8px 0 !important;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.navbar-nav .nav-link.active,
.navbar-nav .nav-link:hover {
  color: var(--primary-color) !important;
  border-bottom-color: var(--primary-color);
}

.nav-link {
  position: relative;
  padding-bottom: 8px !important;
}

.btn-link {
  color: var(--dark-text);
  text-decoration: none;
}

.btn-link:hover {
  color: var(--primary-color);
}

.btn-client-area {
  background-color: var(--primary-color);
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px 14px;
  border-radius: 9999px;
  border: none;
  box-shadow:
    0px 10px 15px -3px rgba(253, 94, 58, 0.2),
    0px 4px 6px -4px rgba(253, 94, 58, 0.2);
  transition: all 0.3s ease;
}

.btn-client-area:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0px 12px 18px -3px rgba(253, 94, 58, 0.3);
}

.navbar-client-link {
  color: var(--dark-text);
  text-decoration: none;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-client-link:hover {
  color: var(--primary-color);
}

.navbar-client-mobile {
  color: var(--dark-text);
  text-decoration: none;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-client-mobile:hover {
  color: var(--primary-color);
}

/* Mobile responsive */
@media (max-width: 991px) {
  .navbar-collapse {
    display: none !important;
  }

  .navbar-nav .nav-link {
    margin: 8px 0;
    border-bottom: none;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .d-flex.gap-3{
    margin-top: 16px;
    justify-content: flex-start;
  }
}

@media (max-width: 576px) {
  .navbar {
    padding: 12px 16px !important;
  }

  .logo-text {
    font-size: 20px;
  }

  .navbar-nav {
    margin-left: 0 !important;
  }

  .btn-client-area {
    width: 100%;
    padding: 10px 16px;
    font-size: 12px;
  }
}

.header-unread-badge {
  position: absolute;
  top: 4px;
  right: -10px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: headerPulse 1.5s infinite;
}

@keyframes headerPulse {
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
