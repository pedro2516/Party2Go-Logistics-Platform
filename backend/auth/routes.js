// backend/routes.js
import { useAuthStore } from "./authStore";
import { watch } from "vue";

/**
 * Exemplo de Route Guard para o Vue Router (index.js)
 * 
 * Este código impede que um utilizador aceda a uma página
 * se não tiver o "role" necessário.
 */

export const setupGuards = (router) => {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Aguarda o estado de autenticação carregar se necessário
    if (!authStore.isAuthReady) {
      await new Promise((resolve) => {
        const unwatch = watch(() => authStore.isAuthReady, (isReady) => {
          if (isReady) {
            unwatch();
            resolve();
          }
        });
      });
    }

    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        return next({ name: 'Login' });
      }

      // Proteção por Role
      if (to.meta.role && authStore.userRole !== to.meta.role) {
        console.warn("Acesso negado: Perfil insuficiente.");
        return next({ name: 'Login' }); // Changed from Dashboard to prevent infinite loops
      }
    }

    next();
  });
};
