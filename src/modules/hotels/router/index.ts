import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const hotelsRoute: RouteRecordRaw[] = [
  {
    path: "/hotels",
    name: "hotels",
    component: () => import("../views/Hotels.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/hotels/add",
    name: "hotels_add",
    component: () => import("../components/CreateHotels.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/hotels/edit/:id",
    name: "hotels_edit",
    component: () => import("../components/UpdateHotels.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/hotels/details/:id",
    name: "hotels_details",
    component: () => import("../components/DetailsHotels.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
