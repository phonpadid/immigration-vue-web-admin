<!-- filepath: e:\immigration-web-admin-vue\immigration-vue-web-admin\src\components\Permission\HasPermission.vue -->
<script setup>
import { useAuthStore } from "@/lib/stores/auth.store";
import { computed } from "vue";

const props = defineProps({
  permission: {
    type: [String, Array],
    required: true,
  },
  requireAll: {
    type: Boolean,
    default: false,
  },
  not: {
    type: Boolean,
    default: false,
  },
  // เพิ่มคุณสมบัติ showFallback
  showFallback: {
    type: Boolean,
    default: false,
  },
});

const authStore = useAuthStore();

const hasPermission = computed(() => {
  if (Array.isArray(props.permission)) {
    return props.requireAll
      ? authStore.hasAllPermissions(props.permission)
      : authStore.hasAnyPermission(props.permission);
  }

  return authStore.hasPermission(props.permission);
});

// ถ้า not=true แสดงเมื่อไม่มีสิทธิ์, ถ้า not=false แสดงเมื่อมีสิทธิ์
const shouldRender = computed(() =>
  props.not ? !hasPermission.value : hasPermission.value
);
</script>

<template>
  <!-- แสดงเนื้อหาหลักเมื่อเงื่อนไขเป็นจริง -->
  <template v-if="shouldRender">
    <slot></slot>
  </template>

  <!-- แสดงเนื้อหาทางเลือกเมื่อเงื่อนไขเป็นเท็จและต้องการแสดง fallback -->
  <template v-else-if="showFallback">
    <slot name="fallback">
      <!-- เนื้อหาเริ่มต้นเมื่อไม่มี fallback slot -->
      <div class="text-gray-400 opacity-70">
        <slot name="fallback-text">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງ</slot>
      </div>
    </slot>
  </template>
</template>
