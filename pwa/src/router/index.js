import { createRouter, createWebHistory } from "vue-router";
import Login from "@shared/views/Login.vue";
import DeliveryDashboard from "../views/DeliveryDashboard.vue";
import DeliveryMap from "../views/DeliveryMap.vue";
import Deliveries from "../views/Deliveries.vue";
import Chat from "../views/Chat.vue";
import Profile from "../views/Profile.vue";
import ForgotPassword from "@shared/views/ForgotPassword.vue";
import ResetPassword from "@shared/views/ResetPassword.vue";
import { setupGuards } from "@backend/auth/routes";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    props: { hideFooter: true, appTitle: "Party2Go - PWA" }
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
  {
    path: "/dashboard",
    name: "DeliveryDashboard",
    component: DeliveryDashboard,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/map",
    name: "DeliveryMap",
    component: DeliveryMap,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/map/:id",
    name: "DeliveryMapOrder",
    component: DeliveryMap,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/deliveries",
    name: "Deliveries",
    component: Deliveries,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/deliveries-details",
    name: "DeliveriesDetails",
    component: Deliveries,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/chat",
    name: "Chat",
    component: Chat,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true, role: "driver", layout: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

setupGuards(router);

export default router;