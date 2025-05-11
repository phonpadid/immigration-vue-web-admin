import { h, computed } from "vue";
import type { ItemType } from "./interfaces/menu.interface";
import { Icon } from "@iconify/vue";
import { HomeOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/lib/stores/auth.store";
import VisaIcon from "@/components/Icon/VisaIcon.vue";
import {
  USER_READ,
  REGISTRATION_READ,
  BANNER_READ,
  FEEDBACK_READ,
  HOTEL_READ,
  NEWS_READ,
  VISA_READ,
  LAW_READ,
  CHECKPOINT_READ,
  CONTACT_READ,
  COUNTRY_READ,
  SERVICE_READ,
  validateUserPermissions,
} from "@/common/utils/PermissionGroup";

// async function logout() {
//   const authStore = useAuthStore();

//   try {
//     // เรียกใช้ API logout ก่อน (ถ้ามี)
//     if (localStorage.getItem("access_token")) {
//       try {
//         await authStore.logout();
//       } catch (error) {
//         console.error("[LOGOUT] Error calling logout API:", error);
//       }
//     }
//     // ล้างข้อมูลใน authStore (ไม่ว่าจะเรียก API สำเร็จหรือไม่)
//     authStore.resetAuth();
//     // ล้าง localStorage
//     localStorage.clear();

//     router
//       .push({
//         name: "login",
//       })
//       .catch((err) => {
//         console.error("[LOGOUT] Error navigating to login:", err);
//       });
//   } catch (error) {
//     console.error("[LOGOUT] Unexpected error during logout:", error);
//     localStorage.clear();
//     authStore.resetAuth();

//     router
//       .push({
//         name: "login",
//       })
//       .catch(() => {});
//   }
// }
function hasPermission(permission: any) {
  const authStore = useAuthStore();
  if (!authStore.user) {
    return false;
  }
  // เพิ่ม debug logs
  // console.log(`[MENU] Checking permission: ${permission}`);
  // แสดงข้อมูลผู้ใช้
  // console.log(`[MENU] User roles:`, authStore.user.roles);
  // console.log(`[MENU] isDevOrAdmin:`, authStore.isDevOrAdmin);
  const roles = Array.isArray(authStore.user.roles)
    ? authStore.user.roles
    : [authStore.user.roles];
  if (roles.includes("dev")) {
    console.log(`[MENU] Permission granted for dev: ${permission}`);
    return true;
  }
  // สำหรับผู้ใช้อื่นๆ (รวมถึง SuperAdmin) ตรวจสอบตาม permissions
  let permissionList: string[] = [];
  // รองรับทั้งกรณีที่ permissions เป็น array ของ string จาก API
  if (
    authStore.user?.permissions &&
    Array.isArray(authStore.user.permissions)
  ) {
    permissionList = authStore.user.permissions;
  } else if (authStore.permissions) {
    // กรณีที่มาจาก permissionStore
    permissionList = authStore.permissions.map((p: any) =>
      typeof p === "string" ? p : p.name
    );
  }
  // ถ้าไม่มี permissions ก็ไม่มีสิทธิ์
  if (permissionList.length === 0) {
    console.log("[MENU] No permissions available");
    return false;
  }
  // console.log(`[MENU] User permissions:`, permissionList);
  // console.log(`[MENU] Checking for permission: ${permission}`);
  const hasAccess = permissionList.includes(permission);
  // console.log(`[MENU] Permission check result: ${hasAccess}`);
  return hasAccess;
}

// สร้าง menuItems แบบ computed property เพื่อให้สามารถตรวจสอบสิทธิ์แบบ reactive ได้
export const menuItems = computed(() => {
  const items: ItemType[] = [
    {
      label: "ໜ້າຫຼັກ",
      children: [
        {
          key: "dashboard",
          label: "ໜ້າຫຼັກ",
          icon: () => h(HomeOutlined),
          permission: USER_READ,
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
              permission: REGISTRATION_READ,
            },
            {
              key: "registrations_departure",
              label: "ລົງທະບຽນອອກເມືອງ",
              permission: REGISTRATION_READ,
            },
            {
              key: "registration_number",
              label: "ຈຳນວນການລົງທະບຽນ",
              permission: REGISTRATION_READ,
            },
          ],
          permission: REGISTRATION_READ,
        },
      ],
      type: "group",
    },
    {
      key: "services",
      label: "ບໍລິການ",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "ic:outline-headset-mic",
            class: "text-base",
          }),
        ]),
      permission: SERVICE_READ,
    },
    {
      key: "visa_category",
      label: "ປະເພດວິຊາ",
      icon: () => h(VisaIcon),
      permission: VISA_READ,
    },
    {
      key: "110",
      label: "ຈັດການໂຄສະນາ",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "material-symbols:brand-awareness",
            class: "text-base",
          }),
        ]),
      children: [
        {
          key: "banners",
          label: "ຈັດການປ້າຍ",
          permission: BANNER_READ,
        },
        {
          key: "popups",
          label: "ຈັດການ popup",
          permission: BANNER_READ,
        },
      ],
      permission: BANNER_READ,
    },
    {
      key: "101",
      label: "ຈັດການດ່ານ",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "ic:sharp-fact-check",
            class: "text-base",
          }),
        ]),
      children: [
        {
          key: "checkpointCategories",
          label: "ປະເພດດ່ານ",
          permission: CHECKPOINT_READ,
        },
        {
          key: "checkpoint",
          label: "ຂໍ້ມູນດ່ານ",
          permission: CHECKPOINT_READ,
        },
        {
          key: "provinces",
          label: "ຈັດການແຂວງ",
          permission: CHECKPOINT_READ,
        },
      ],
      permission: CHECKPOINT_READ,
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
      permission: FEEDBACK_READ,
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
      permission: CONTACT_READ,
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
      permission: LAW_READ,
    },
    {
      key: "hotels",
      label: "ຈັດການໂຮງແຮມ",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "material-symbols:apartment",
            class: "text-base",
          }),
        ]),
      permission: HOTEL_READ,
    },
    {
      key: "countries",
      label: "ປະເທດ",
      icon: () =>
        h("div", {}, [
          h(Icon, {
            icon: "material-symbols:globe",
            class: "text-base",
          }),
        ]),
      permission: COUNTRY_READ,
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
              permission: NEWS_READ,
            },
            {
              key: "news",
              label: "ຂ່າວ",
              permission: NEWS_READ,
            },
          ],
          permission: NEWS_READ,
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
              permission: USER_READ,
            },
            {
              key: "roles",
              label: "ບົດບາດ",
              permission: USER_READ,
            },
            {
              key: "permissions",
              label: "ການອານູຍາດ",
              permission: USER_READ,
            },
          ],
          permission: USER_READ,
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
  ];

  // กรองเมนูตามสิทธิ์ของผู้ใช้
  return filterMenuItemsByPermission(items);
});

function filterMenuItemsByPermission(items: any) {
  // ตรวจสอบ permissions จาก user เพื่อ debug
  const authStore = useAuthStore();
  if (
    authStore.user?.permissions &&
    Array.isArray(authStore.user.permissions)
  ) {
    validateUserPermissions(authStore.user.permissions);
  }

  const filteredItems = items
    .map((item: any) => {
      // ถ้าเป็น logout ให้แสดงเสมอ
      if (item.key === "logout") {
        return item;
      }

      // ถ้าเป็น divider ให้แสดงเสมอ
      if (item.type === "divider") {
        return item;
      }

      // ถ้ามีการกำหนดสิทธิ์และไม่มีสิทธิ์ ไม่แสดงรายการนี้
      if (item.permission) {
        if (!hasPermission(item.permission)) {
          return null;
        }
      }

      // สำหรับรายการที่มี children
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children
          .map((child: any) => {
            if (child.type === "divider") {
              return child;
            }

            if (child.permission) {
              if (!hasPermission(child.permission)) {
                return null;
              }
            }
            // กรองลูกหลานซ้อนลึกลงไป
            if (child.children && child.children.length > 0) {
              const nestedChildren = child.children.filter(
                (nestedChild: any) =>
                  !nestedChild.permission ||
                  hasPermission(nestedChild.permission)
              );

              // ถ้าไม่มีลูกหลานที่มีสิทธิ์เข้าถึง ไม่แสดงเมนูนี้
              if (nestedChildren.length === 0) {
                return null;
              }

              return { ...child, children: nestedChildren };
            }

            return child;
          })
          .filter(Boolean); // กรองค่า null ออก

        // ถ้าไม่มี children ที่มีสิทธิ์เหลือ ไม่แสดงเมนูนี้
        if (filteredChildren.length === 0) {
          return null;
        }

        return { ...item, children: filteredChildren };
      }

      return item;
    })
    .filter(Boolean); // กรองค่า null ออก

  return filteredItems;
}
