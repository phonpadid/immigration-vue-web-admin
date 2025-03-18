import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { dashboardRoute } from "@/modules/Admin/Dashboard/router";
import { authRoute } from "@/modules/Admin/authentication/router";
import { permissionsRoute } from "@/modules/users/permission/router";
import { roleRoute } from "@/modules/users/role/router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [...dashboardRoute, ...permissionsRoute, ...roleRoute],
  },
  ...authRoute,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
