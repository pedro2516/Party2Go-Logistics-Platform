<template>
  <div class="pack-card" @click="navigateToDetails">
    <!-- Image Section -->
    <div class="card-image-container">
      <img :src="product.image" :alt="product.title" class="card-image" />
      <!-- Category Badge -->
      <div class="category-badge">
        {{ product.category }}
      </div>
    </div>

    <!-- Content Section -->
    <div class="card-content">
      <!-- Title -->
      <h3 class="card-title">{{ product.title }}</h3>

      <!-- Price Section -->
      <div class="price-container">
        <span class="price">{{ formatPrice(product.price) }}</span>
        <span class="price-unit">/ evento</span>
      </div>

      <!-- Add Button -->
      <button class="btn-add" @click.stop="handleAdd">
        <i class="bi bi-plus"></i>
        <span class="btn-text">Adicionar ao Kit</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useCartStore } from "@shared/stores/useCartStore";

const router = useRouter();

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();

function formatPrice(price) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function navigateToDetails() {
  router.push({
    name: "PackDetails",
    params: { id: props.product.id },
  });
}

function handleAdd() {
  cartStore.addItem({ ...props.product, type: 'product' });
}
</script>

<style scoped>
.pack-card {
  background-color: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 10px 10px 50px -12px var(--shadow-dark);
  border: 1px solid white;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
}

.pack-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 15px 50px -12px var(--shadow-dark);
}

/* Image Section */
.card-image-container {
  position: relative;
  width: 100%;
  height: 258px;
  overflow: hidden;
  border-radius: 25px 25px 0 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px 25px 0 0;
}

/* Category Badge */
.category-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: white;
  backdrop-filter: blur(2px);
  padding: 4px 12px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 15px;
}

/* Content Section */
.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

/* Title */
.card-title {
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--dark-text);
  line-height: 28px;
  margin: 0;
  padding: 0;
}

/* Price Container */
.price-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 8px 0;
}

.price {
  font-family: "Inter", sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-color);
  line-height: 32px;
}

.price-unit {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary-light);
  text-transform: uppercase;
  letter-spacing: -0.3px;
  line-height: 16px;
}

/* Add Button */
.btn-add {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  margin-top: auto;
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 20px;
  height: 54px;
  min-height: 54px;
}

.btn-icon {
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 20px;
}

.btn-add i {
  font-size: 18px;
  line-height: 1;
}

.btn-add:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.btn-add:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .pack-card {
    border-radius: 16px;
  }

  .card-badge {
    border-radius: 4px;
    font-size: 9px;
    padding: 3px 10px;
  }

  .card-title {
    font-size: 16px;
    line-height: 24px;
  }

  .price {
    font-size: 20px;
    line-height: 28px;
  }
}
</style>
