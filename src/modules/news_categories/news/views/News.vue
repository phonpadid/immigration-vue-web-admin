<script setup lang="ts">
import UploadDragger from "@/components/Upload/UploadDragger.vue";
import { ref } from "vue";

const uploadedFiles = ref<any[]>([]); // Ensure it's always an array

const handleUploadChange = (fileList: any) => {
  console.log("Upload File:", fileList);
  uploadedFiles.value = Array.isArray(fileList) ? fileList : [];
};
</script>

<template>
  <div class="flex justify-center min-h-screen mt-12">
    <div
      class="border-2 border-dashed border-gray-300 p-6 w-full h-60 flex justify-center items-center bg-gray-50"
    >
      <UploadDragger
        v-model:file-list="uploadedFiles"
        @change="handleUploadChange"
        class="w-full h-full"
      />
    </div>
  </div>
</template>
