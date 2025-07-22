import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import ConnexionView from "../views/ConnexionView.vue";
import ProduitsView from "../views/ProduitsView.vue";
import OrdersView from "../views/OrdersView.vue";
import ProfilView from "../views/ProfilView.vue";
import UsersView from "@/views/UsersView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/produits", name: "Produits", component: ProduitsView },
  { path: "/orders", name: "Orders", component: OrdersView },
  { path: "/connexion", name: "Connexion", component: ConnexionView },
  { path: "/profil", name: "Profil", component: ProfilView },
  { path: "/users", name: "Users", component: UsersView},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
