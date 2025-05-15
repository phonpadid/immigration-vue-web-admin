import type { RouteRecordRaw } from "vue-router";
import Middlewares from "@/lib/middlewares";
import permission from "@/lib/middlewares/permission";
import { LAW_READ, LAW_WRITE } from "@/common/utils/PermissionGroup";

export const lawsRoute: RouteRecordRaw[] = [
  {
    path: "/laws",
    name: "laws",
    component: () => import("../views/Laws.vue"),
    meta: {
      middleware: [Middlewares.guest, permission(LAW_READ)],
    },
  },
  {
    path: "/laws/add",
    name: "laws_add",
    component: () => import("../components/CreateLaws.vue"),
    meta: {
      middleware: [Middlewares.guest, permission(LAW_WRITE)],
    },
  },
  {
    path: "/laws/edit/:id",
    name: "laws_edit",
    component: () => import("../components/UpdateLaws.vue"),
    meta: {
      middleware: [Middlewares.guest, permission(LAW_WRITE)],
    },
  },
  {
    path: "/laws/details/:id",
    name: "laws_details",
    component: () => import("../components/DetailsLaws.vue"),
    meta: {
      middleware: [Middlewares.guest, permission(LAW_READ)],
    },
  },
];
