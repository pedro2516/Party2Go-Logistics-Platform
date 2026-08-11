// backend/config/firebase-admin.js
const admin = require('firebase-admin');

// We use environment variables for the service account
// Ensure you have FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env
// Alternatively, place your serviceAccountKey.json in the config folder.

try {
  // Replace actual newlines in private key if it's passed as a single string
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'pw-autenticacao',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("✅ Firebase Admin Inicializado com Sucesso");
  }
} catch (error) {
  console.warn("⚠️ Não foi possível inicializar o Firebase Admin. Verifica as credenciais no .env");
  console.warn(error.message);
}

module.exports = admin;
