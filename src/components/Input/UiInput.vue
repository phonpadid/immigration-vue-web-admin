<script setup lang="ts">
import { computed, defineProps, defineEmits } from "vue";

interface UiInputProps {
  modelValue: string | number;
  placeholder?: string;
  type?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  allowClear?: boolean;
  prefixIcon?: string;
  suffixIcon?: string;
  className?: string;
}

const props = defineProps<UiInputProps>();
const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const computedClass = computed(() => `w-full ${props.className || ""}`);

const handleChange = (e: any) => {
  const value = typeof e === "object" && e.target ? e.target.value : e;
  emit("update:modelValue", value);
};
</script>

<template>
  <a-input
    :value="modelValue"
    :placeholder="placeholder"
    :type="type"
    :size="size"
    :disabled="disabled"
    :allow-clear="allowClear"
    @update:value="handleChange"
    :class="computedClass"
  >
    <template v-if="prefixIcon" #prefix>
      <span :class="prefixIcon"></span>
    </template>
    <template v-if="suffixIcon" #suffix>
      <span :class="suffixIcon"></span>
    </template>
  </a-input>
</template>
