<template>
  <div class="profile-container">
    <Header />
    <main class="profile-content">
      <h1>Profile</h1>
      <p>User profile page</p>
    </main>
    <BackofficeBottomNav />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import BackofficeBottomNav from "@/components/BackofficeBottomNav.vue";

export default {
  name: "Profile",
  components: {
    Header,
    BackofficeBottomNav,
  },
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.profile-content {
  flex: 1;
  padding: 20px;
}
</style>
