<script setup lang="ts">
import { defineProps, computed } from "vue";
import { Avatar } from "ant-design-vue";
import { Icon } from "@iconify/vue";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: number;
  fallbackText?: string;
  icon?: string;
};

const props = defineProps<AvatarProps>();
const showIcon = computed(() => !props.src && props.icon);
</script>

<template>
  <Avatar
    :size="size || 64"
    :src="src"
    :alt="alt || 'Avatar'"
    class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
  >
    <template v-if="showIcon">
      <Icon
        :icon="icon || 'mdi:user-circle'"
        :width="size"
        :height="size"
        class="text-gray-800 dark:text-gray-200"
      />
    </template>
    <template v-else-if="!src">{{ fallbackText }}</template>
  </Avatar>
</template>
