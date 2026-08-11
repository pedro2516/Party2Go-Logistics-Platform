<template>
  <MainLayout v-if="route.meta.layout">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<script setup>
import { useRoute } from "vue-router";
import MainLayout from "./components/MainLayout.vue";

const route = useRoute();
</script>
