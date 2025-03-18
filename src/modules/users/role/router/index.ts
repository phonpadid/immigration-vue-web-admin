import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const roleRoute: RouteRecordRaw[] = [
  {
    path: "/roles",
    name: "roles",
    component: () => import("../views/Role.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/roles/add",
    name: "roles_add",
    component: () => import("../components/CreateRole.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/roles/edit/:id",
    name: "roles_edit",
    component: () => import("../components/UpdateRole.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/roles/details/:id",
    name: "roles_deatils",
    component: () => import("../components/DetailRole.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
