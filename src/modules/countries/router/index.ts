import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const countryRoute: RouteRecordRaw[] = [
  {
    path: "/countries",
    name: "countries",
    component: () => import("../views/Country.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/countries/add",
    name: "countries_add",
    component: () => import("../components/CreateCountry.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/countries/edit/:id",
    name: "countries_edit",
    component: () => import("../components/UpdateCountry.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/countries/details/:id",
    name: "countries_details",
    component: () => import("../components/DetailsCountry.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
