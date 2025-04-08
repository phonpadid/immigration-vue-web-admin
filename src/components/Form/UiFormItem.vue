<script setup lang="ts">
import { defineProps } from "vue";
import type { RuleObject } from "ant-design-vue/es/form";

// Update the props to accept string or string[] for name
defineProps<{
  label?: string;
  name?: string | string[];
  rules?: RuleObject | RuleObject[];
}>();
</script>

<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <slot />
  </a-form-item>
</template>
