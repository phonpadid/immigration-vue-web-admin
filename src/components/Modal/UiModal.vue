<script setup lang="ts">
import { Modal } from "ant-design-vue";
import { defineProps, defineEmits } from "vue";

interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverColor?: string;
  hoverBorderColor?: string;
}

interface CustomButton {
  text: string;
  type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
  props?: Record<string, any>;
  onClick?: () => void;
  style?: ButtonStyle;
}

interface Props {
  title?: string;
  visible: boolean;
  width?: number | string;
  centered?: boolean;
  closable?: boolean;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  okType?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
  okButtonProps?: Record<string, any>;
  cancelButtonProps?: Record<string, any>;
  destroyOnClose?: boolean;
  showOkButton?: boolean;
  showCancelButton?: boolean;
  customButtons?: CustomButton[];
  // เพิ่ม props สำหรับกำหนดสีของปุ่ม default
  okButtonStyle?: ButtonStyle;
  cancelButtonStyle?: ButtonStyle;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  visible: false,
  width: 520,
  centered: true,
  closable: true,
  confirmLoading: false,
  okText: "ຕົກລົງ",
  cancelText: "ຍົກເລີກ",
  okType: "primary",
  destroyOnClose: true,
  showOkButton: true,
  showCancelButton: true,
  customButtons: () => [],
  okButtonStyle: () => ({}),
  cancelButtonStyle: () => ({}),
});

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "ok"): void;
  (e: "cancel"): void;
  (e: "customClick", index: number): void;
}>();

const handleOk = () => {
  emit("ok");
};

const handleCancel = () => {
  emit("update:visible", false);
  emit("cancel");
};

const handleCustomClick = (index: number, callback?: () => void) => {
  if (callback) {
    callback();
  }
  emit("customClick", index);
};

// สร้าง style object สำหรับปุ่ม
const createButtonStyle = (style?: ButtonStyle) => {
  if (!style) return {};

  return {
    "--button-bg": style.backgroundColor,
    "--button-color": style.color,
    "--button-border-color": style.borderColor,
    "--button-hover-bg": style.hoverBackgroundColor,
    "--button-hover-color": style.hoverColor,
    "--button-hover-border-color": style.hoverBorderColor,
  };
};
</script>

<template>
  <Modal
    :title="title"
    :open="visible"
    :centered="centered"
    :closable="closable"
    :confirm-loading="confirmLoading"
    :width="width"
    :destroy-on-close="destroyOnClose"
    @cancel="handleCancel"
  >
    <slot></slot>
    <template #footer>
      <div v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
      <div v-else class="modal-footer">
        <!-- Custom Buttons -->
        <template v-for="(button, index) in customButtons" :key="index">
          <a-button
            :type="button.type || 'default'"
            v-bind="button.props"
            :style="createButtonStyle(button.style)"
            :class="['custom-button', `custom-button-${index}`]"
            @click="handleCustomClick(index, button.onClick)"
          >
            {{ button.text }}
          </a-button>
        </template>

        <!-- Default Buttons -->
        <a-button
          v-if="showCancelButton"
          v-bind="cancelButtonProps"
          :style="createButtonStyle(cancelButtonStyle)"
          class="cancel-button"
          @click="handleCancel"
        >
          {{ cancelText }}
        </a-button>
        <a-button
          v-if="showOkButton"
          :type="okType"
          v-bind="okButtonProps"
          :style="createButtonStyle(okButtonStyle)"
          :loading="confirmLoading"
          class="ok-button"
          @click="handleOk"
        >
          {{ okText }}
        </a-button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* สไตล์สำหรับปุ่มที่มีการกำหนดสี */
.custom-button,
.ok-button,
.cancel-button {
  background-color: var(--button-bg);
  color: var(--button-color);
  border-color: var(--button-border-color);
}

.custom-button:hover,
.ok-button:hover,
.cancel-button:hover {
  background-color: var(--button-hover-bg) !important;
  color: var(--button-hover-color) !important;
  border-color: var(--button-hover-border-color) !important;
}
</style>
