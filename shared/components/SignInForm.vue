<template>
  <form @submit.prevent="handleSubmit" class="sign-in-form">
    <!-- Client Type Radio Buttons -->
    <div class="mb-4 d-flex gap-4">
      <div class="form-check">
        <input class="form-check-input custom-radio" type="radio" name="clientType" id="personal" value="personal" v-model="form.type">
        <label class="form-check-label fw-bold form-label-custom" for="personal">Pessoal</label>
      </div>
      <div class="form-check">
        <input class="form-check-input custom-radio" type="radio" name="clientType" id="enterprise" value="enterprise" v-model="form.type">
        <label class="form-check-label fw-bold form-label-custom" for="enterprise">Empresa</label>
      </div>
    </div>

    <!-- Company Name (Enterprise only) -->
    <div class="mb-4" v-if="form.type === 'enterprise'">
      <label for="company_name" class="form-label fw-bold form-label-custom mb-3">Nome da Empresa <span class="text-danger">*</span></label>
      <input id="company_name" v-model="form.company_name" type="text" class="form-control form-input-custom" placeholder="Sua Empresa Lda." required />
    </div>

    <!-- First Name & Last Name in a row -->
    <div class="row mb-4">
      <div class="col-6">
        <label for="first_name" class="form-label fw-bold form-label-custom mb-3">Nome <span class="text-danger">*</span></label>
        <input id="first_name" v-model="form.first_name" type="text" class="form-control form-input-custom" placeholder="Maria" required />
      </div>
      <div class="col-6">
        <label for="last_name" class="form-label fw-bold form-label-custom mb-3">Apelido <span class="text-danger">*</span></label>
        <input id="last_name" v-model="form.last_name" type="text" class="form-control form-input-custom" placeholder="Silva" required />
      </div>
    </div>

    <!-- Phone Number -->
    <div class="mb-4">
      <label for="phone_number" class="form-label fw-bold form-label-custom mb-3">Telemóvel</label>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i class="bi bi-telephone"></i>
        </div>
        <input id="phone_number" v-model="form.phone_number" type="tel" class="form-control form-input-custom form-input-with-icon" placeholder="912 345 678" />
      </div>
    </div>

    <!-- Email Field -->
    <div class="mb-4">
      <label for="email" class="form-label fw-bold form-label-custom mb-3">Email <span class="text-danger">*</span></label>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i class="bi bi-envelope"></i>
        </div>
        <input id="email" v-model="form.email" type="email" class="form-control form-input-custom form-input-with-icon" placeholder="seu@email.com" required />
      </div>
    </div>

    <!-- Password Field -->
    <div class="mb-4">
      <label for="password" class="form-label fw-bold form-label-custom mb-3">Palavra-passe <span class="text-danger">*</span></label>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'" @click="togglePassword" style="cursor: pointer"></i>
        </div>
        <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control form-input-custom form-input-with-icon" placeholder="••••••••" required />
      </div>
    </div>

    <!-- Password Confirmation Field -->
    <div class="mb-4">
      <label for="password_confirmation" class="form-label fw-bold form-label-custom mb-3">Confirmar Palavra-passe <span class="text-danger">*</span></label>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i :class="showPasswordConfirm ? 'bi bi-eye' : 'bi bi-eye-slash'" @click="togglePasswordConfirm" style="cursor: pointer"></i>
        </div>
        <input id="password_confirmation" v-model="form.password_confirmation" :type="showPasswordConfirm ? 'text' : 'password'" class="form-control form-input-custom form-input-with-icon" placeholder="••••••••" required />
      </div>
    </div>

    <!-- NIF Field -->
    <div class="mb-4">
      <label for="nif" class="form-label fw-bold form-label-custom mb-3">NIF <span v-if="form.type === 'enterprise'" class="text-danger">*</span></label>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i class="bi bi-card-text"></i>
        </div>
        <input id="nif" v-model="form.nif" type="text" class="form-control form-input-custom form-input-with-icon" placeholder="9 dígitos" maxlength="9" :required="form.type === 'enterprise'" />
      </div>
    </div>

    <!-- Validation Error -->
    <div v-if="localError || errorMessage" class="alert alert-danger" role="alert" style="margin-bottom: 15px;">
      {{ localError || errorMessage }}
    </div>

    <small class="text-muted d-block mb-3"><span class="text-danger">*</span> Campos de preenchimento obrigatório</small>

    <!-- Submit Button -->
    <button type="submit" class="btn btn-submit d-flex align-items-center justify-content-center gap-3 w-100 mt-2" :disabled="isLoading">
      <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span v-else>Registar</span>
      <i v-if="!isLoading" class="bi bi-arrow-right"></i>
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";

const form = ref({
  type: "personal",
  company_name: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
  password: "",
  password_confirmation: "",
  nif: "",
});

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const localError = ref("");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const togglePasswordConfirm = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value;
};

const emit = defineEmits(["submit"]);

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const handleSubmit = async () => {
  localError.value = "";
  if (form.value.password !== form.value.password_confirmation) {
    localError.value = "As palavras-passe não coincidem.";
    return;
  }
  
  if (form.value.type === 'enterprise' && !form.value.nif) {
    localError.value = "O NIF é obrigatório para empresas.";
    return;
  }

  try {
    emit("submit", { ...form.value });
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
</script>

<style scoped>
/* Icon styles */
.input-icon-custom i {
  font-size: 18px;
  color: var(--secondary-light);
}

.btn-submit i {
  font-size: 20px;
}

.form-label-custom {
  font-size: 14px;
  color: var(--dark-text);
}

.form-input-custom {
  height: 48px;
  border: 1px solid var(--border-lighter);
  border-radius: 16px !important;
  font-size: 14px;
  color: var(--dark-text);
  padding: 12px;
}

.form-input-with-icon {
  padding-left: 45px;
}

.input-icon-custom {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
}

.btn-submit {
  background-color: var(--primary-color);
  border: none;
  border-radius: 9999px;
  height: 56px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.custom-radio:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.custom-radio:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--primary-color-rgb, 255, 122, 0), 0.25);
}
</style>
