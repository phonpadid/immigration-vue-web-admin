<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { PropType } from "vue";

defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: null, // Default value set to null
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
    default: "100%",
  },
  size: {
    type: String as PropType<"large" | "middle" | "small">,
    default: "middle",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

function onChange(value: string | number) {
  emit("update:modelValue", value);
  emit("change", value);
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
    :dropdown-match-select-width="false"
  >
    <a-select-option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :title="option.label"
    >
      {{ option.label }}
    </a-select-option>
  </a-select>
</template>

<style scoped>
/* ปรับแต่ง dropdown ให้กว้างขึ้น และรองรับข้อความยาว */
:deep(.ant-select-dropdown) {
  min-width: 200px !important;
  max-width: 400px !important;
}

/* ปรับแต่งตัวเลือกให้แสดงข้อความยาวได้ */
:deep(.ant-select-item) {
  white-space: normal !important;
  height: auto !important;
  padding: 8px 12px !important;
}

:deep(.ant-select-item-option-content) {
  white-space: normal !important;
  word-break: break-word !important;
  line-height: 1.4 !important;
}

/* สำหรับตัว select เมื่อเลือกแล้ว */
:deep(.ant-select-selection-item) {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* เพิ่ม hover effect */
:deep(.ant-select-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* ปรับความสูงของแต่ละ option ให้พอดีกับเนื้อหา */
:deep(.ant-select-item-option) {
  min-height: 32px;
  height: auto !important;
}
</style>
