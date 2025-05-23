import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const checkpointRoute: RouteRecordRaw[] = [
  {
    path: "/admin/checkpoint",
    name: "checkpoint",
    component: () => import("../views/Checkpoint.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/checkpoint/add",
    name: "checkpoint_add",
    component: () => import("../components/CreateCheckpoint.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/checkpoint/edit/:id",
    name: "checkpoint_edit",
    component: () => import("../components/UpdateCheckpoint.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/checkpoint/details/:id",
    name: "checkpoint_details",
    component: () => import("../components/DetailsCheckpoint.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
