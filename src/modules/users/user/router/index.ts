import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const usersRoute: RouteRecordRaw[] = [
  {
    path: "/users",
    name: "users",
    component: () => import("../views/User.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/users/add",
    name: "users_add",
    component: () => import("../components/CreateUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/users/edit/:id",
    name: "users_edit",
    component: () => import("../components/UpdateUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/users/details/:id",
    name: "users_deatils",
    component: () => import("../components/DetailsUser.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
