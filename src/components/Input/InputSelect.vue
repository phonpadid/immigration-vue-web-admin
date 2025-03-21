<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { PropType } from "vue";

defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: "",
  },
  options: {
    type: Array as PropType<{ label: string; value: string | number }[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Please select",
  },
  width: {
    type: String,
    default: "100%", // เปลี่ยนเป็น 100% เพื่อให้ตัว select กว้างเต็มพื้นที่ parent
  },
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "middle", // ค่าเริ่มต้นเป็น middle ตามมาตรฐาน Ant Design
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

function onChange(value: string | number) {
  emit("update:modelValue", value);
  emit("change", value); // เพิ่ม emit event change เพื่อให้สามารถใช้ @change ได้
}
</script>

<template>
  <a-select
    :value="modelValue"
    @change="onChange"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    allow-clear
  >
    <a-select-option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </a-select-option>
  </a-select>
</template>

<style scoped>
/* เพิ่ม CSS เพื่อให้มั่นใจว่า placeholder แสดงผลถูกต้อง */
:deep(.ant-select-selection-placeholder) {
  opacity: 0.6;
  color: #888;
}

/* ปรับขนาดตาม size */
:deep(.ant-select-lg) {
  font-size: 16px;
}
</style>
