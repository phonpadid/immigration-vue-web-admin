<template>
  <slot v-if="hasAccess"></slot>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { usePermissionStore } from "@/modules/users/permission/store/permission.store";

interface Permission {
  id: number;
  name: string;
  description: string;
  group_name: string;
  created_at: string;
}

export default defineComponent({
  name: "PermissionCheck",
  props: {
    permission: {
      type: String,
      default: null,
    },
    permissions: {
      type: Array as () => string[],
      default: () => [],
    },
    requireAll: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const permissionStore = usePermissionStore();

    const hasAccess = computed(() => {
      // ถ้าไม่มีการระบุ permission ใดๆ ให้แสดงเนื้อหา
      if (!props.permission && props.permissions.length === 0) {
        return true;
      }

      const userPermissions = permissionStore.permissions || [];

      // สร้าง array ของ permission names สำหรับการตรวจสอบ
      const userPermissionNames = userPermissions.map(
        (p: Permission) => p.name
      );

      // ตรวจสอบ permission เดี่ยว
      if (props.permission) {
        return userPermissionNames.includes(props.permission);
      }

      // ตรวจสอบหลาย permissions
      if (props.requireAll) {
        // ต้องมีทุก permission ที่กำหนด
        return props.permissions.every((p) => userPermissionNames.includes(p));
      } else {
        // ต้องมีอย่างน้อยหนึ่ง permission ที่กำหนด
        return props.permissions.some((p) => userPermissionNames.includes(p));
      }
    });

    return {
      hasAccess,
    };
  },
});
</script>
