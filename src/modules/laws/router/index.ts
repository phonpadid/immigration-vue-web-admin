import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const lawsRoute: RouteRecordRaw[] = [
  {
    path: "/laws",
    name: "laws",
    component: () => import("../views/Laws.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/laws/add",
    name: "laws_add",
    component: () => import("../components/CreateLaws.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/laws/edit/:id",
    name: "laws_edit",
    component: () => import("../components/UpdateLaws.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/laws/details/:id",
    name: "laws_details",
    component: () => import("../components/DetailsLaws.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
