<template>
  <header class="home-header">
    <nav class="navbar navbar-light bg-white px-4 py-3 sticky-top">
      <div
        class="container-fluid"
        style="max-width: 1440px; margin: 0 auto; padding: 0"
      >
        <div class="navbar-brand d-flex align-items-center gap-2">
          <div class="logo-icon">
            <img
              src="../assets/logo.svg"
              alt="Logotipo Party2Go"
              class="logo-img"
            />
          </div>
          <div class="logo-text">
            <span class="brand-name">Party</span
            ><span class="brand-accent">2Go</span>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
// Logo/navbar component - presentational only
</script>

<style scoped>
.home-header {
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 9999;
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
  color: #103841;
}

.brand-accent {
  color: #fd5e3a;
}

@media (max-width: 576px) {
  .navbar {
    padding: 12px 16px !important;
  }

  .logo-text {
    font-size: 20px;
  }

  .logo-icon,
  .logo-img {
    width: 36px;
    height: 36px;
  }
}
</style>
