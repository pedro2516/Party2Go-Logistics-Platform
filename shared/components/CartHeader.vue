<template>
  <header class="cart-header">
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
              src="../assets/logo.svg"
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
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i class="bi bi-person" style="font-size: 1.8rem; color: var(--dark-text)"></i>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <router-link 
                :class="['nav-link', { active: $route.path === '/' }]" 
                to="/">INÍCIO</router-link>
            </li>
            <li class="nav-item">
              <router-link 
                :class="['nav-link', { active: $route.path === '/criar-pack' }]" 
                to="/criar-pack">CRIAR PACK</router-link>
            </li>
            <li class="nav-item">
              <router-link
                :class="['nav-link', { active: $route.path === '/combos' }]"
                to="/combos">COMBOS</router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-link p-0" aria-label="Carrinho" @click="$router.push('/cart')">
              <i class="bi bi-cart3" :class="{ 'cart-active': $route.path === '/cart' }" style="font-size: 1.5rem"></i>
            </button>
            <button class="btn btn-client-area">Área Cliente</button>
          </div>
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

.cart-header {
  background-color: white;
  border-bottom: 1px solid var(--border-lighter);
}

.navbar {
  padding: 16px 24px !important;
}

.navbar-brand {
  gap: 8px;
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
  color: var(--primary-color) !important;
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

/* Mobile responsive */
@media (max-width: 991px) {
  .navbar-collapse {
    margin-top: 16px;
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

/* ===== Mobile Responsive (390px - 767px - iPhone 16) ===== */
@media (max-width: 767px) {
  .cart-header {
    padding: 10px 0;
  }

  .header-content {
    gap: 12px;
    padding: 0 12px;
  }

  .logo-section {
    gap: 6px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    font-size: 18px;
    border-radius: 6px;
  }

  .logo-text {
    font-size: 20px;
    line-height: 28px;
  }

  .nav-menu {
    display: none;
  }

  .btn-login {
    display: none;
  }

  .header-right {
    gap: 8px;
  }

  .btn-user {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

/* ===== Extra Small (320px - 389px) ===== */
@media (max-width: 389px) {
  .cart-header {
    padding: 8px 0;
  }

  .header-content {
    padding: 0 10px;
  }

  .logo-text {
    font-size: 18px;
  }

  .btn-user {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>
