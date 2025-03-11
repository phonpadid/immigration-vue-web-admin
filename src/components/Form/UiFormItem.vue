<script setup lang="ts">
import { defineProps } from "vue";
import { type FormItemProps } from "ant-design-vue";

defineProps<{
  label?: string;
  name?: string;
  rules?: FormItemProps["rules"];
}>();
</script>

<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <slot />
  </a-form-item>
</template>
