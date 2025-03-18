import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const authRoute: RouteRecordRaw[] = [
  {
    path: "/admin/login",
    name: "login",
    component: () => import("../views/Loginview.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
