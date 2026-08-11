import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { strapiGet, strapiPost } from "../../shared/utils/strapi";

/**
 * Validação de NIF Português (Algoritmo de check-digit)
 */
export const validateNIF = (nif) => {
  if (!nif || typeof nif !== "string" || nif.length !== 9) return false;

  const n = nif.split("").map(Number);

  // Regras de dígitos iniciais para NIF português
  if (![1, 2, 3, 5, 6, 8, 9].includes(n[0])) return false;

  const checkDigit = n[8];
  const sum = (n[0] * 9) + (n[1] * 8) + (n[2] * 7) + (n[3] * 6) + (n[4] * 5) + (n[5] * 4) + (n[6] * 3) + (n[7] * 2);
  const remainder = sum % 11;
  const calculatedCheckDigit = (remainder === 0 || remainder === 1) ? 0 : 11 - remainder;

  return checkDigit === calculatedCheckDigit;
};

/**
 * Estrutura do Documento no Firestore:
 * users/{uid}
 * {
 *   uid: string,
 *   email: string,
 *   role: 'admin' | 'driver' | 'business' | 'client',
 *   nif: string | null,
 *   createdAt: timestamp
 * }
 */

/**
 * Determina o redirecionamento com base no e-mail ou role no Firestore
 */
const DRIVER_EMAILS = [
  "estafeta.party2go@gmail.com",
  "estafeta2.party2go@gmail.com",
  "estafeta3.party2go@gmail.com",
  "estafeta4.party2go@gmail.com"
];

export const getRedirectPath = async (user) => {
  // 1. Regras de E-mail Fixas (Override imediato)
  if (user.email === "admin.party2go@gmail.com") return "http://localhost:5174/logistics"; // Backoffice
  if (DRIVER_EMAILS.includes(user.email)) return "http://localhost:5173/dashboard"; // PWA

  // 2. Consulta ao Firestore para outros utilizadores
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role === "admin") return "http://localhost:5174/logistics";
      if (data.role === "driver") return "http://localhost:5173/dashboard";
      if (data.role === "business") return "http://localhost:5175/business";
    }
  } catch (error) {
    console.error("Erro ao buscar role:", error);
  }

  // Fallback padrão: Frontoffice
  return "http://localhost:5175/home";
};

/**
 * Criação de conta com lógica de NIF
 */
export const registerUserInFirestore = async (user, formData = null) => {
  let role = "client";
  let nif = null;
  let fullname = user.displayName || "";
  let companyName = null;
  let phone = null;

  if (formData) {
    const isBusiness = formData.type === 'enterprise';
    role = isBusiness ? "business" : "client";
    nif = formData.nif || null;
    fullname = `${formData.first_name} ${formData.last_name}`.trim();
    companyName = formData.company_name || null;
    phone = formData.phone_number || null;
  }

  const userData = {
    uid: user.uid,
    email: user.email,
    fullname: fullname,
    role: role,
    nif: nif,
    company_name: companyName,
    phone_number: phone,
    createdAt: new Date()
  };

  await setDoc(doc(db, "users", user.uid), userData);
  return userData;
};

/**
 * Sincroniza a conta do utilizador com o Strapi
 */
export const syncClientToStrapi = async (user, formData = null) => {
  // Ignora contas administrativas/logística
  if (user.email === "admin.party2go@gmail.com" || DRIVER_EMAILS.includes(user.email)) return true;

  try {
    // 1. Verifica se o cliente já existe
    const res = await strapiGet(`/api/clients?filters[client_id][$eq]=${user.uid}`);
    if (res.data && res.data.length > 0) {
      return true; // Já existe
    }

    // 2. Prepara o payload para criar o cliente
    let payload = {
      client_id: user.uid,
      email: user.email || "",
      type: "personal",
    };

    if (formData) {
      payload.first_name = formData.first_name || "";
      payload.last_name = formData.last_name || "";
      payload.company_name = formData.company_name || "";
      
      payload.phone_number = formData.phone_number ? Number(formData.phone_number) : null;
      payload.type = formData.type || "personal";
      
      if (formData.nif) {
        payload.nif = Number(formData.nif);
      }
    } else {
      // Login via Google/Magic Link, tentar extrair nome e apelido
      const nameParts = (user.displayName || user.email?.split('@')[0] || "Cliente").split(" ");
      payload.first_name = nameParts[0] || "";
      payload.last_name = nameParts.slice(1).join(" ") || "";
      payload.phone_number = null;
    }

    // 3. Cria no Strapi
    await strapiPost('/api/clients', payload);
    console.log("✅ [Strapi] Cliente criado com sucesso para:", user.email);
    return true;

  } catch (error) {
    console.error("❌ [Strapi] Erro ao sincronizar cliente:", error);
    return false;
  }
};

/**
 * Generate a random courier ID in the CRR-XXXXXXXXX format (mirrors ORD- pattern).
 */
function generateCourierId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 9; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CRR-${suffix}`;
}

/**
 * Ensure a courier record exists in Strapi for the given Firebase user.
 * If the courier doesn't exist yet it is created with just email + courier_id.
 * Returns the mapped courier object (with documentId) for the PWA auth store.
 */
export const syncCourierToStrapi = async (user) => {
  if (!user?.email) return null;

  try {
    // 1. Check if courier already exists by email
    const res = await strapiGet(
      `/api/couriers?filters[email][$eq]=${encodeURIComponent(user.email)}&populate=*`
    );
    if (res.data && res.data.length > 0) {
      console.log('✅ [Strapi] Courier already exists:', user.email);
      return res.data[0];
    }

    // 2. Not found → create minimal record with assigned names
    let firstName = '';
    let lastName = '';
    if (user.email === 'estafeta2.party2go@gmail.com') {
      firstName = 'Filipa';
      lastName = 'Pinto';
    } else if (user.email === 'estafeta3.party2go@gmail.com') {
      firstName = 'Sérgio';
      lastName = 'Carvalho';
    } else if (user.email === 'estafeta4.party2go@gmail.com') {
      firstName = 'Pedro';
      lastName = 'Neves';
    }

    const courierId = generateCourierId();
    const payload = {
      courier_id: courierId,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      vehicle: '',
      licence_plate: '',
      tags: [],
      is_active: false,
    };

    const created = await strapiPost('/api/couriers', payload);
    console.log('✅ [Strapi] Courier created:', courierId, 'for', user.email);
    return created.data ?? null;

  } catch (error) {
    console.error('❌ [Strapi] Erro ao sincronizar courier:', error);
    return null;
  }
};
