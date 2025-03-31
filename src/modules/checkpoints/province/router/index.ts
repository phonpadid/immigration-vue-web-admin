import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const provinceRoute: RouteRecordRaw[] = [
  {
    path: "/provinces",
    name: "provinces",
    component: () => import("../views/Province.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/provinces/add",
    name: "provinces_add",
    component: () => import("../components/CreateProvince.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/provinces/edit/:id",
    name: "provinces_edit",
    component: () => import("../components/UpdateProvince.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/provinces/details/:id",
    name: "provinces_details",
    component: () => import("../components/DetailsProvince.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
