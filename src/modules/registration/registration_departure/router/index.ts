import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const departureRoute: RouteRecordRaw[] = [
  {
    path: "/admin/departure",
    name: "registrations_departure",
    component: () => import("../views/Departure.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/departure/details/:id",
    name: "departure_details",
    component: () => import("../components/DepartureDetails.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
