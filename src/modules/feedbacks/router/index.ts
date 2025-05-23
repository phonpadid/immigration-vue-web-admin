import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const feedbacksRoute: RouteRecordRaw[] = [
  {
    path: "/admin/feedbacks",
    name: "feedbacks",
    component: () => import("../views/Feedbacks.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/feedbacks/details/:id",
    name: "feedbacks_details",
    component: () => import("../components/DetailsFeedback.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
