import type { RouteRecordRaw } from "vue-router";

export const nationalitiesRoute: RouteRecordRaw[] = [
  {
    path: "/admin/nationalities",
    name: "nationalities",
    component: () => import("../views/NationalityView.vue"),
  },
  {
    path: "/admin/nationalities/add",
    name: "nationalities_add",
    component: () => import("../components/CreateNationality.vue"),
  },
  {
    path: "/admin/nationalities/edit/:id",
    name: "nationalities_edit",
    component: () => import("../components/UpdateNationality.vue"),
  },
];
