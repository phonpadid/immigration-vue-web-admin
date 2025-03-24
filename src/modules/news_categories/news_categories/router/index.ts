import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const newsCategoriessRoute: RouteRecordRaw[] = [
  {
    path: "/newsCategoriess",
    name: "newsCategoriess",
    component: () => import("../views/NewCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/newsCategoriess/add",
    name: "newsCategoriess_add",
    component: () => import("../components/CreateNewsCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/newsCategoriess/edit/:id",
    name: "newsCategoriess_edit",
    component: () => import("../components/UpdateNewsCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
