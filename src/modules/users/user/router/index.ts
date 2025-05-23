import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const usersRoute: RouteRecordRaw[] = [
  {
    path: "/admin/users",
    name: "users",
    component: () => import("../views/User.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/users/add",
    name: "users_add",
    component: () => import("../components/CreateUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/users/edit/:id",
    name: "users_edit",
    component: () => import("../components/UpdateUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/users/details/:id",
    name: "users_details",
    component: () => import("../components/DetailsUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
