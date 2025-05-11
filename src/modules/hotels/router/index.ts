import type { RouteRecordRaw } from "vue-router";
import Middlewares from "@/lib/middlewares";
import permission from "@/lib/middlewares/permission";
import { HOTEL_READ, HOTEL_WRITE } from "@/common/utils/PermissionGroup";

export const hotelsRoute: RouteRecordRaw[] = [
  {
    path: "/hotels",
    name: "hotels",
    component: () => import("../views/Hotels.vue"),
    meta: {
      middleware: [Middlewares.auth, permission(HOTEL_READ)],
    },
  },
  {
    path: "/hotels/add",
    name: "hotels_add",
    component: () => import("../components/CreateHotels.vue"),
    meta: {
      middleware: [Middlewares.auth, permission(HOTEL_WRITE)],
    },
  },
  {
    path: "/hotels/edit/:id",
    name: "hotels_edit",
    component: () => import("../components/UpdateHotels.vue"),
    meta: {
      middleware: [Middlewares.auth, permission(HOTEL_WRITE)],
    },
  },
  {
    path: "/hotels/details/:id",
    name: "hotels_details",
    component: () => import("../components/DetailsHotels.vue"),
    meta: {
      middleware: [Middlewares.auth, permission(HOTEL_READ)],
    },
  },
];
