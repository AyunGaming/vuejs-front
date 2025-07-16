import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import UsersView from "../views/UsersView.vue";
import ProduitsView from "../views/Produits.vue";
import OrdersView from "../views/OrdersView.vue";
import ProfilView from "../views/ProfilView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/produits", name: "Produits", component: ProduitsView },
  { path: "/orders", name: "Orders", component: OrdersView },
  { path: "/users", name: "Users", component: UsersView },
  { path: "/profil", name: "Profil", component: ProfilView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
