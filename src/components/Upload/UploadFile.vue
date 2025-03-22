<script setup>
import { ref, defineEmits } from "vue";
import { message } from "ant-design-vue";

const fileList = ref([]);
const previewImage = ref("");
const previewVisible = ref(false);
const emit = defineEmits(["onFileSelect"]);

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG files!");
    return false;
  }
  return true;
};

const customUpload = (options) => {
  const { file, onSuccess, onError } = options;

  setTimeout(() => {
    if (file) {
      file.url = URL.createObjectURL(file);
      fileList.value = [file];
      emit("onFileSelect", file);
      onSuccess("ok");
    } else {
      onError("Upload failed");
    }
  }, 500);
};

const handlePreview = (file) => {
  previewImage.value = file.url || file.thumbUrl;
  previewVisible.value = true;
};
</script>

<template>
  <div>
    <a-upload
      v-model:file-list="fileList"
      :before-upload="beforeUpload"
      :show-upload-list="true"
      :custom-request="customUpload"
      list-type="picture-card"
      @preview="handlePreview"
    >
      <div v-if="fileList.length < 1">
        <div class="text-4xl flex flex-col">
          +
          <span class="text-[12px]">ອັບໂຫລດ</span>
        </div>
      </div>
    </a-upload>

    <a-modal v-model:visible="previewVisible" :footer="null">
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>
