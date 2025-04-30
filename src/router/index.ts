import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { dashboardRoute } from "@/modules/Admin/Dashboard/router";
import { authRoute } from "@/modules/Admin/authentication/router";
import { permissionsRoute } from "@/modules/users/permission/router";
import { roleRoute } from "@/modules/users/role/router";
import { usersRoute } from "@/modules/users/user/router";
import { feedbacksRoute } from "@/modules/feedbacks/router";
import { contactsRoute } from "@/modules/contacts/router";
import { lawsRoute } from "@/modules/laws/router";
import { newsCategoriessRoute } from "@/modules/news_categories/news_categories/router";
import { newsRoute } from "@/modules/news_categories/news/router";
import { checkpointCategoriesRoute } from "@/modules/checkpoints/category/router";
import { provinceRoute } from "@/modules/checkpoints/province/router";
import { countryRoute } from "@/modules/countries/router";
import { bannerRoute } from "@/modules/banner-hero/banners/router";
import { popupsRoute } from "@/modules/banner-hero/popups/router";
import { visaRoute } from "@/modules/visa-category/router";
import { numberRoute } from "@/modules/registration/registration_number/router";
import { servicesRoute } from "@/modules/service/router";
import { hotelsRoute } from "@/modules/hotels/router";
import { arrivalRoute } from "@/modules/registration/registration_arrival/router";
import { departureRoute } from "@/modules/registration/registration_departure/router";

const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    component: () => import("../layouts/BaseLayout.vue"),
    children: [
      ...dashboardRoute,
      ...permissionsRoute,
      ...roleRoute,
      ...usersRoute,
      ...feedbacksRoute,
      ...contactsRoute,
      ...lawsRoute,
      ...newsCategoriessRoute,
      ...newsRoute,
      ...checkpointCategoriesRoute,
      ...provinceRoute,
      ...countryRoute,
      ...bannerRoute,
      ...popupsRoute,
      ...visaRoute,
      ...numberRoute,
      ...servicesRoute,
      ...hotelsRoute,
      ...arrivalRoute,
      ...departureRoute,
    ],
  },
  ...authRoute,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
