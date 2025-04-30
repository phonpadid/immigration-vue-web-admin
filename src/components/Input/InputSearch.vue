<script setup lang="ts">
import { defineProps, defineEmits, type PropType } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search",
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

const emit = defineEmits(["update:modelValue", "input", "search", "clear"]);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", value);
  emit("input", value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    emit("search", props.modelValue);
  }
};

// เพิ่มฟังก์ชันสำหรับจัดการการ clear
const handleClear = () => {
  emit("update:modelValue", "");
  emit("clear");
  emit("search", ""); // ส่ง empty string เพื่อ reset การค้นหา
};
</script>

<template>
  <a-input
    :value="modelValue"
    @input="handleInput"
    @keydown="handleKeyDown"
    @clear="handleClear"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    allow-clear
  >
    <template #prefix>
      <SearchOutlined />
    </template>
  </a-input>
</template>
