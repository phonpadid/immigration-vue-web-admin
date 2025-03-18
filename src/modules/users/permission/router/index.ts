import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const permissionsRoute: RouteRecordRaw[] = [
  {
    path: "/permissions",
    name: "permissions",
    component: () => import("../views/ListPermission.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
