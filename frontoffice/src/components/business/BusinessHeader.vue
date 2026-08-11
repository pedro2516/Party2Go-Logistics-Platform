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
            <span class="business-label">Business</span>
          </div>
        </div>

        <router-link
          to="/business/personal-area"
          class="navbar-profile-mobile d-lg-none border-0"
          aria-label="Área Cliente"
        >
          <i
            class="bi bi-person"
            :style="{ fontSize: '1.8rem', color: $route.path === '/business/personal-area' ? '#fd5e3a' : '#103841' }"
          ></i>
        </router-link>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/business" class="nav-link" active-class="active"
                >INÍCIO</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                to="/request-delivery"
                class="nav-link"
                active-class="active"
                >NOVA ENTREGA</router-link
              >
            </li>
            <li class="nav-item">
              <router-link
                to="/chat"
                class="nav-link"
                active-class="active"
                >CHAT</router-link
              >
            </li>
          </ul>
        </div>

        <div class="navbar-section right-section d-none d-lg-flex align-items-center gap-3">
          <button
            class="btn btn-link p-0"
            aria-label="Carrinho"
            @click="$router.push('/business/carrinho')"
            :style="{ color: $route.path === '/business/carrinho' ? '#fd5e3a' : '#103841' }"
          >
            <i class="bi bi-cart3" style="font-size: 1.5rem"></i>
          </button>
          <router-link to="/business/personal-area" class="btn btn-client-area">Área Cliente</router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const $router = useRouter();
</script>

<style scoped>
header, .home-header, .dm-desktop-header, .dm-mobile-header, .navbar, .cart-header {
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

.business-label {
  color: var(--dark-text);
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
  padding-left: 6px;
  border-left: 1px solid var(--border-light);
}

.nav-link {
  color: var(--dark-text);
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 16px;
  padding: 8px 0 !important;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.nav-link.active,
.nav-link:hover {
  color: var(--primary-color) !important;
  border-bottom-color: var(--primary-color);
}

.btn-client-area {
  background-color: var(--primary-color);
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
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0px 12px 18px -3px rgba(253, 94, 58, 0.3);
}

.btn-link {
  color: var(--dark-text);
  text-decoration: none;
  transition: color 0.2s ease;
}

.btn-link:hover {
  color: var(--primary-color);
}

@media (max-width: 991px) {
  .logo-text {
    font-size: 20px;
  }

  .business-label {
    font-size: 12px;
  }
}
</style>
