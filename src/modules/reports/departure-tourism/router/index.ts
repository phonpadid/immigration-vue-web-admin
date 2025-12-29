import type { RouteRecordRaw } from "vue-router";

export const departureTourismRoute: RouteRecordRaw[] = [
  {
    path: "/admin/report/departure-tourism",
    name: "departure_tourism_report",
    component: () => import("../views/DepartureTourism.vue"),
  },
];
