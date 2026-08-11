<template>
  <div class="forgot-password-page">
    <SignInLogo />

    <main class="forgot-password-main">
      <div class="form-wrapper">
        <div class="form-card">
          <div class="header-section">
            <h2 class="title">Recuperar Palavra-passe</h2>
            <p class="subtitle">Introduz o teu email para receberes um link de recuperação.</p>
          </div>

          <div class="form-content">
            <form @submit.prevent="handleSubmit" class="forgot-password-form">
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success" role="alert">
                {{ successMessage }}
              </div>

              <div class="mb-4">
                <label for="email" class="form-label fw-bold form-label-custom mb-3">Email</label>
                <div class="position-relative">
                  <div class="input-icon-custom">
                    <i class="bi bi-envelope"></i>
                  </div>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    class="form-control form-input-custom form-input-with-icon"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-submit d-flex align-items-center justify-content-center gap-3 w-100 mt-4 mb-3"
                :disabled="isLoading || !email"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Enviar Link</span>
                <i v-if="!isLoading" class="bi bi-arrow-right"></i>
              </button>

              <div class="text-center mt-3">
                <router-link :to="{ name: 'Login' }" class="back-to-login-link">
                  <i class="bi bi-arrow-left me-2"></i> Voltar ao Login
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SignInLogo from "@shared/components/SignInLogo.vue";

const email = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleSubmit = async () => {
  if (!email.value) return;
  
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await fetch("http://localhost:1337/api/auth-custom/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value }),
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar o pedido de recuperação.");
    }

    successMessage.value = "Se o email estiver registado, irás receber um link de recuperação.";
    email.value = "";
  } catch (error) {
    console.error("Erro no forgot-password:", error);
    errorMessage.value = error.message || "Ocorreu um erro ao processar o teu pedido.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.forgot-password-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px 20px;
}

.form-wrapper {
  width: 100%;
  max-width: 500px;
}

.form-card {
  background-color: white;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.header-section {
  padding: 40px 32px 0;
  text-align: center;
}

.title {
  font-family: "Outfit", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-text);
  margin-bottom: 8px;
}

.subtitle {
  font-family: "Public Sans", sans-serif;
  font-size: 15px;
  color: var(--secondary-light);
  margin-bottom: 0;
}

.form-content {
  padding: 32px;
}

.form-label-custom {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--dark-text);
  display: block;
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

.input-icon-custom {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-light);
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
}

.back-to-login-link {
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-text);
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-to-login-link:hover {
  color: var(--primary-color);
}
</style>
