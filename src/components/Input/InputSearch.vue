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

const emit = defineEmits(["update:modelValue", "input", "search"]);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    emit("search", props.modelValue);
  }
};

const handleClear = () => {
  emit("update:modelValue", "");
  emit("search", "");
};
</script>

<template>
  <a-input-search
    :value="modelValue"
    @input="handleInput"
    @keydown="handleKeyDown"
    @clear="handleClear"
    @search="(value:any) => emit('search', value)"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    allow-clear
    :enter-button="false"
  >
    <template #prefix>
      <SearchOutlined />
    </template>
  </a-input-search>
</template>

<style scoped>
:deep(.ant-input-search) {
  width: 100%;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

:deep(.ant-input-search-button) {
  display: none; /* ซ่อนปุ่มค้นหา */
}

:deep(.anticon) {
  color: #bfbfbf;
}

:deep(.ant-input-affix-wrapper:hover .anticon) {
  color: var(--ant-primary-color);
}

:deep(.ant-input-affix-wrapper-focused .anticon) {
  color: var(--ant-primary-color);
}
</style>
