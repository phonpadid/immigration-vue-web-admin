<template>
  <a-button
    :type="type"
    :size="size"
    :block="block"
    :disabled="disabled"
    :class="customClass"
  >
    <slot></slot>
  </a-button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "default",
  },
  size: {
    type: String,
    default: "middle",
  },
  colorClass: {
    type: String,
    default: "",
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const customClass = computed(() => props.colorClass);
</script>
