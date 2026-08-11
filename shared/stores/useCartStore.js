import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref([]);

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const shippingCost = 8;

  const total = computed(() => {
    return subtotal.value + shippingCost;
  });

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  function addItem(product) {
    const existingItem = items.value.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.value.push({
        id: product.id,
        name: product.title || product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        type: product.type ?? 'product', // 'product' | 'combo'
        product_id: product.product_id ?? '',
        combo_id: product.combo_id ?? '',
      });
    }
  }

  function updateQuantity(itemId, quantity) {
    const item = items.value.find((i) => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  }

  function removeItem(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId);
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    subtotal,
    total,
    itemCount,
    shippingCost,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
});
