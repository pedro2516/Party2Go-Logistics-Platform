<template>
  <div class="main-layout">
    <Header />
    <div class="main-layout-body">
      <router-view />
    </div>
    <MobileBottomNav />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import MobileBottomNav from '@/components/MobileBottomNav.vue';
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  align-self: flex-start;
  margin-top: 0;
  position: relative;
}

.main-layout-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 0;
}


</style>
