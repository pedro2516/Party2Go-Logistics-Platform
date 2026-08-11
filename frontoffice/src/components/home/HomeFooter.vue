<template>
  <section class="home-footer" v-if="!authStore.isAuthenticated">
    <div class="footer-content">
      <h2 class="footer-title">Cria a tua conta hoje</h2>
      <p class="footer-description">
        Junte-se a nós e tenha acesso imediato a todas as oportunidades!
      </p>
      <button class="btn-create-account" @click="navigateToSignIn">
        Criar Conta Grátis
      </button>
      
      <p class="login-prompt">
        Já tem uma conta? <span class="login-link" @click="navigateToLogin">Iniciar Sessão</span>
      </p>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@backend/auth/authStore";

const router = useRouter();
const authStore = useAuthStore();

const navigateToSignIn = () => {
  router.push("/signin");
};

const navigateToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
/* Removed fixed positioning to allow footer to stay at bottom of content */

.home-footer {
  background-color: var(--primary-color);
  padding: 120px 24px;
  text-align: center;
  margin-top: 80px;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-title {
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 42px;
  color: white;
  line-height: 1.2;
  margin: 0;
}

.footer-description {
  font-family: "Public Sans", sans-serif;
  font-weight: 400;
  font-size: 18px;
  color: white;
  line-height: 20px;
  margin: 0;
}

.btn-create-account {
  background-color: white;
  color: var(--primary-color);
  font-family: "Public Sans", sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 16px 40px;
  border-radius: 99px;
  border: none;
  height: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  width: fit-content;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-create-account:hover {
  background-color: var(--border-lighter);
  transform: scale(1.05);
}

.login-prompt {
  font-family: "Public Sans", sans-serif;
  font-size: 16px;
  color: white;
  margin-top: 8px;
}

.login-link {
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.login-link:hover {
  opacity: 0.8;
}

@media (max-width: 576px) {
  .home-footer {
    margin-top: 0;
    padding: 60px 20px 120px;
    border-radius: 0;
  }

  .footer-content {
    gap: 24px;
  }

  .footer-title {
    font-size: 28px;
    line-height: 1.2;
  }

  .footer-description {
    font-size: 15px;
    line-height: 22px;
    margin-bottom: 8px;
  }

  .btn-create-account {
    width: 100%;
    padding: 14px 24px;
  }
}
</style>
