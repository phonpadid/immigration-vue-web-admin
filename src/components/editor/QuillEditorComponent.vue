<template>
  <div>
    <QuillEditor v-model:content="content" :theme="theme" :toolbar="toolbar" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const props = defineProps({
  modelValue: String,
  theme: {
    type: String as () => "" | "snow" | "bubble" | undefined,
    default: "snow",
  },
  toolbar: {
    type: Array as () => (string | object)[][],
    default: () => [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
    ],
  },
});

const emit = defineEmits(["update:modelValue"]);

const content = ref(props.modelValue);

const updateContent = (newValue: string) => {
  content.value = newValue;
  emit("update:modelValue", newValue);
};
</script>
