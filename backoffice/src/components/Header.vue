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

        <button
          class="btn-logout-mobile d-lg-none border-0"
          aria-label="Sair"
          @click="handleLogout"
        >
          <i
            class="bi bi-box-arrow-right"
            style="font-size: 1.8rem; color: #103841"
          ></i>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/logistics' }]"
                to="/logistics"
                >INÍCIO</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                :class="[
                  'nav-link',
                  { active: $route.path === '/logistics/couriers' },
                ]"
                to="/logistics/couriers"
                style="position: relative;"
              >
                ESTAFETAS
                <span v-if="hasUnread" class="header-unread-badge"></span>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                :class="[
                  'nav-link',
                  { active: $route.path === '/logistics/deliveries' },
                ]"
                to="/logistics/deliveries"
                >ENTREGAS</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                :class="[
                  'nav-link',
                  { active: $route.path === '/logistics/map' },
                ]"
                to="/logistics/map"
                >MAPA</router-link
              >
            </li>
          </ul>
        </div>

        <div
          class="navbar-section right-section d-none d-lg-flex align-items-center gap-2"
        >
          <button class="btn-logout" aria-label="Logout" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { strapiGet } from "@shared/utils/strapi.js";

const $router = useRouter();

const hasUnread = ref(false);
let polling = null;

async function checkUnread() {
  try {
    const path = "/api/messages?filters[sender][$eq]=courier&filters[is_read][$eq]=false&filters[order][id][$null]=true&pagination[limit]=1";
    const json = await strapiGet(path);
    hasUnread.value = (json.data ?? []).length > 0;
  } catch (err) {
    console.error("[Header] checkUnread error:", err);
  }
}

function handleLogout() {
  $router.push("/login");
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
  border-bottom: 1px solid #f0f0f0;
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
  color: #103841;
}

.brand-accent {
  color: #fd5e3a;
}

.navbar-nav .nav-link {
  color: #103841 !important;
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
  color: #fd5e3a !important;
  border-bottom-color: #fd5e3a;
}

.nav-link {
  position: relative;
  padding-bottom: 8px !important;
}

.btn-link {
  color: #103841;
  text-decoration: none;
}

.btn-link:hover {
  color: #fd5e3a;
}

.btn-client-area {
  background-color: #fd5e3a;
  color: white;
  font-weight: 700;
  font-size: 14px;
  padding: 12.99px 32px 15.01px;
  border-radius: 9999px;
  border: none;
  box-shadow:
    0px 10px 15px -3px rgba(253, 94, 58, 0.2),
    0px 4px 6px -4px rgba(253, 94, 58, 0.2);
  transition: all 0.3s ease;
}

.btn-client-area:hover {
  background-color: #e94f2b;
  transform: translateY(-2px);
  box-shadow: 0 12px 18px -3px rgba(253, 94, 58, 0.3);
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px 14px;
  background-color: #fd5e3a;
  color: white;
  border: none;
  border-radius: 9999px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(253, 94, 58, 0.2);
}

.btn-logout:hover {
  background-color: #e94f2b;
  transform: translateY(-2px);
  box-shadow: 0 12px 18px -3px rgba(253, 94, 58, 0.3);
}

.btn-logout:active {
  transform: translateY(0);
}

.btn-profile {
  background-color: transparent;
  border: none;
  text-decoration: none;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-profile:hover {
  transform: scale(1.1);
}

.navbar-profile-mobile {
  color: #103841;
  text-decoration: none;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout-mobile {
  background-color: transparent;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout-mobile:hover i {
  color: #fd5e3a !important;
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

  .d-flex.gap-3 {
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
