<template>
  <div class="autocomplete-container" ref="containerRef">
    <div class="input-wrapper">
      <i class="bi bi-geo-alt input-icon"></i>
      <input
        ref="inputRef"
        type="text"
        class="form-input"
        :class="{ 'is-invalid': !isValid && hasInteracted, 'is-valid': isValid }"
        :placeholder="placeholder"
        :value="displayValue"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        :disabled="disabled"
      />
      <!-- Validation Icon -->
      <i v-if="isValid" class="bi bi-check-circle-fill validation-icon success"></i>
      <i v-else-if="hasInteracted && !isValid" class="bi bi-x-circle-fill validation-icon error"></i>
      
      <!-- Loading spinner -->
      <div v-if="isLoading" class="loading-spinner"></div>
    </div>

    <!-- Dropdown results -->
    <ul v-if="showDropdown && results.length > 0" class="dropdown-list">
      <li
        v-for="result in results"
        :key="result.id"
        class="dropdown-item"
        @mousedown.prevent="selectResult(result)"
      >
        <div class="item-title">{{ result.place_name_pt || result.place_name }}</div>
      </li>
    </ul>
    
    <div v-if="showDropdown && results.length === 0 && query.length >= 3 && !isLoading" class="dropdown-list no-results">
      <span class="text-muted">Nenhuma morada encontrada.</span>
    </div>

    <!-- Error message for strict validation -->
    <div v-if="hasInteracted && !isValid" class="error-message">
      Tem de selecionar uma morada válida na lista.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  street: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  placeholder: { type: String, default: 'Comece a escrever a rua...' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:street', 'update:postalCode', 'validation-change', 'coordinates']);

// State
const query = ref(props.street);
const displayValue = ref(props.street);
const results = ref([]);
const isLoading = ref(false);
const showDropdown = ref(false);
const isValid = ref(false);
const hasInteracted = ref(false);
const containerRef = ref(null);

// Debounce timer
let debounceTimer = null;

// The Mapbox token should ideally come from env variables.
// If not found, it will warn the user.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Sync initial props
watch(() => props.street, (newVal) => {
  if (newVal !== displayValue.value && !showDropdown.value) {
    displayValue.value = newVal;
    query.value = newVal;
    // If it's pre-filled from backend, we assume it's valid initially until touched
    if (newVal) {
      isValid.value = true;
      emit('validation-change', true);
    }
  }
});

const onInput = (event) => {
  hasInteracted.value = true;
  const value = event.target.value;
  displayValue.value = value;
  query.value = value;
  
  // As soon as the user types, the previous valid selection is invalidated
  isValid.value = false;
  emit('validation-change', false);
  emit('update:street', value);

  if (value.length < 3) {
    results.value = [];
    showDropdown.value = false;
    return;
  }

  // Debounce API call
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchResults(value);
  }, 300);
};

const fetchResults = async (searchQuery) => {
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox Token is missing. Please set VITE_MAPBOX_TOKEN in your .env file.');
    return;
  }

  isLoading.value = true;
  try {
    // Restringir ao Portugal Continental (bbox exclui Açores e Madeira)
    // bbox: [lng_min, lat_min, lng_max, lat_max]
    const PT_CONTINENTAL_BBOX = '-9.5,36.9,-6.2,42.2';
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&bbox=${PT_CONTINENTAL_BBOX}&country=pt&types=address,place,locality&language=pt&limit=5`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.features) {
      results.value = data.features;
      showDropdown.value = true;
    }
  } catch (error) {
    console.error('Error fetching Mapbox data:', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

const selectResult = (result) => {
  // Extract street name
  let streetName = result.text_pt || result.text;
  let fullAddress = result.place_name_pt || result.place_name;
  
  // Try to find postal code from context
  let foundPostalCode = '';
  if (result.context) {
    const postcodeContext = result.context.find(c => c.id.startsWith('postcode'));
    if (postcodeContext) {
      foundPostalCode = postcodeContext.text_pt || postcodeContext.text;
    }
  }

  // Set values
  displayValue.value = fullAddress; // Show full address to user
  query.value = fullAddress;
  
  isValid.value = true;
  showDropdown.value = false;
  hasInteracted.value = true;

  // Emit to parent
  emit('update:street', fullAddress);
  emit('update:postalCode', foundPostalCode);
  emit('validation-change', true);

  // Emit coordinates [lng, lat] from Mapbox result
  if (result.center && result.center.length === 2) {
    emit('coordinates', { lng: result.center[0], lat: result.center[1] });
  }
};

const onFocus = () => {
  if (query.value.length >= 3 && results.value.length > 0) {
    showDropdown.value = true;
  }
};

const onBlur = () => {
  // Use timeout to allow click on dropdown item to register before hiding
  setTimeout(() => {
    showDropdown.value = false;
    
    // If they blur without a valid selection, explicitly clear the postal code
    // to enforce they have to pick a real address.
    if (!isValid.value && hasInteracted.value) {
      emit('update:postalCode', '');
    }
  }, 200);
};

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.autocomplete-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #103841;
  pointer-events: none;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 36px 12px 42px; /* left room for icon, right for validation */
  border: 1.5px solid var(--border-lighter);
  border-radius: 12px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: var(--dark-text);
  transition: all 0.3s ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.1);
}

.form-input.is-valid {
  border-color: #198754;
}

.form-input.is-invalid {
  border-color: #dc3545;
  background-color: #fff8f8;
}

.form-input:disabled {
  background-color: var(--bg-lightest);
  color: var(--secondary-light);
  cursor: not-allowed;
}

.validation-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  z-index: 1;
}

.validation-icon.success {
  color: #198754;
}

.validation-icon.error {
  color: #dc3545;
}

.loading-spinner {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--border-lighter);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px 0;
  margin: 0;
  list-style: none;
}

.dropdown-list.no-results {
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--bg-lightest);
}

.item-title {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  color: var(--dark-text);
  line-height: 1.4;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 6px;
  font-family: "Public Sans", sans-serif;
}
</style>
