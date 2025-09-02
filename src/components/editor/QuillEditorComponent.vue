<script setup lang="ts">
import { ref, watch, onMounted, nextTick, onBeforeUnmount } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { message } from "ant-design-vue";
import { Modal } from "ant-design-vue";
import {
  UploadOutlined,
  FileImageOutlined,
  InboxOutlined,
} from "@ant-design/icons-vue";
import { useFileManager } from "../editor/useFileManager";
import type {
  EditorProps,
  FileItem,
  QuillContent,
} from "../editor/editor.types";
import { Icon } from "@iconify/vue";

interface DocumentContent {
  type: "doc";
  content: Array<{
    type: string;
    attrs?: {
      textAlign?: string;
      src?: string;
      alt?: string;
      title?: null;
    };
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}
// Props
const props = withDefaults(defineProps<EditorProps>(), {
  theme: "snow",
  placeholder: "",
  readonly: false,
  height: 500,
});
const {
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
  handleDeleteFile,
} = useFileManager();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

let quillInstance: any = null;
const editorContent = ref<QuillContent | null>(null);
const fileManagerVisible = ref(false);
const loadedImages = ref(new Set<number>());
// Toolbar Configuration
const toolbarOptions = {
  container: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
  handlers: {
    image: () => {
      fileManagerVisible.value = true;
      fetchFiles();
    },
  },
};

const quillConfig = {
  theme: "snow",
  modules: {
    toolbar: toolbarOptions,
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: function () {
            return true;
          },
        },
      },
    },
  },
};
//onEditorReady
let isUpdating = false;
const onTextChange = () => {
  if (!quillInstance || isUpdating) return;

  isUpdating = true;
  const currentSelection = quillInstance.getSelection();
  const content = quillInstance.getContents();
  const formattedContent: DocumentContent = {
    type: "doc",
    content: [],
  };

  if (content.ops) {
    // ใช้ตัวแปรนี้เพื่อเก็บ paragraph ปัจจุบันที่กำลังสร้าง
    let currentParagraphContent: any[] = [];

    content.ops.forEach((op: any, index: number) => {
      // ตรวจสอบว่าเป็นข้อความ
      if (typeof op.insert === "string") {
        const lines = op.insert.split("\n");
        lines.forEach((line: string, lineIndex: number) => {
          if (line) {
            const textNode: any = {
              type: "text",
              text: line,
            };
            if (op.attributes?.link) {
              textNode.marks = [
                {
                  type: "link",
                  attrs: { href: op.attributes.link },
                },
              ];
            }
            currentParagraphContent.push(textNode);
          }

          // ถ้าไม่ใช่บรรทัดสุดท้ายของ op นี้ และมีข้อความอยู่
          if (
            lineIndex < lines.length - 1 &&
            currentParagraphContent.length > 0
          ) {
            // สร้าง paragraph จาก content ที่สะสมไว้
            formattedContent.content.push({
              type: "paragraph",
              attrs: { textAlign: "left" },
              content: currentParagraphContent,
            });
            // รีเซ็ตเพื่อเริ่ม paragraph ใหม่
            currentParagraphContent = [];
          }
        });
      } else if (op.insert?.image) {
        // ถ้ามี paragraph ค้างอยู่ ให้ปิดก่อน
        if (currentParagraphContent.length > 0) {
          formattedContent.content.push({
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: currentParagraphContent,
          });
          currentParagraphContent = [];
        }
        // เพิ่ม image node
        formattedContent.content.push({
          type: "image",
          attrs: {
            src: op.insert.image,
            alt: op.insert.image,
            title: null,
          },
        });
      }
    });

    // เพิ่ม paragraph สุดท้ายที่อาจจะค้างอยู่
    if (currentParagraphContent.length > 0) {
      formattedContent.content.push({
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: currentParagraphContent,
      });
    }
  }

  emit("update:modelValue", JSON.stringify(formattedContent));

  nextTick(() => {
    if (currentSelection) {
      quillInstance.setSelection(
        currentSelection.index,
        currentSelection.length
      );
    }
    isUpdating = false;
  });
};
const onEditorReady = (quill: any) => {
  quillInstance = quill;
  isUpdating = true; // ป้องกันการอัปเดตซ้ำซ้อน

  if (props.modelValue) {
    try {
      const content =
        typeof props.modelValue === "string"
          ? JSON.parse(props.modelValue)
          : props.modelValue;

      const delta = {
        ops: [] as any[],
      };

      if (content.type === "doc" && Array.isArray(content.content)) {
        content.content.forEach((node: any) => {
          if (node.type === "paragraph" && node.content) {
            node.content.forEach((textNode: any) => {
              if (textNode.type === "text" && textNode.text) {
                const attributes: any = {};
                // ตรวจสอบ marks สำหรับ link
                if (Array.isArray(textNode.marks)) {
                  const linkMark = textNode.marks.find(
                    (mark: any) => mark.type === "link"
                  );
                  if (linkMark && linkMark.attrs?.href) {
                    attributes.link = linkMark.attrs.href;
                  }
                }
                delta.ops.push({
                  insert: textNode.text,
                  attributes: attributes,
                });
              }
            });
            // เพิ่มบรรทัดใหม่เมื่อจบ paragraph
            delta.ops.push({ insert: "\n" });
          } else if (node.type === "image" && node.attrs?.src) {
            delta.ops.push(
              {
                insert: {
                  image: node.attrs.src,
                },
              },
              { insert: "\n" }
            );
          }
        });
      }

      const selection = quillInstance.getSelection();
      quillInstance.setContents(delta);
      nextTick(() => {
        if (selection) {
          quillInstance.setSelection(selection);
        }
        isUpdating = false;
      });
    } catch (e) {
      console.error("Error setting initial content:", e);
      isUpdating = false;
    }
  } else {
    isUpdating = false;
  }
};

const lastClickTime = ref(0);
const DOUBLE_CLICK_DELAY = 300; // 300ms

const handleFileClick = (file: FileItem) => {
  const currentTime = new Date().getTime();

  if (currentTime - lastClickTime.value < DOUBLE_CLICK_DELAY) {
    // Double click detected
    handleInsertImage();
  } else {
    // Single click
    selectedFile.value = file;
  }

  lastClickTime.value = currentTime;
};

const handleImageError = (event: Event, fileId: number) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.style.display = "none";
  loadedImages.value.delete(fileId);
};

const handleUpload = async ({ file, onSuccess, onError }: any) => {
  try {
    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("ຂະໜາດຮູບພາບໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)");
    }

    const response = await uploadFile(file);
    onSuccess(response);
    message.success("ອັບໂຫລດຮູບພາບສຳເລັດ");
  } catch (error: any) {
    onError(error);
    message.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດ");
  }
};

const handleInsertImage = () => {
  if (!selectedFile.value || !quillInstance || isUpdating) return;

  isUpdating = true;
  const fileUrl = getFileUrl(selectedFile.value.name);
  const range = quillInstance.getSelection(true);
  const currentPosition = range ? range.index : 0;

  // แทรกรูปภาพที่ตำแหน่งปัจจุบัน
  quillInstance.insertEmbed(currentPosition, "image", fileUrl);
  quillInstance.insertText(currentPosition + 1, "\n");

  // อัพเดท content
  const content = quillInstance.getContents();
  const formattedContent: DocumentContent = {
    type: "doc",
    content: [],
  };

  if (content.ops) {
    content.ops.forEach((op: any) => {
      if (typeof op.insert === "string") {
        const lines = op.insert.split("\n");
        lines.forEach((line: string) => {
          formattedContent.content.push({
            type: "paragraph",
            attrs: {
              textAlign: "left",
            },
            content: [
              {
                type: "text",
                text: line || " ",
              },
            ],
          });
        });
      } else if (op.insert?.image) {
        formattedContent.content.push({
          type: "image",
          attrs: {
            src: op.insert.image,
            alt: op.insert.image,
            title: null,
          },
        });
      }
    });
  }

  emit("update:modelValue", JSON.stringify(formattedContent));

  nextTick(() => {
    quillInstance.setSelection(currentPosition + 2, 0);
    isUpdating = false;
    handleCloseModal();
    message.success("ເພີ່ມຮູບພາບສຳເລັດ");
  });
};
const handleCloseModal = () => {
  fileManagerVisible.value = false;
  selectedFile.value = null;
  searchQuery.value = "";
};
// ปรับปรุง watch
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal || !quillInstance || isUpdating) return;

    try {
      isUpdating = true;
      const parsedContent = JSON.parse(newVal);

      if (parsedContent.type === "doc") {
        const delta = { ops: [] as any[] };

        parsedContent.content.forEach((node: any) => {
          if (node.type === "paragraph" && node.content) {
            // รวมข้อความจากทุก text node ในย่อหน้า
            const text = node.content
              .filter((content: any) => content.type === "text")
              .map((content: any) => content.text)
              .join("");

            // เพิ่มข้อความและ new line
            delta.ops.push(
              { insert: text || " " }, // ใช้ space สำหรับย่อหน้าว่าง
              { insert: "\n" }
            );
          } else if (node.type === "image" && node.attrs?.src) {
            delta.ops.push(
              {
                insert: {
                  image: node.attrs.src,
                },
              },
              { insert: "\n" }
            );
          }
        });

        const currentSelection = quillInstance.getSelection();
        quillInstance.setContents(delta);

        nextTick(() => {
          if (currentSelection) {
            quillInstance.setSelection(
              currentSelection.index,
              currentSelection.length
            );
          }
          isUpdating = false;
        });
      }
    } catch (e) {
      console.error("Error parsing content:", e);
      isUpdating = false;
    }
  },
  { immediate: true }
);
// เพิ่ม cleanup
onBeforeUnmount(() => {
  isUpdating = false;
});
onMounted(async () => {
  // console.log("A. Component mounting...");

  try {
    const fetchedFiles = await fetchFiles();
    // console.log("B. Fetched files:", fetchedFiles);

    // ตรวจสอบข้อมูลที่ได้
    if (fetchedFiles && fetchedFiles.length > 0) {
      // console.log("C. Files loaded successfully");
      // console.log("Sample file:", fetchedFiles[0]);
    } else {
      // console.log("C. No files found");
    }
  } catch (error) {
    // console.error("Error loading files:", error);
    message.error("ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ");
  }
});
</script>
<template>
  <div class="editor-container" :class="{ 'has-error': props.error }">
    <!-- Editor -->
    <QuillEditor
      :content="quillInstance?.getContents()"
      :theme="props.theme"
      :placeholder="props.placeholder"
      :readonly="props.readonly"
      :toolbar="toolbarOptions"
      @ready="onEditorReady"
      @text-change="onTextChange"
      contentType="delta"
      :style="{ height: `${props.height}px` }"
    />
    <!-- Error Message -->
    <div v-if="props.error" class="error-message">
      {{ props.error }}
    </div>
    <!-- File Manager Modal -->
    <a-modal
      v-model:visible="fileManagerVisible"
      title="ໄຟລ໌ ແລະ ໂຟນເດີຂອງຕົວແກ້ໄຂຂໍ້ຄວາມ"
      width="900px"
      :footer="null"
      :destroyOnClose="true"
      @cancel="handleCloseModal"
    >
      <div class="file-manager">
        <!-- Header Section -->
        <div class="file-manager-header">
          <div class="file-manager-actions">
            <a-upload
              :custom-request="handleUpload"
              :show-upload-list="false"
              accept="image/*"
              :multiple="false"
            >
              <a-button type="primary" :loading="isUploading">
                <template #icon>
                  <upload-outlined />
                </template>
                ອັບໂຫລດຮູບພາບ
              </a-button>
            </a-upload>
          </div>
        </div>
        <!-- File Grid -->
        <a-spin :spinning="isLoading">
          <div class="file-grid">
            <template v-if="filteredFiles.length">
              <div
                v-for="file in filteredFiles"
                :key="file.id"
                class="file-item"
                :class="{ selected: selectedFile?.id === file.id }"
                @click="handleFileClick(file)"
              >
                <div class="delete-button" @click.stop="handleDeleteFile(file)">
                  <Icon
                    class="iconify"
                    icon="material-symbols:delete-outline"
                  />
                </div>
                <a-tooltip
                  :title="
                    selectedFile?.id === file.id
                      ? 'ດັບເບິ້ລຄລິກເພື່ອເພີ່ມຮູບພາບ'
                      : ''
                  "
                  placement="top"
                >
                  <div class="file-preview">
                    <img
                      v-if="isImageFile(file)"
                      :src="getFileUrl(file.name)"
                      :alt="file.name"
                      class="file-thumbnail"
                      loading="lazy"
                      @error="handleImageError($event, file.id)"
                    />
                    <file-image-outlined v-else class="file-icon" />
                  </div>
                </a-tooltip>
                <!-- Image Preview -->
                <!-- File Info -->
                <div class="file-info">
                  <div class="file-name" :title="file.name">
                    {{ file.name }}
                  </div>
                  <div class="file-meta">
                    {{ formatFileSize(file.size) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <inbox-outlined />
              <p>{{ isLoading ? "ກຳລັງໂຫລດຂໍ້ມູນ..." : "ບໍ່ພົບຮູບພາບ" }}</p>
            </div>
          </div>
        </a-spin>

        <!-- Footer Actions -->
        <!-- <div class="modal-footer">
          <a-button @click="handleCloseModal"> ຍົກເລີກ </a-button>
          <a-button
            type="primary"
            :disabled="!selectedFile"
            @click="handleInsertImage"
          >
            ເພີ່ມຮູບພາບ
          </a-button>
        </div> -->
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.editor-container.has-error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 4px;
}

.file-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-manager-header {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.file-manager-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.search-input {
  width: 300px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  padding: 1rem;
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.file-item {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #e6f4ff;
  background-color: #f5f5f5;
}

.file-item.selected {
  border-color: #1890ff;
  background-color: #e6f4ff;
}

.file-preview {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.file-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.file-thumbnail:hover {
  transform: scale(1.05);
}

.file-icon {
  font-size: 2rem;
  color: #999;
}

.file-info {
  margin-top: 0.5rem;
}

.file-name {
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 0.75rem;
  color: #999;
}

.modal-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #999;
}

.empty-state :deep(svg) {
  font-size: 2rem;
  margin-bottom: 1rem;
}

:deep(.ql-editor p) {
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
:deep(.ql-editor ol, :deep(.ql-editor ul)) {
  margin: 0;
  padding: 0;
}

:deep(.ql-editor) {
  min-height: v-bind('props.height + "px"');
}

:deep(.ql-editor img) {
  margin: 1em 0;
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-item {
  position: relative; /* เพิ่มเพื่อให้สามารถจัดตำแหน่ง delete-button ได้ */
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-button:hover {
  background-color: #ff4d4f;
  color: white;
}

.file-item:hover .delete-button {
  opacity: 1;
}

.file-item.selected .delete-button {
  opacity: 1;
}

/* เพิ่ม style สำหรับ iconify */
.iconify {
  font-size: 16px;
}

.file-item.can-insert {
  position: relative;
}

.file-item.can-insert::after {
  content: "✨ ດັບເບິ້ລຄລິກເພື່ອເພີ່ມ";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(24, 144, 255, 0.9);
  color: white;
  font-size: 12px;
  padding: 4px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.2s ease;
}

.file-item.can-insert:hover::after {
  transform: translateY(0);
}

.file-item.selected .file-thumbnail {
  border: 2px solid #1890ff;
}

/* เพิ่ม animation สำหรับ hover effect */
.file-item {
  transform-origin: center;
  transition: all 0.2s ease;
}

.file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-item.selected:hover {
  transform: translateY(-2px) scale(1.02);
}
</style>
