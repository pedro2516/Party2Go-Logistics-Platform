<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <!-- Email Field -->
    <div class="mb-4">
      <label for="email" class="form-label fw-bold form-label-custom mb-3"
        >Email</label
      >
      <div class="position-relative">
        <div class="input-icon-custom">
          <i class="bi bi-envelope"></i>
        </div>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control form-input-custom form-input-with-icon"
          placeholder="seu@email.com"
          required
        />
      </div>
    </div>

    <!-- Password Field -->
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <label for="password" class="form-label fw-bold form-label-custom mb-0"
          >Palavra-passe</label
        >
        <router-link :to="{ name: 'ForgotPassword' }" class="forgot-password-link">Esqueceste-te?</router-link>
      </div>
      <div class="position-relative">
        <div class="input-icon-custom">
          <i class="bi bi-lock"></i>
        </div>
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control form-input-custom form-input-with-icon"
          placeholder="A tua palavra-passe"
        />
        <button 
          type="button" 
          class="btn-eye" 
          @click="showPassword = !showPassword"
          aria-label="Alternar visibilidade da palavra-passe"
        >
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
      </div>
    </div>


    <!-- Login Button -->
    <button
      type="button"
      class="btn btn-submit d-flex align-items-center justify-content-center gap-3 w-100 mt-4 mb-3"
      @click="handlePasswordLogin"
      :disabled="isLoading || !form.email || !form.password"
    >
      <span v-if="isLoading && loginType === 'password'" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span v-else>Entrar</span>
      <i v-if="!(isLoading && loginType === 'password')" class="bi bi-arrow-right"></i>
    </button>

    <!-- Magic Link Button -->
    <button
      type="button"
      class="btn btn-outline-primary w-100 mb-3"
      @click="handleMagicLink"
      :disabled="isLoading || !form.email"
    >
      <span v-if="isLoading && loginType === 'magic'" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span v-else>Receber Link de Login Mágico</span>
    </button>

    <!-- Divider -->
    <div class="d-flex align-items-center my-3">
      <hr class="flex-grow-1" />
      <span class="mx-3 text-secondary">ou</span>
      <hr class="flex-grow-1" />
    </div>

    <!-- Google Login Button -->
    <button
      type="button"
      class="btn btn-google d-flex align-items-center justify-content-center gap-2 w-100 mb-4"
      @click="handleGoogleLogin"
      :disabled="isLoading"
    >
      <i class="bi bi-google"></i>
      <span>Continuar com Google</span>
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";

const form = ref({
  email: "",
  password: "",
});

const showPassword = ref(false);
const loginType = ref("");

const emit = defineEmits(["submit-password", "submit-magic", "google-login"]);

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

const handlePasswordLogin = async () => {
  if (!form.value.email || !form.value.password) return;
  loginType.value = "password";
  emit("submit-password", { ...form.value });
};

const handleMagicLink = async () => {
  if (!form.value.email) return;
  loginType.value = "magic";
  emit("submit-magic", { email: form.value.email });
};

const handleGoogleLogin = () => {
  emit("google-login");
};
</script>

<style scoped>
.login-form {
  width: 100%;
}

.mb-4 {
  margin-bottom: 20px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-0 {
  margin-bottom: 0;
}

.mt-5 {
  margin-top: 24px;
}

.mb-4 {
  margin-bottom: 24px;
}

.form-label-custom {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--dark-text);
  display: block;
}

.fw-bold {
  font-weight: 700;
}

.form-input-custom {
  width: 100%;
  height: 48px;
  border: 1px solid var(--border-lighter);
  border-radius: 16px;
  font-size: 14px;
  font-family: "Public Sans", sans-serif;
  color: var(--dark-text);
  padding: 12px 15px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: white;
}

.form-input-custom:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(253, 94, 58, 0.1);
}

.form-input-custom::placeholder {
  color: var(--secondary-light);
}

/* Remove o fundo "azul bebé" do preenchimento automático do Chrome */
.form-input-custom:-webkit-autofill,
.form-input-custom:-webkit-autofill:hover, 
.form-input-custom:-webkit-autofill:focus, 
.form-input-custom:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: var(--dark-text) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.form-input-with-icon {
  padding-left: 45px;
}

.position-relative {
  position: relative;
}

.input-icon-custom {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-light);
  pointer-events: none;
}

.input-icon-custom i {
  font-size: 18px;
  color: var(--secondary-light);
  transition: color 0.3s ease;
}

.btn-eye {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--secondary-light);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-eye:focus {
  outline: none;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.forgot-password-link {
  font-family: "Public Sans", sans-serif;
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  white-space: nowrap;
  margin-left: 8px;
}

.forgot-password-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: none;
  border-radius: 9999px;
  font-family: "Public Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(253, 94, 58, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(253, 94, 58, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-outline-primary {
  width: 100%;
  height: 56px;
  background: white;
  border: 2px solid #103841 !important;
  border-radius: 9999px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #103841 !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #103841 !important;
  color: white !important;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.gap-3 {
  gap: 12px;
}

.w-100 {
  width: 100%;
}

/* ===== Mobile Responsive (390px - 767px - iPhone 16) ===== */
@media (max-width: 767px) {
  .mb-4 {
    margin-bottom: 18px;
  }

  .mb-3 {
    margin-bottom: 10px;
  }

  .mt-5 {
    margin-top: 20px;
  }

  .form-label-custom {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .form-input-custom {
    height: 44px;
    font-size: 13px;
    border-radius: 12px;
    padding: 10px 12px;
  }

  .form-input-with-icon {
    padding-left: 40px;
  }

  .input-icon-custom {
    left: 12px;
  }

  .input-icon-custom i {
    font-size: 16px;
  }

  .forgot-password-link {
    font-size: 12px;
    margin-left: 6px;
  }

  .btn-submit {
    height: 48px;
    font-size: 15px;
    gap: 10px;
    margin-bottom: 12px;
  }

  .btn-submit i {
    font-size: 16px;
  }
}

/* ===== Extra Small (320px - 389px) ===== */
@media (max-width: 389px) {
  .mb-4 {
    margin-bottom: 16px;
  }

  .mb-3 {
    margin-bottom: 9px;
  }

  .form-label-custom {
    font-size: 12px;
  }

  .form-input-custom {
    height: 40px;
    font-size: 12px;
    border-radius: 10px;
    padding: 9px 10px;
  }

  .form-input-with-icon {
    padding-left: 36px;
  }

  .input-icon-custom i {
    font-size: 14px;
  }

  .forgot-password-link {
    font-size: 11px;
  }

  .btn-submit {
    height: 44px;
    font-size: 14px;
  }
}

.btn-submit i {
  font-size: 20px;
}

/* Mobile Responsive - iPhone 16 & smaller */
@media (max-width: 576px) {
  .form-label-custom {
    font-size: 13px;
  }

  .form-input-custom {
    font-size: 13px;
    height: 44px;
  }

  .forgot-password-link {
    font-size: 12px;
  }

  .btn-submit {
    height: 52px;
    font-size: 15px;
  }
}

/* Extra small devices - iPhone SE */
@media (max-width: 380px) {
  .login-form {
    width: 100%;
  }

  .form-label-custom {
    font-size: 12px;
  }

  .form-input-custom {
    font-size: 12px;
    height: 42px;
    padding-left: 36px;
  }

  .input-icon-custom {
    left: 10px;
    width: 18px;
    height: 18px;
    font-size: 14px;
  }

  .forgot-password-link {
    font-size: 11px;
  }

  .btn-submit {
    height: 48px;
    font-size: 14px;
    gap: 0.5rem !important;
  }

  .btn-submit i {
    font-size: 12px;
  }

  .mb-4 {
    margin-bottom: 0.75rem !important;
  }

  .mt-5 {
    margin-top: 1.5rem !important;
  }

  .mb-3 {
    margin-bottom: 0.75rem !important;
  }
}

.btn-google {
  height: 56px;
  background-color: white;
  border: 1px solid var(--border-lighter, #e0e0e0);
  border-radius: 9999px;
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-text, #103841);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-google:hover {
  background-color: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.text-secondary {
  color: #6c757d;
  font-size: 14px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>
