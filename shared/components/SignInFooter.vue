<template>
  <div class="d-flex align-items-center justify-content-center gap-2 pt-3">
    <span class="text-secondary">Já tem conta?</span>
    <button type="button" class="btn btn-login p-0" @click="emit('navigate')">
      Inicie sessão
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(["navigate"]);
</script>

<style scoped>
.bottom-nav, .mobile-bottom-nav, .business-bottom-nav, footer, .backoffice-bottom-nav {
  position: fixed !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  width: 100% !important;
}

/* Login Link Button */
.btn-login {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.btn-login:hover {
  opacity: 0.8;
}

.text-secondary {
  color: var(--secondary-light) !important;
  font-weight: 400;
}
</style>
