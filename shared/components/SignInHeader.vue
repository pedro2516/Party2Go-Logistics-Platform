<template>
  <div
    class="card-header-custom d-flex flex-column align-items-center gap-4 p-5"
  >
    <div class="icon-box d-flex align-items-center justify-content-center">
      <img src="logo2.svg" alt="Party Icon" class="icon-img" />
    </div>
    <h1 class="card-title mb-0">Criar Conta</h1>
    <p class="card-subtitle mb-0">Junte-se à maior rede de alegria infantil.</p>
  </div>
</template>

<script setup>
// Header component - presentational only
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

.card-header-custom {
  background-color: var(--primary-color);
  color: white;
}

.icon-box {
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
}

.icon-img {
  width: 32px;
  height: 32px;
}

.card-title {
  font-family: "Public Sans", sans-serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.75px;
  line-height: 36px;
}

.card-subtitle {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}
</style>
