import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const newsCategoriessRoute: RouteRecordRaw[] = [
  {
    path: "/admin/newsCategoriess",
    name: "newsCategoriess",
    component: () => import("../views/NewCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/newsCategoriess/add",
    name: "newsCategoriess_add",
    component: () => import("../components/CreateNewsCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/newsCategoriess/edit/:id",
    name: "newsCategoriess_edit",
    component: () => import("../components/UpdateNewsCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
