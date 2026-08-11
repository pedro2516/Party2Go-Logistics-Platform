// backend/firebase.js

// BUGFIX: Capturar o URL original assim que o script carrega, ANTES de o Vue Router o limpar!
// O Firebase utiliza o 'oobCode' para verificar o link mágico.
if (typeof window !== "undefined" && window.location.href.includes('oobCode=')) {
  window.sessionStorage.setItem('originalFirebaseUrl', window.location.href);
  console.log("URL Original Capturado pelo Firebase:", window.location.href);
}

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: O utilizador precisa de substituir estes valores pelo código gerado na consola do Firebase
const firebaseConfig = {
  apiKey: "process.env.FIREBASE_API_KEY",
  authDomain: "pw-autenticacao.firebaseapp.com",
  projectId: "pw-autenticacao",
  storageBucket: "pw-autenticacao.firebasestorage.app",
  messagingSenderId: "1073005406722",
  appId: "1:1073005406722:web:db779aef9a03e222a0151b"
};

// Inicializa o Firebase (Se os dados estiverem vazios/inválidos, pode lançar um aviso na consola, mas a app não deve 'crashar')
let app;
let auth;
let googleProvider;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase não está totalmente configurado ainda. Faltam as credenciais no ficheiro backend/firebase.js");
}

export { auth, googleProvider, db };
