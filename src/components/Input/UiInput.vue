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
const emit = defineEmits(["update:modelValue"]);

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const computedClass = computed(() => `w-full ${props.className || ""}`);
</script>

<template>
  <a-input
    :value="modelValue"
    :placeholder="placeholder"
    :type="type"
    :size="size"
    :disabled="disabled"
    :allow-clear="allowClear"
    @input="updateValue"
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
