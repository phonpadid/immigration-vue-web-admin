import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const newsRoute: RouteRecordRaw[] = [
  {
    path: "/news",
    name: "news",
    component: () => import("../views/News.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/news/add",
    name: "news_add",
    component: () => import("../components/CreateNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/news/edit/:id",
    name: "news_edit",
    component: () => import("../components/UpdateNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/news/details/:id",
    name: "news_details",
    component: () => import("../components/DetailsNews.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
