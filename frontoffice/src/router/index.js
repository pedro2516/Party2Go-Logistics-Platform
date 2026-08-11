import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import CreatePack from "@/views/CreatePack.vue";
import PackDetails from "@/views/PackDetails.vue";
import Combos from "@/views/Combos.vue";
import Business from "@/views/Business.vue";
import ClientArea from "@/views/ClientArea.vue";
import TrackOrder from "@/views/TrackOrder.vue";
import Chat from "@/views/Chat.vue";
import SignIn from "@shared/views/SignIn.vue";
import Login from "@shared/views/Login.vue";
import RequestDelivery from "@/views/RequestDelivery.vue";
import Cart from "@shared/views/Cart.vue";
import Checkout from "@/views/Checkout.vue";
import BusinessCart from "@/views/BusinessCart.vue";
import BusinessClientArea from "@/views/BusinessClientArea.vue";
import BusinessTrackOrder from "@/views/BusinessTrackOrder.vue";
import ForgotPassword from "@shared/views/ForgotPassword.vue";
import ResetPassword from "@shared/views/ResetPassword.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
  {
    path: "/criar-pack",
    name: "CreatePack",
    component: CreatePack,
  },
  {
    path: "/pack/:id",
    name: "PackDetails",
    component: PackDetails,
  },
  {
    path: "/combos",
    name: "Combos",
    component: Combos,
  },
  {
    path: "/business",
    name: "Business",
    component: Business,
  },
  {
    path: "/client-area",
    name: "ClientArea",
    component: ClientArea,
  },
  {
    path: "/track-order/:id",
    name: "TrackOrder",
    component: TrackOrder,
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat,
  },
  {
    path: "/business/track-order/:id",
    name: "BusinessTrackOrder",
    component: BusinessTrackOrder,
  },
  {
    path: "/request-delivery",
    name: "RequestDelivery",
    component: RequestDelivery,
  },
  {
    path: "/business/carrinho",
    name: "BusinessCart",
    component: BusinessCart,
  },
  {
    path: "/business/cart",
    redirect: "/business/carrinho",
  },
  {
    path: "/business/personal-area",
    name: "BusinessClientArea",
    component: BusinessClientArea,
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    props: { appTitle: "Party2Go - Frontoffice" }
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SignIn,
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
  },
];

import { useAuthStore } from "@backend/auth/authStore";
import { watch } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for auth to be fully initialized from Firebase before proceeding
  if (!authStore.isAuthReady) {
    await new Promise((resolve) => {
      const unwatch = watch(
        () => authStore.isAuthReady,
        (isReady) => {
          if (isReady) {
            unwatch();
            resolve();
          }
        },
        { immediate: true }
      );
    });
  }

  next();
});

export default router;
