import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const visaRoute: RouteRecordRaw[] = [
  {
    path: "/admin/visa-category",
    name: "visa_category",
    component: () => import("../views/Visa.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/visa-category/add",
    name: "visa_category_add",
    component: () => import("../components/CreateVisa.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/visa-category/edit/:id",
    name: "visa_category_edit",
    component: () => import("../components/UpdateVisa.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
