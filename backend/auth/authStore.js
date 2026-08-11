import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Emails com role fixo — não precisam de documento no Firestore
const EMAIL_ROLE_MAP = {
  "admin.party2go@gmail.com":    "admin",
  "estafeta.party2go@gmail.com": "driver",
  "estafeta2.party2go@gmail.com": "driver",
  "estafeta3.party2go@gmail.com": "driver",
  "estafeta4.party2go@gmail.com": "driver",
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userRole = ref(null); // 'admin' | 'driver' | 'business' | 'client' | null
  const isAuthenticated = ref(false);
  const isAuthReady = ref(false);

  if (auth) {
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser;
      isAuthenticated.value = !!currentUser;

      if (currentUser) {
        // Contas especiais: role determinado pelo email, sem query ao Firestore
        if (EMAIL_ROLE_MAP[currentUser.email]) {
          userRole.value = EMAIL_ROLE_MAP[currentUser.email];
        } else {
          // Utilizadores normais: ler role do Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            userRole.value = userDoc.exists() ? userDoc.data().role : null;
          } catch (error) {
            console.error("Erro ao carregar role do utilizador:", error);
            userRole.value = null;
          }
        }
      } else {
        userRole.value = null;
      }

      isAuthReady.value = true;
    });
  } else {
    isAuthReady.value = true;
  }

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return { user, userRole, isAuthenticated, isAuthReady, logout };
});
