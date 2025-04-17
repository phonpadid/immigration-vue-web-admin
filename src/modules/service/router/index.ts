import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const servicesRoute: RouteRecordRaw[] = [
  {
    path: "/services",
    name: "services",
    component: () => import("../views/ServiceView.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/services/add",
    name: "services_add",
    component: () => import("../components/CreateService.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/services/edit/:id",
    name: "services_edit",
    component: () => import("../components/UpdateService.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
