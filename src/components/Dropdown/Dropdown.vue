<script setup lang="ts">
import { defineProps, defineEmits, h } from "vue";
import { Dropdown, Menu } from "ant-design-vue";
import type { MenuProps, DropdownProps } from "ant-design-vue";

interface Option {
  key: string;
  label: string;
}

const props = defineProps<{
  options: Option[];
  trigger?: DropdownProps["trigger"];
  placement?: DropdownProps["placement"];
}>();

const emit = defineEmits<{
  (event: "select", key: string): void;
}>();

const handleMenuClick: MenuProps["onClick"] = (info) => {
  emit("select", info.key as string);
};

const renderMenu = () => {
  return h(Menu, { onClick: handleMenuClick }, () =>
    props.options.map((option) =>
      h(Menu.Item, { key: option.key }, () => option.label)
    )
  );
};
</script>

<template>
  <Dropdown :trigger="props.trigger" :placement="props.placement">
    <slot />
    <template #overlay>
      <renderMenu />
    </template>
  </Dropdown>
</template>
