import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const newsRoute: RouteRecordRaw[] = [
  {
    path: "/admin/news",
    name: "news",
    component: () => import("../views/News.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/news/add",
    name: "news_add",
    component: () => import("../components/CreateNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/news/edit/:id",
    name: "news_edit",
    component: () => import("../components/UpdateNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/news/details/:id",
    name: "news_details",
    component: () => import("../components/DetailsNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
