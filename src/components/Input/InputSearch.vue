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
  emit("input", value);
};

const handleSearch = (value: string) => {
  emit("search", value);
};
</script>

<template>
  <a-input
    :value="modelValue"
    @input="handleInput"
    @search="handleSearch"
    :placeholder="placeholder"
    :style="{ width }"
    :size="size"
    allow-clear
    v-bind="$attrs"
  >
    <template #prefix>
      <SearchOutlined />
    </template>
  </a-input>
</template>

<style scoped>
:deep(.ant-input-search) {
  width: 100%;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 6px;
}

:deep(.ant-input-search-button) {
  height: 100%;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

:deep(.anticon) {
  color: #bfbfbf;
}
</style>
