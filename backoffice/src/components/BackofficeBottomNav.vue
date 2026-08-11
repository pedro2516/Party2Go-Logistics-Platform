<template>
  <nav class="bottom-nav d-lg-none">
    <router-link
      to="/logistics"
      class="nav-item"
      :class="{ active: $route.path === '/logistics' }"
    >
      <i class="bi bi-house" style="font-size: 1.2rem"></i>
      <span class="nav-label">Início</span>
    </router-link>

    <router-link
      to="/logistics/deliveries"
      class="nav-item"
      :class="{ active: $route.path === '/logistics/deliveries' }"
    >
      <i class="bi bi-truck" style="font-size: 1.2rem"></i>
      <span class="nav-label">Entregas</span>
    </router-link>

    <router-link
      to="/logistics/couriers"
      class="nav-item"
      :class="{ active: $route.path === '/logistics/couriers' }"
    >
      <i class="bi bi-people" style="font-size: 1.2rem"></i>
      <span class="nav-label">Estafetas</span>
    </router-link>

    <router-link
      to="/logistics/map"
      class="nav-item"
      :class="{ active: $route.path === '/logistics/map' }"
    >
      <i class="bi bi-map" style="font-size: 1.2rem"></i>
      <span class="nav-label">Mapa</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.bottom-nav, .mobile-bottom-nav, .business-bottom-nav, footer, .backoffice-bottom-nav {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  width: 100% !important;
}

/* Bottom Navigation Styles */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid #f0f0f0;
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
  color: #666;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'Public Sans', sans-serif;
}

.nav-item:hover {
  color: #fd5e3a;
}

.nav-item.active {
  color: #fd5e3a;
}

.nav-label {
  font-family: 'Public Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}
</style>
