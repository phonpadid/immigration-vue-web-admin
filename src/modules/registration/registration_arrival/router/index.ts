import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const arrivalRoute: RouteRecordRaw[] = [
  {
    path: "/arrival",
    name: "registrations_arrival",
    component: () => import("../views/Arrival.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/arrival/details/:id",
    name: "arrival_details",
    component: () => import("../components/DetailsArrival.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
