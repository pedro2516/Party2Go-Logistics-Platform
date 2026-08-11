<template>
  <div class="reset-password-page">
    <SignInLogo />

    <main class="reset-password-main">
      <div class="form-wrapper">
        <div class="form-card">
          <div class="header-section">
            <h2 class="title">Criar Nova Palavra-passe</h2>
            <p class="subtitle">Introduz a tua nova palavra-passe abaixo.</p>
          </div>

          <div class="form-content">
            <form @submit.prevent="handleSubmit" class="reset-password-form">
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success" role="alert">
                {{ successMessage }}
                <div class="mt-2">
                  <router-link :to="{ name: 'Login' }" class="fw-bold">Ir para o Login</router-link>
                </div>
              </div>

              <div class="mb-4" v-if="!successMessage">
                <label for="password" class="form-label fw-bold form-label-custom mb-3">Nova Palavra-passe</label>
                <div class="position-relative">
                  <div class="input-icon-custom">
                    <i class="bi bi-lock"></i>
                  </div>
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    class="form-control form-input-custom form-input-with-icon"
                    placeholder="No mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div class="mb-4" v-if="!successMessage">
                <label for="confirmPassword" class="form-label fw-bold form-label-custom mb-3">Confirmar Palavra-passe</label>
                <div class="position-relative">
                  <div class="input-icon-custom">
                    <i class="bi bi-lock-fill"></i>
                  </div>
                  <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    type="password"
                    class="form-control form-input-custom form-input-with-icon"
                    placeholder="Repete a palavra-passe"
                    required
                  />
                </div>
              </div>

              <button
                v-if="!successMessage"
                type="submit"
                class="btn btn-submit d-flex align-items-center justify-content-center gap-3 w-100 mt-4 mb-3"
                :disabled="isLoading || !password || !confirmPassword"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span v-else>Atualizar Palavra-passe</span>
                <i v-if="!isLoading" class="bi bi-check-circle"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SignInLogo from "@shared/components/SignInLogo.vue";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const token = ref("");

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token;
  } else {
    errorMessage.value = "Link inválido ou ausente. Por favor, solicita um novo link de recuperação.";
  }
});

const handleSubmit = async () => {
  if (!token.value) {
    errorMessage.value = "Token inválido.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "As palavras-passe não coincidem.";
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = "A palavra-passe deve ter pelo menos 6 caracteres.";
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await fetch("http://localhost:1337/api/auth-custom/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        token: token.value,
        newPassword: password.value
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Erro ao atualizar a palavra-passe.");
    }

    successMessage.value = "A tua palavra-passe foi atualizada com sucesso!";
    password.value = "";
    confirmPassword.value = "";
    
    // Redirect after 3 seconds
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
    
  } catch (error) {
    console.error("Erro no reset-password:", error);
    errorMessage.value = error.message || "Ocorreu um erro ao processar o teu pedido.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Same styles as ForgotPassword.vue to maintain visual consistency */
.reset-password-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.reset-password-main {
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
</style>
