import { h, reactive } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import { HomeOutlined } from "@ant-design/icons-vue";
import router from "@/router";

function logout() {
  localStorage.clear();
  router
    .push({
      name: "login",
    })
    .catch(() => {});
}

export const menuItems: ItemType[] = reactive([
  {
    label: "ໜ້າຫຼັກ",
    children: [
      {
        key: "dashboard",
        label: "ໜ້າຫຼັກ",
        icon: () => h(HomeOutlined),
        // role: ['super_admin', 'admin']
      },
      {
        key: "2",
        label: "ເຮັດທຸລະກຳ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "ic-baseline-sync-alt",
              class: "text-base",
            }),
          ]),
        role: ["super_admin", "admin"],
      },
    ],
    type: "group",
  },
  {
    label: "",
    children: [
      { type: "divider" },
      {
        key: "100",
        label: "ການລົງທະບຽນ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:edit-document-outline",
              class: "text-base",
            }),
          ]),
        children: [
          {
            key: "registrations_arrival",
            label: "ລົງທະບຽນເຂົ້າເມືອງ",
          },
          {
            key: "registrations_departure",
            label: "ລົງທະບຽນອອກເມືອງ",
          },
          {
            key: "registrations_number",
            label: "ຈຳນວນການລົງທະບຽນ",
            // role: ['super_admin', 'admin']
          },
        ],
        // role: ['super_admin', 'admin']
      },
    ],
    type: "group",
  },

  {
    key: "service",
    label: "ປະເພດບໍລິການ",
    icon: () =>
      h("div", {}, [
        h(Icon, {
          icon: "ic:outline-headset-mic",
          class: "text-base",
        }),
      ]),
  },
  {
    key: "visa-category",
    label: "ປະເພດວິຊາ",
    icon: () =>
      h("div", {}, [
        h(Icon, {
          icon: "material-symbols-light:payments-outline-rounded",
          class: "text-base",
        }),
      ]),
  },
  {
    label: "",
    children: [
      { type: "divider" },
      {
        key: "11",
        label: "ຈັດການຜູ້ໃຊ້",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "material-symbols:manage-accounts-outline",
              class: "text-base",
            }),
          ]),
        children: [
          {
            key: "user",
            label: "ຜູ້ໃຊ້",
          },
          {
            key: "roles",
            label: "ບົດບາດ",
          },
          {
            key: "permissions",
            label: "ການອານູຍາດ",
            // role: ['super_admin']
          },
        ],
        // role: ['super_admin', 'admin']
      },
      {
        key: "logout",
        label: "ອອກຈາກລະບົບ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "streamline:interface-logout-circle-arrow-enter-right-logout-point-circle",
              class: "text-base",
            }),
          ]),
        onClick: logout,
      },
    ],
    type: "group",
  },
]);
