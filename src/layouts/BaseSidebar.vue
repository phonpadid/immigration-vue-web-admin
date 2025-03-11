<!-- <script setup lang="ts">
import { onMounted, ref } from "vue";
import { menuItems } from "./menu";
import { useRouter } from "vue-router";
import type { ItemType } from "./interfaces/menu.interface";

defineProps<{ toggle: boolean }>();

const { push } = useRouter();

const selectedKeys = ref<string[]>([""]);
const openKeys = ref<string[]>([""]);

const persistUserRoles = ref<string[]>([]);
try {
  persistUserRoles.value = JSON.parse(
    localStorage.getItem("hal_pay_role_user") || "[]"
  );
} catch (e) {
  console.error("Failed to parse user roles from storage: ", e);
}

function filterRoleAndRemoveRolesProperty(items: ItemType[]): ItemType[] {
  return items
    .filter(
      (item) =>
        !item.role ||
        item.role.some((role) => persistUserRoles.value.includes(role))
    )
    .map(({ role, children, ...rest }) => ({
      ...rest,
      ...(children
        ? { children: filterRoleAndRemoveRolesProperty(children) }
        : {}),
    }));
}

menuItems.forEach((group) => {
  if (group.children) {
    group.children = filterRoleAndRemoveRolesProperty(group.children);
  }
});

function handleClick({ key, keyPath }: { key: string; keyPath: string }) {
  localStorage.setItem("menuKey", JSON.stringify(key));
  localStorage.setItem("subMenuKey", JSON.stringify(keyPath[0]));
  push({ name: key });
}

onMounted(() => {
  const menuKey = localStorage.getItem("menuKey");
  const subMenuKey = localStorage.getItem("subMenuKey");

  selectedKeys.value.push(menuKey ? JSON.parse(menuKey) : "dashboard");
  openKeys.value.push(subMenuKey ? JSON.parse(subMenuKey) : "");
});
</script>
<template>
  <nav
    class="fixed top-0 left-0 z-50 w-0 h-full overflow-hidden overflow-y-auto transition-all bg-white whitespace-nowrap"
    :class="{ 'w-[256px] border': toggle }"
  >
    <div class="flex flex-row items-center gap-2 mt-4 ml-4">
      <img src="/public/logo.webp" alt="logo" class="w-12 h-16 mb-2" />
      <span class="text-2xl font-bold">DOI LPDR</span>
    </div>
    <div class="mt-4">
      <a-menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        @click="handleClick"
      />
    </div>
  </nav>
</template>

<style lang="scss">
:where(.css-dev-only-do-not-override-16pw25h).ant-menu-light
  .ant-menu-item-selected {
  color: red !important;
}
</style> -->
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { menuItems } from "./menu";
import { useRouter } from "vue-router";
import type { ItemType } from "./interfaces/menu.interface";

defineProps<{ toggle: boolean }>();

const { push } = useRouter();

const selectedKeys = ref<string[]>([""]);
const openKeys = ref<string[]>([""]);
const persistUserRoles = ref<string[]>([]);

// ดึงค่า Dark Mode จาก Local Storage
const isDarkMode = ref(localStorage.getItem("theme") === "dark");

try {
  persistUserRoles.value = JSON.parse(
    localStorage.getItem("hal_pay_role_user") || "[]"
  );
} catch (e) {
  console.error("Failed to parse user roles from storage: ", e);
}

function filterRoleAndRemoveRolesProperty(items: ItemType[]): ItemType[] {
  return items
    .filter(
      (item) =>
        !item.role ||
        item.role.some((role) => persistUserRoles.value.includes(role))
    )
    .map(({ role, children, ...rest }) => ({
      ...rest,
      ...(children
        ? { children: filterRoleAndRemoveRolesProperty(children) }
        : {}),
    }));
}

menuItems.forEach((group) => {
  if (group.children) {
    group.children = filterRoleAndRemoveRolesProperty(group.children);
  }
});

function handleClick({ key, keyPath }: { key: string; keyPath: string }) {
  localStorage.setItem("menuKey", JSON.stringify(key));
  localStorage.setItem("subMenuKey", JSON.stringify(keyPath[0]));
  push({ name: key });
}

// ตรวจสอบค่า Theme ตอนโหลด
onMounted(() => {
  const menuKey = localStorage.getItem("menuKey");
  const subMenuKey = localStorage.getItem("subMenuKey");

  selectedKeys.value.push(menuKey ? JSON.parse(menuKey) : "dashboard");
  openKeys.value.push(subMenuKey ? JSON.parse(subMenuKey) : "");
});

// ติดตามการเปลี่ยนแปลงของ Dark Mode
watchEffect(() => {
  isDarkMode.value = localStorage.getItem("theme") === "dark";
});
</script>

<template>
  <nav
    class="fixed top-0 left-0 z-50 w-0 h-full overflow-hidden overflow-y-auto transition-all bg-white dark:bg-gray-900 text-black dark:text-white whitespace-nowrap"
    :class="{ 'w-[256px] border dark:border-gray-700': toggle }"
  >
    <div class="flex flex-row items-center gap-2 mt-4 ml-4">
      <img src="/public/logo.webp" alt="logo" class="w-12 h-16 mb-2" />
      <span class="text-2xl font-bold">DOI LPDR</span>
    </div>
    <div class="mt-4">
      <a-menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        class="dark:bg-gray-800 dark:text-white"
        @click="handleClick"
      />
    </div>
  </nav>
</template>

<style lang="scss">
:where(.css-dev-only-do-not-override-16pw25h).ant-menu-light
  .ant-menu-item-selected {
  color: red !important;
}

/* สำหรับ Dark Mode */
:where(.css-dev-only-do-not-override-16pw25h).ant-menu-dark
  .ant-menu-item-selected {
  color: #ff9800 !important; /* สีไอเทมที่เลือกใน Dark Mode */
}
</style>
