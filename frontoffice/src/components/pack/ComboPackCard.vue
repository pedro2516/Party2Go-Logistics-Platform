<template>
  <div class="combo-card">
    <div class="combo-card-image-wrap">
      <img :src="pack.image" :alt="pack.title" class="combo-card-image" />
      <span v-if="pack.badge" class="combo-card-badge">{{ pack.badge }}</span>
    </div>

    <div class="combo-card-content">
      <div class="combo-card-header">
        <h3 class="combo-card-title">{{ pack.title }}</h3>
      </div>

      <p class="combo-card-desc">{{ pack.description }}</p>

      <ul class="combo-card-features">
        <li
          v-for="feature in pack.features"
          :key="feature"
          class="combo-card-feature"
        >
          <i class="bi bi-check-circle-fill feature-icon"></i>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <!-- Specs row (weight, dimensions, etc.) -->
      <div v-if="pack.specs && pack.specs.length" class="combo-card-specs">
        <span
          v-for="(spec, index) in pack.specs"
          :key="index"
          class="combo-card-spec"
        >
          <i :class="spec.icon"></i>
          {{ spec.value }}
        </span>
      </div>

      <hr class="combo-card-divider" />

      <div class="combo-card-pricing">
        <div class="combo-card-original-price">
          {{ formatPrice(pack.originalPrice) }}
        </div>
        <div class="combo-card-sale-price">
          {{ formatPrice(pack.salePrice) }}
        </div>
      </div>

      <button class="combo-btn-add" @click.stop="$emit('add-to-kit', pack)">
        <span class="btn-plus">+</span>
        <span>Adicionar ao Kit</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pack: {
    type: Object,
    required: true,
  },
});

defineEmits(["add-to-kit"]);

function formatPrice(price) {
  return (
    new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price) + "€"
  );
}
</script>

<style scoped>
.combo-card {
  background-color: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 10px 10px 50px -12px var(--shadow-dark);
  border: 1px solid white;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.combo-card:hover {
  transform: translateY(-4px);
  box-shadow: 10px 15px 50px -12px var(--shadow-medium);
}

/* Image */
.combo-card-image-wrap {
  position: relative;
  width: 100%;
  height: 258px;
  overflow: hidden;
  border-radius: 25px 25px 0 0;
}

.combo-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 25px 25px 0 0;
}

.combo-card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: var(--primary-color);
  color: white;
  font-family: "Public Sans", sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 9999px;
  line-height: 15px;
}

/* Content */
.combo-card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.combo-card-header {
  padding-bottom: 8px;
}

.combo-card-title {
  font-family: "Public Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--dark-text);
  line-height: 28px;
  margin: 0;
}

.combo-card-desc {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--secondary-light);
  line-height: 22.75px;
  margin: 0;
}

/* Features */
.combo-card-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 24px;
}

.combo-card-feature {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  font-size: 15px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.combo-card-feature span {
  font-family: "Public Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary-light);
  line-height: 16px;
}

/* Specs strip */
.combo-card-specs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.combo-card-spec {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Public Sans", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--secondary-light);
  line-height: 16px;
}

.combo-card-spec i {
  font-size: 13px;
  flex-shrink: 0;
}

/* Divider between specs and pricing */
.combo-card-divider {
  border: none;
  border-top: 1px solid var(--border-lighter);
  margin: 12px 0 0;
}

/* Pricing */
.combo-card-pricing {
  display: flex;
  flex-direction: column;
}

.combo-card-original-price {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-light);
  text-decoration: line-through;
  line-height: 20px;
}

.combo-card-sale-price {
  font-family: "Public Sans", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 32px;
}

/* Button */
.combo-btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  width: 100%;
  margin-top: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.combo-btn-add:hover {
  background-color: var(--primary-dark);
}

.btn-plus {
  font-size: 20px;
  font-weight: 700;
  line-height: 20px;
}

.combo-btn-add span:last-child {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}
</style>
