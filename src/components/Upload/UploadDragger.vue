<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { message, type UploadProps, type UploadFile } from "ant-design-vue";
import type { UploadChangeParam } from "ant-design-vue/es/upload";
import { Icon } from "@iconify/vue";

const fileList = ref<UploadFile[]>([]); // กำหนดชนิดของ fileList เป็น UploadFile[] ซึ่งรองรับ url

const emit = defineEmits(["update:fileList", "change"]);

const beforeUpload = (file: File) => {
  const isAllowedType = ["image/jpeg", "image/png", "image/gif"].includes(
    file.type
  );
  const isLt2M = file.size / 1024 / 1024 < 100;

  if (!isAllowedType) {
    message.error("คุณสามารถอัปโหลดไฟล์รูปภาพเท่านั้น!");
    return false;
  }
  if (!isLt2M) {
    message.error("ขนาดไฟล์ต้องไม่เกิน 100MB!");
    return false;
  }
  return true;
};

const handleChange = (info: UploadChangeParam) => {
  fileList.value = [...(info.fileList || [])]; // ให้แน่ใจว่าเป็น Array
  emit("update:fileList", fileList.value);
  emit("change", info);

  if (info.file.status === "done") {
    message.success(`${info.file.name} อัปโหลดสำเร็จ!`);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} อัปโหลดล้มเหลว!`);
  }
};
</script>

<template>
  <a-upload-dragger
    v-model:file-list="fileList"
    name="file"
    :multiple="true"
    :before-upload="beforeUpload"
    :show-upload-list="false"
  >
    <div class="flex flex-col items-center justify-center">
      <Icon
        icon="material-symbols:cloud-upload"
        width="48"
        height="48"
        color="#1890ff"
      />
      <p class="ant-upload-text">ຄິກເພື່ອອັບໂຫລດ ຫຼື ລາກວາງລົງ</p>
      <p class="ant-upload-hint">SVG,PNG,JPG,Webp,ຫຼື GIF(MAX. 300x300px)</p>
    </div>

    <div v-for="file in fileList" :key="file.uid" class="mt-4">
      <img
        v-if="file.status === 'done' && (file.response?.url || file.url)"
        :src="file.response?.url || file.url"
        alt="Preview"
        class="w-32 h-32 object-cover rounded"
      />
    </div>
  </a-upload-dragger>
</template>
