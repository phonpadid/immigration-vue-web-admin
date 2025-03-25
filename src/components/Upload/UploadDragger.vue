<script setup>
import { ref, defineEmits } from "vue";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";

const fileList = ref([]);
const previewImage = ref("");
const previewVisible = ref(false);
const emit = defineEmits(["onFileSelect"]);

const beforeUpload = (file) => {
  const isValidType = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/webp",
    "image/gif",
  ].includes(file.type);

  if (!isValidType) {
    message.error("You can only upload SVG, PNG, JPG, WebP, or GIF files!");
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
  <div class="flex justify-center  px-4">
    <div
      class="border-2 border-dashed border-gray-300 p-6 w-full max-w-4xl h-60 flex justify-center items-center bg-gray-50"
    >
      <a-upload
        v-model:file-list="fileList"
        :before-upload="beforeUpload"
        :show-upload-list="true"
        :custom-request="customUpload"
        list-type="picture-card"
        @preview="handlePreview"
      >
        <div
          v-if="fileList.length < 1"
          class="flex flex-col items-center gap-3"
        >
          <Icon
            icon="material-symbols:cloud-upload"
            class="text-6xl text-gray-500"
          />
          <span class="text-sm text-center">
            ຄິກເພື່ອອັບໂຫລດ ຫຼື ລາກວາງລົງ
          </span>
          <span class="text-xs text-gray-600">
            SVG, PNG, JPG, Webp, ຫຼື GIF (MAX. 300x300px)
          </span>
        </div>
      </a-upload>

      <a-modal v-model:visible="previewVisible" :footer="null">
        <img alt="preview" style="width: 100%" :src="previewImage" />
      </a-modal>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.ant-upload) {
  width: 840px !important;
  height: 180px !important;
}
::v-deep(.ant-upload-list-item) {
  min-width: 840px !important;
  height: 200px !important;
  transform: translateY(-45px);
}
</style>
