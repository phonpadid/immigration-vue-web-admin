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
        // role: ['deve', 'admin']
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
            // role: ["super_admin", "admin"],
          },
        ],
        // role: ['super_admin', 'admin']
      },
    ],
    type: "group",
  },

  {
    key: "service",
    label: "ບໍລິການ",
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
    key: "feedbacks",
    label: "ຄຳຕິຊົມ",
    icon: () =>
      h("div", {}, [
        h(Icon, {
          icon: "mdi:message-text",
          class: "text-base",
        }),
      ]),
  },
  {
    key: "contacts",
    label: "ຂໍ້ມູນຕິດຕໍ່",
    icon: () =>
      h("div", {}, [
        h(Icon, {
          icon: "ic:outline-phone",
          class: "text-base",
        }),
      ]),
  },
  {
    key: "laws",
    label: "ກົດໝາຍ",
    icon: () =>
      h("div", {}, [
        h(Icon, {
          icon: "material-symbols:balance",
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
        label: "ຂ່າວສານ",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "mdi:newspaper-variant-multiple",
              class: "text-base",
            }),
          ]),
        children: [
          {
            key: "newsCategoriess",
            label: "ປະເພດຂ່າວ",
          },
          {
            key: "news",
            label: "ຂ່າວ",
          },
        ],
        // role: ['super_admin', 'admin']
      },
      {
        key: "12",
        label: "ຈັດການຜູ້ໃຊ້",
        icon: () =>
          h("div", {}, [
            h(Icon, {
              icon: "mdi:user",
              class: "text-base",
            }),
          ]),
        children: [
          {
            key: "users",
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
      // {
      //   key: "logout",
      //   label: "ອອກຈາກລະບົບ",
      //   icon: () =>
      //     h("div", {}, [
      //       h(Icon, {
      //         icon: "streamline:interface-logout-circle-arrow-enter-right-logout-point-circle",
      //         class: "text-base",
      //       }),
      //     ]),
      //   onClick: logout,
      // },
    ],
    type: "group",
  },
]);
