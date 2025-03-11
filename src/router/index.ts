import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Test from "@/views/Test.vue";
import { dashboardRoute } from "@/modules/Admin/Dashboard/router";
import { authRoute } from "@/modules/Admin/authentication/router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [...dashboardRoute],
  },
  ...authRoute,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
