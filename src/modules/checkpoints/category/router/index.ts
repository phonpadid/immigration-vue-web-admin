import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const checkpointCategoriesRoute: RouteRecordRaw[] = [
  {
    path: "/checkpointCategories",
    name: "checkpointCategories",
    component: () => import("../views/CheckpointCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/checkpointCategories/add",
    name: "checkpointCategories_add",
    component: () => import("../components/CreateCheckpointCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/checkpointCategories/edit/:id",
    name: "checkpointCategories_edit",
    component: () => import("../components/UpdateCheckpointCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/checkpointCategories/details/:id",
    name: "checkpointCategories_details",
    component: () => import("../components/DetailsCheckpointCategories.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
