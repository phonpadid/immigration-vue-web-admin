import type { RouteRecordRaw } from "vue-router";
// import Middlewares from "@/lib/middlewares";

export const contactsRoute: RouteRecordRaw[] = [
  {
    path: "/admin/contacts",
    name: "contacts",
    component: () => import("../views/Contacts.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
  {
    path: "/admin/contacts/details/:id",
    name: "contacts_details",
    component: () => import("../components/DetailsContacts.vue"),
    // meta: {
    //   middleware: [Middlewares.guest],
    // },
  },
];
