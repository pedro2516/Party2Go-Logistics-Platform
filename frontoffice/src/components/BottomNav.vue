<template>
  <nav class="bottom-nav d-lg-none">
    <router-link
      to="/home"
      class="nav-item"
      :class="{ active: $route.path === '/home' }"
    >
      <i class="bi bi-house" style="font-size: 1.2rem"></i>
      <span class="nav-label">Início</span>
    </router-link>

    <router-link
      to="/criar-pack"
      class="nav-item"
      :class="{ active: $route.path === '/criar-pack' }"
    >
      <i class="bi bi-box-seam" style="font-size: 1.2rem"></i>
      <span class="nav-label">Criar Pack</span>
    </router-link>

    <router-link
      to="/combos"
      class="nav-item"
      :class="{ active: $route.path === '/combos' }"
    >
      <i class="bi bi-stars" style="font-size: 1.2rem"></i>
      <span class="nav-label">Combos</span>
    </router-link>

    <router-link
      to="/cart"
      class="nav-item"
      :class="{ active: $route.path === '/cart' }"
    >
      <i class="bi bi-cart3" style="font-size: 1.2rem"></i>
      <span class="nav-label">Carrinho</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<style scoped>
.bottom-nav, .mobile-bottom-nav, .business-bottom-nav, footer, .backoffice-bottom-nav {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  width: 100% !important;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid var(--border-lighter);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-medium);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}
</style>
