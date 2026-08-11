import { createRouter, createWebHistory } from "vue-router";
import Login from "@shared/views/Login.vue";
import Cart from "@shared/views/Cart.vue";
import LogisticsDashboard from "@/views/LogisticsDashboard.vue";
import ActiveDeliveries from "@/views/ActiveDeliveries.vue";
import CouriersList from "@/views/CouriersList.vue";
import BackofficeMap from "@/views/BackofficeMap.vue";
import Profile from "@/views/Profile.vue";
import ForgotPassword from "@shared/views/ForgotPassword.vue";
import ResetPassword from "@shared/views/ResetPassword.vue";
const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    props: { hideFooter: true, appTitle: "Party2Go - Backoffice" }
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
    path: "/logistics",
    name: "LogisticsDashboard",
    component: LogisticsDashboard,
  },
  {
    path: "/logistics/deliveries",
    name: "ActiveDeliveries",
    component: ActiveDeliveries,
  },
  {
    path: "/logistics/couriers",
    name: "Couriers",
    component: CouriersList,
  },
  {
    path: "/logistics/map",
    name: "LogisticsMap",
    component: BackofficeMap,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
