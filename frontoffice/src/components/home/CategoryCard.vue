<template>
  <div class="category-card">
    <div class="card-content">
      <!-- Icon/Background -->
      <div class="icon-wrapper" :style="{ backgroundColor: iconBgColor }">
        <div v-if="showIcon" class="icon">
          <img
            v-if="iconSrc"
            :src="iconSrc"
            :alt="title"
            class="icon-image"
            :style="{ width: iconSize, height: iconSize }"
          />
          <slot v-else name="icon"></slot>
        </div>
      </div>

      <!-- Title -->
      <h3 class="category-title">{{ title }}</h3>

      <!-- Description -->
      <p class="category-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconBgColor: {
    type: String,
    default: "var(--primary-color)",
  },
  iconSrc: {
    type: String,
    default: null,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  iconSize: {
    type: String,
    default: "36px",
  },
});
</script>

<style scoped>
.category-card {
  background: white;
  border-radius: 40px;
  padding: 32px;
  text-align: center;
  box-shadow: 0px 10px 40px -10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0px 20px 50px -10px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  flex-shrink: 0;
}

.icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.icon :deep(i) {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.icon-image {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.category-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: var(--dark-text);
  margin: 0;
  line-height: 28px;
}

.category-description {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: var(--secondary-light);
  line-height: 22.75px;
  margin: 0;
  text-align: center;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .category-card {
    padding: 26px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .icon {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }

  .icon :deep(i) {
    font-size: 18px;
  }

  .icon-image {
    width: 28px;
    height: 28px;
  }

  .category-title {
    font-size: 16px;
    line-height: 24px;
  }

  .category-description {
    font-size: 13px;
  }
}
</style>
