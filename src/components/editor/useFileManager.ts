// composables/useFileManager.ts
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import { api } from "@/lib/axios";
import { Icon } from "@iconify/vue";
import { h } from "vue";
import type { FileItem, FileUploadResponse } from "../editor/editor.types";
import { Modal } from "ant-design-vue";

export const useFileManager = () => {
  const files = ref<FileItem[]>([]);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const selectedFile = ref<FileItem | null>(null);
  const searchQuery = ref("");

  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "https://api.immigration.gov.la";

  const filteredFiles = computed(() => {
    if (!searchQuery.value) return files.value;

    return files.value.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const getFileUrl = (fileName: string): string => {
    const url = `${apiBaseUrl}/editor/${fileName}`;
    // console.log("Image URL:", url);
    return url;
  };

  // composables/useFileManager.ts
  const fetchFiles = async () => {
    try {
      isLoading.value = true;
      // console.log("1. Starting fetchFiles...");

      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const response = await api.get("/file-and-directory", {
        params: { parent_id: 0 },
        headers: {
          Date: currentDate,
          "User-Login": "phonpadid",
        },
      });

      // console.log("3. Raw API Response:", response);
      // console.log("4. Response data:", response.data);

      // แก้ไขตรงนี้: response.data เป็น array อยู่แล้ว ไม่ต้องเข้าถึง .files
      if (Array.isArray(response.data)) {
        files.value = response.data;
        // console.log("5. Files array updated:", files.value);
      } else {
        // console.warn("5a. Response is not an array:", response.data);
        files.value = [];
      }

      return files.value;
    } catch (error) {
      // console.error("Error in fetchFiles:", error);
      message.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ");
      throw error;
    } finally {
      isLoading.value = false;
      // console.log("6. Final files value:", files.value);
    }
  };

  const uploadFile = async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
      isUploading.value = true;
      const { data } = await api.post("/file-and-directory/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Date: currentDate,
          "User-Login": "phonpadid",
        },
      });

      await fetchFiles();
      return data;
    } finally {
      isUploading.value = false;
    }
  };

  // เพิ่ม function สำหรับ debug
  const debugApiConnection = async () => {
    try {
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const response = await api.get("/file-and-directory", {
        params: { parent_id: 0 },
        headers: {
          Date: currentDate,
          "User-Login": "phonpadid",
        },
      });
      // console.log("Debug API Response:", response);
      return response;
    } catch (error) {
      // console.error("Debug API Error:", error);
      throw error;
    }
  };

  // ส่วนที่เหลือของโค้ดคงเดิม...
  const isImageFile = (file: FileItem): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    return imageExtensions.includes(ext);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const deleteFile = async (fileId: number): Promise<void> => {
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
      await api.delete(`/file-and-directory/${fileId}/file`, {
        headers: {
          Date: currentDate,
          "User-Login": "phonpadid",
        },
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    try {
      // Show confirmation dialog
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: "ຢືນຢັນການລຶບ",
          content: `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການນີ້?`,
          okText: "ແມ່ນແລ້ວ,ຂ້ອຍແນ່ໃຈ",
          okType: "danger",
          cancelText: "ບໍ່,ຍົກເລີກ",
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!confirmed) return;

      message.loading({ content: "ກຳລັງລົບໄຟລ໌...", key: "deleteFile" });

      await deleteFile(file.id);
      await fetchFiles();

      message.success({ content: "ລົບໄຟລ໌ສຳເລັດ", key: "deleteFile" });

      // If the deleted file was selected, clear the selection
      if (selectedFile.value?.id === file.id) {
        selectedFile.value = null;
      }
    } catch (error) {
      console.error("Error in handleDeleteFile:", error);
      message.error({
        content: "ເກີດຂໍ້ຜິດພາດໃນການລົບໄຟລ໌",
        key: "deleteFile",
      });
    }
  };

  return {
    files,
    filteredFiles,
    isLoading,
    isUploading,
    selectedFile,
    searchQuery,
    getFileUrl,
    fetchFiles,
    uploadFile,
    isImageFile,
    formatFileSize,
    debugApiConnection,
    handleDeleteFile,
  };
};
