<script setup lang="ts">
import { computed } from "vue";

// รับ prop สำหรับเนื้อหา
const props = defineProps({
  content: {
    type: [String, Object],
    default: "",
  },
});

// แปลงข้อมูลเนื้อหาให้อยู่ในรูปแบบที่ใช้ได้
const parsedContent = computed(() => {
  try {
    // ถ้าเป็น string ให้ลองแปลงเป็น JSON
    if (typeof props.content === "string") {
      try {
        return JSON.parse(props.content);
      } catch (e) {
        // ถ้า parse ไม่ได้ แสดงว่าอาจจะเป็น HTML String
        return props.content;
      }
    }

    // ถ้าเป็น object อยู่แล้ว ใช้ค่านั้นเลย
    return props.content;
  } catch (e) {
    console.error("Error parsing content:", e);
    return "";
  }
});

// ตรวจสอบว่าเป็น content แบบ doc หรือไม่
const isDocContent = computed(() => {
  return (
    typeof parsedContent.value === "object" &&
    parsedContent.value !== null &&
    parsedContent.value.type === "doc"
  );
});

// ช่วยดึงข้อมูลเนื้อหาสำหรับแสดงผล
const renderContent = computed(() => {
  if (!parsedContent.value) return "";

  // ถ้าเป็นรูปแบบ doc format
  if (isDocContent.value) {
    return renderDocContent(parsedContent.value);
  }

  // ถ้าเป็น HTML string
  if (typeof parsedContent.value === "string") {
    return parsedContent.value;
  }

  // กรณีอื่นๆ
  return JSON.stringify(parsedContent.value);
});

// ฟังก์ชันช่วยแปลง doc format เป็น HTML
function renderDocContent(doc: any): string {
  try {
    if (!doc || !doc.content || !Array.isArray(doc.content)) {
      return "";
    }

    let html = "";

    // วนลูปผ่านแต่ละ node
    doc.content.forEach((node: any) => {
      if (node.type === "paragraph") {
        const textAlign = node.attrs?.textAlign || "left";
        let content = "";

        // ถ้ามี content ภายใน paragraph
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((item: any) => {
            if (item.type === "text") {
              content += item.text;
            }
          });
        }

        html += `<p style="text-align: ${textAlign}">${
          content || "&nbsp;"
        }</p>`;
      } else if (node.type === "image") {
        const src = node.attrs?.src || "";
        const alt = node.attrs?.alt || "";
        html += `<img src="${src}" alt="${alt}" class="w-full max-w-full h-auto my-2" />`;
      }
    });

    return html;
  } catch (e) {
    console.error("Error rendering doc content:", e);
    return "";
  }
}
</script>

<template>
  <div v-if="isDocContent" v-html="renderContent" class="news-content"></div>
  <div v-else class="news-content" v-html="renderContent"></div>
</template>

<style scoped>
.news-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 0.5rem 0;
  border-radius: 4px;
}

.news-content :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
