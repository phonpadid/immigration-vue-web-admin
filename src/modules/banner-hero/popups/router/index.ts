import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const popupsRoute: RouteRecordRaw[] = [
  {
    path: "/popups",
    name: "popups",
    component: () => import("../views/Popup.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/popups/add",
    name: "popups_add",
    component: () => import("../components/CreatePopup.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/popups/edit/:id",
    name: "popups_edit",
    component: () => import("../components/UpdatePopup.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/popups/details/:id",
    name: "popups_details",
    component: () => import("../components/DetailsPopup.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
