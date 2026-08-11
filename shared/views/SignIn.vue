<template>
  <div class="signin-page">
    <!-- Logo Section -->
    <SignInLogo />

    <!-- Form Container -->
    <main class="signin-main">
      <div class="form-wrapper">
        <div class="form-card">
          <SignInHeader />

          <div class="form-content">
            <SignInForm 
              :is-loading="isLoading"
              :error-message="errorMessage"
              @submit="handleFormSubmit" 
            />
            <SignInFooter @navigate="navigateToLogin" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SignInLogo from "@shared/components/SignInLogo.vue";
import SignInHeader from "@shared/components/SignInHeader.vue";
import SignInForm from "@shared/components/SignInForm.vue";
import SignInFooter from "@shared/components/SignInFooter.vue";
import { auth } from "@backend/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { registerUserInFirestore, syncClientToStrapi, validateNIF } from "@backend/auth/authService";

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref("");

const handleFormSubmit = async (formData) => {
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    if (!auth) {
      throw new Error("Firebase não está configurado. Verifica backend/firebase.js");
    }

    // Validar NIF se fornecido
    if (formData.nif && !validateNIF(formData.nif)) {
      throw new Error("O NIF introduzido é inválido. Por favor, verifica o número.");
    }
    
    // 1. Criar o utilizador no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    
    const fullName = `${formData.first_name} ${formData.last_name}`.trim();

    // 2. Atualizar o perfil com o nome completo
    await updateProfile(userCredential.user, {
      displayName: fullName
    });
    
    // 3. Criar o documento no Firestore com a nova lógica
    await registerUserInFirestore(userCredential.user, formData);

    // 4. Sincronizar com o Strapi
    const strapiSuccess = await syncClientToStrapi(userCredential.user, formData);
    
    if (!strapiSuccess) {
      throw new Error("Erro de comunicação com o servidor. O cliente não foi criado na base de dados.");
    }
    
    // 5. Redirecionar para o sítio certo
    if (formData.type === 'enterprise') {
      router.push({ name: 'Business' });
    } else {
      router.push({ name: 'Home' });
    }

  } catch (error) {
    console.error("Erro no registo:", error);
    if (error.code === 'auth/email-already-in-use') {
      errorMessage.value = "Este email já está em uso.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage.value = "A palavra-passe deve ter pelo menos 6 caracteres.";
    } else {
      errorMessage.value = error.message || "Ocorreu um erro ao criar a conta.";
    }
  } finally {
    isLoading.value = false;
  }
};

const navigateToLogin = () => {
  router.push({ name: "Login" });
};
</script>

<style scoped>
.signin-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}


.signin-main {
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
  .signin-page {
    background: linear-gradient(135deg, white 0%, var(--bg-lightest) 100%);
  }

  .logo-section {
    padding: 24px 16px 16px;
  }

  .signin-main {
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

  .signin-main {
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
