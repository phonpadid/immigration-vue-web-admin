import type { RouteRecordRaw } from "vue-router";

export const arrivalTourismRoute: RouteRecordRaw[] = [
  {
    path: "/admin/report/arrival-tourism",
    name: "arrival_tourism_report",
    component: () => import("../views/ArrivalTourism.vue"),
  },
];
