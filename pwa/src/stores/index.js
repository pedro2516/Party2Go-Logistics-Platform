import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { STRAPI_URL, mapCourier, strapiPut } from "@shared/utils/strapi.js";

export const useStatusStore = defineStore("status", () => {
  const isOnline = ref(true);
  const secondsOnline = ref(0);
  let timer = null;

  const formattedTime = computed(() => {
    const h = Math.floor(secondsOnline.value / 3600);
    const m = Math.floor((secondsOnline.value % 3600) / 60);
    const s = secondsOnline.value % 60;
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m}min`;
    return `${s}s`;
  });

  function startTimer() {
    if (timer) return;
    timer = setInterval(() => { secondsOnline.value++; }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
    timer = null;
  }

  async function toggleStatus() {
    isOnline.value = !isOnline.value;
    
    try {
      // Import the courier store here to avoid circular dependency issues at the top level
      const courierStore = useCourierStore();
      if (courierStore.courierProfile?.documentId) {
        await courierStore.updateCourierProfile({ is_active: isOnline.value });
      }
    } catch (err) {
      console.error("Failed to sync online status with backend:", err);
    }

    if (isOnline.value) {
      secondsOnline.value = 0;
      startTimer();
    } else {
      stopTimer();
      secondsOnline.value = 0;
    }
  }

  // Start timer immediately (user begins online)
  startTimer();

  return { isOnline, secondsOnline, formattedTime, toggleStatus, startTimer };
});

export const useCourierStore = defineStore("pwa-courier", () => {
  const user = ref(null);
  const isAuthenticated = ref(false);
  /** Full courier profile fetched from Strapi after login */
  const courierProfile = ref(null);

  function setUser(userData) {
    user.value = userData;
    isAuthenticated.value = true;
  }

  /** Store the courier Strapi profile after resolving by email */
  function setCourierProfile(profile) {
    courierProfile.value = profile;
  }

  /**
   * Look up the Strapi courier whose email matches the Firebase user's email.
   * Call this right after a successful Firebase login in the PWA.
   */
  async function resolveCourierFromStrapi(email) {
    if (!email) return;
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/couriers?populate=*&filters[email][$eq]=${encodeURIComponent(email)}`
      );
      if (!res.ok) return;
      const json = await res.json();
      const entries = json.data ?? [];
      if (entries.length > 0) {
        const mapped = mapCourier(entries[0]);
        courierProfile.value = mapped;
        
        // Sync local online status with backend state
        const statusStore = useStatusStore();
        if (statusStore.isOnline !== mapped.isActive) {
          statusStore.isOnline = mapped.isActive;
          if (mapped.isActive) {
            statusStore.startTimer();
          } else {
            statusStore.stopTimer();
          }
        }
      }
    } catch (err) {
      console.warn("[AuthStore] Could not resolve courier from Strapi:", err);
    }
  }

  /**
   * Save updated courier fields to Strapi (PUT).
   * Only sends fields that exist on the courier schema.
   * Vehicle/licence_plate/tags now live on the Vehicle entity — not sent here.
   * @param {object} fields - { first_name?, last_name?, is_active? }
   */
  async function updateCourierProfile(fields) {
    const documentId = courierProfile.value?.documentId;
    if (!documentId) throw new Error("No courier documentId — profile not loaded yet.");

    // Only allow fields that exist on the courier collection type
    const allowed = ['first_name', 'last_name', 'is_active'];
    const safeFields = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );

    const updated = await strapiPut(`/api/couriers/${documentId}`, safeFields);
    // Re-fetch the full profile with vehicle populated so tags/brand/plate stay fresh
    if (updated?.data) {
      await resolveCourierFromStrapi(courierProfile.value?.email);
    }
    return updated;
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    courierProfile.value = null;
  }

  /** Computed display name: prefers Strapi name, falls back to Firebase displayName */
  const displayName = computed(() => {
    if (courierProfile.value?.name) return courierProfile.value.name;
    if (user.value?.displayName) return user.value.displayName;
    return "Estafeta";
  });

  return {
    user,
    isAuthenticated,
    courierProfile,
    displayName,
    setUser,
    setCourierProfile,
    resolveCourierFromStrapi,
    updateCourierProfile,
    logout,
  };
});
