<script setup lang="ts">
import {
  BulbOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  CarOutlined,
  EnvironmentOutlined
} from "@ant-design/icons-vue";

const props = defineProps<{
  purpose: string;
  size?: string;
}>();

const getIcon = () => {
  switch (props.purpose) {
    case 'business':
      return BulbOutlined;
    case 'diplomatic':
      return FlagOutlined;
    case 'official':
      return CheckCircleOutlined;
    case 'tourism':
      return CameraOutlined;
    case 'transit':
      return CarOutlined;
    case 'visit':
      return EnvironmentOutlined;
    default:
      return CheckCircleOutlined;
  }
};
</script>

<template>
  <component :is="getIcon()" :style="{ fontSize: size || '1rem' }" />
</template>