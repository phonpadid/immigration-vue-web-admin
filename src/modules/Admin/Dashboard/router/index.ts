import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const dashboardRoute: RouteRecordRaw[] = [
  {
    path: "/admin/dashboard",
    name: "dashboard",
    component: () => import("../views/index.vue"),
    // meta: {
    //   middleware: [Middlewares.auth],
    //   label: "ໜ້າຫຼັກ",
    // },
  },
];
