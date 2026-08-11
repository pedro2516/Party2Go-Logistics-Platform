<template>
  <div
    class="card-header-custom d-flex flex-column align-items-center gap-4 p-5"
  >
    <div class="icon-box d-flex align-items-center justify-content-center">
      <img
        src="https://www.figma.com/api/mcp/asset/95752abf-584e-4bb5-83b0-54bccf7ba064"
        alt="Party Icon"
        class="icon-img"
      />
    </div>
    <h1 class="card-title mb-0">Iniciar Sessão</h1>
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

/* Mobile Responsive */
@media (max-width: 576px) {
  .card-header-custom {
    padding: 32px 20px !important;
  }
}
</style>
