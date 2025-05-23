import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const bannerRoute: RouteRecordRaw[] = [
  {
    path: "/admin/banners",
    name: "banners",
    component: () => import("../views/Banner.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/banners/add",
    name: "banners_add",
    component: () => import("../components/Createbanner.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/banners/edit/:id",
    name: "banners_edit",
    component: () => import("../components/Updatebanner.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/banners/details/:id",
    name: "banners_details",
    component: () => import("../components/Detailsbanner.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
