import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import UsersView from "../views/UsersView.vue";
import ArticlesView from "../views/ArticlesView.vue";
import OrdersView from "../views/OrdersView.vue";

const routes = [
  { path: "/", name: "Home", component: HomeView },
  { path: "/articles", name: "Articles", component: ArticlesView },
  { path: "/orders", name: "Orders", component: OrdersView },
  { path: "/users", name: "Users", component: UsersView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
