<template>
  <div class="login-page">
    <!-- Logo Section -->
    <SignInLogo />

    <!-- Form Container -->
    <main class="login-main">
      <div class="form-wrapper">
        <div class="form-card">
          <LoginHeader />

          <div class="form-content">
            <LoginForm 
              :is-loading="isLoading"
              :error-message="errorMessage"
              @submit-password="handlePasswordLogin" 
              @submit-magic="handleMagicLink" 
              @google-login="handleGoogleLogin" 
            />
            <div v-if="successMessage" class="alert alert-success mt-3 text-center" role="alert">
              {{ successMessage }}
            </div>
            <LoginFooter v-if="!hideFooter" @navigate="navigateToSignIn" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import SignInLogo from "@shared/components/SignInLogo.vue";
import LoginHeader from "@shared/components/LoginHeader.vue";
import LoginForm from "@shared/components/LoginForm.vue";
import LoginFooter from "@shared/components/LoginFooter.vue";
import { useAuthStore } from "@backend/auth/authStore";
import { auth, googleProvider, db } from "@backend/firebase";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getRedirectPath, syncClientToStrapi, syncCourierToStrapi } from "@backend/auth/authService";

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
  hideFooter: {
    type: Boolean,
    default: false
  },
  appTitle: {
    type: String,
    default: ""
  }
});

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// 1. Função Auxiliar: Verificar Perfil e Redirecionar
const checkRoleAndRedirect = async (user) => {
  try {
    const redirectPath = await getRedirectPath(user);

    // If this is a driver login, upsert the courier in Strapi
    if (redirectPath.includes('/dashboard') || redirectPath.includes('5173')) {
      await syncCourierToStrapi(user);
    } else {
      // Client / business flows
      await syncClientToStrapi(user);
    }

    console.log("🚀 [Gateway] Sucesso! A redirecionar o utilizador para:", redirectPath);
    window.location.href = redirectPath;
  } catch (error) {
    console.error("❌ Erro ao verificar perfil:", error);
    errorMessage.value = "Erro ao carregar o teu perfil.";
    isLoading.value = false;
  }
};

// 2. Lógica para quando a página carrega (Verificar se veio do Email)
onMounted(async () => {
  if (props.appTitle) {
    document.title = props.appTitle;
  }
  if (!auth) return;
  
  // Recuperar o URL original caso o Vue Router já o tenha limpo
  const originalUrl = window.sessionStorage.getItem('originalFirebaseUrl') || window.location.href;
  
  console.log("🔍 [Auth] A verificar URL de entrada:", originalUrl);

  if (isSignInWithEmailLink(auth, originalUrl)) {
    console.log("✅ [Auth] É um Email Link válido! A processar login...");
    isLoading.value = true;
    let email = window.localStorage.getItem('emailForSignIn');
    
    if (!email) {
      console.warn("⚠️ [Auth] Email não encontrado em cache. A pedir ao utilizador...");
      email = window.prompt('Por favor, introduz o teu email para confirmar:');
    }
    
    try {
      const result = await signInWithEmailLink(auth, email, originalUrl);
      console.log("🎉 [Auth] Autenticado com sucesso:", result.user.email);
      window.localStorage.removeItem('emailForSignIn');
      window.sessionStorage.removeItem('originalFirebaseUrl');
      
      // Sucesso no Magic Link! Vamos verificar o Role
      await checkRoleAndRedirect(result.user);
      
    } catch (error) {
      console.error("❌ [Auth] Erro ao fazer login com o link:", error);
      errorMessage.value = "O link é inválido ou expirou. Tenta novamente.";
      isLoading.value = false;
    }
  } else {
    console.log("ℹ️ [Auth] Não é um Email Link, mostrando formulário normal.");
  }
});

// 3. Login com Palavra-passe
const handlePasswordLogin = async (formData) => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (!auth) throw new Error("Firebase não configurado.");

    const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    console.log("🎉 [Auth] Autenticado com sucesso:", result.user.email);
    
    // Sucesso com Password! Vamos verificar o Role
    await checkRoleAndRedirect(result.user);
  } catch (error) {
    console.error("Erro no login com password:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMessage.value = "Email ou palavra-passe incorretos.";
    } else {
      errorMessage.value = "Ocorreu um erro ao iniciar sessão.";
    }
  } finally {
    isLoading.value = false;
  }
};

// 4. Enviar o Link Mágico
const handleMagicLink = async (formData) => {
  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  
  try {
    if (!auth) throw new Error("Firebase não configurado.");
    
    const actionCodeSettings = {
      // O URL para onde o utilizador volta depois de clicar no link do email
      url: window.location.href,
      handleCodeInApp: true,
    };
    
    await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
    
    window.localStorage.setItem('emailForSignIn', formData.email);
    successMessage.value = "Enviámos um link mágico para o teu email! Clica nele para entrar.";
    
  } catch (error) {
    console.error("Erro ao enviar link:", error);
    errorMessage.value = error.message || "Ocorreu um erro ao enviar o email.";
  } finally {
    isLoading.value = false;
  }
};

// 4. Login com Google
const handleGoogleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    if (!auth || !googleProvider) throw new Error("Firebase não configurado.");
    
    const result = await signInWithPopup(auth, googleProvider);
    // Sucesso no Google! Vamos verificar o Role
    await checkRoleAndRedirect(result.user);
    
  } catch (error) {
    console.error("Erro no login com Google:", error);
    errorMessage.value = "Falha ao autenticar com o Google.";
    isLoading.value = false;
  }
};

const navigateToSignIn = () => {
  router.push({ name: "SignIn" });
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}


.login-main {
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
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.form-content {
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Error banner */
.login-error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #fff1f2;
  border: 1px solid #fecdd3;
  color: #dc2626;
  border-radius: 12px;
  padding: 12px 16px;
  font-family: "Public Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== Tablet Responsive (768px - 1023px) ===== */
@media (max-width: 1023px) {
  .logo-section {
    padding: 32px 20px 16px;
  }

  .form-card {
    border-radius: 32px;
  }

  .form-content {
    padding: 32px 28px;
    gap: 20px;
  }
}

/* ===== Mobile Responsive (390px - 767px - iPhone 16) ===== */
@media (max-width: 767px) {
  .login-page {
    background: linear-gradient(135deg, white 0%, var(--bg-lightest) 100%);
  }

  .logo-section {
    padding: 24px 16px 16px;
  }

  .login-main {
    padding: 32px 16px 16px;
  }

  .form-wrapper {
    max-width: 100%;
  }

  .form-card {
    border-radius: 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .form-content {
    padding: 28px 20px;
    gap: 18px;
  }
}

/* ===== Extra Small (320px - 389px) ===== */
@media (max-width: 389px) {
  .logo-section {
    padding: 20px 12px 12px;
  }

  .login-main {
    padding: 12px;
  }

  .form-card {
    border-radius: 24px;
  }

  .form-content {
    padding: 20px 16px;
    gap: 16px;
  }
}
</style>
