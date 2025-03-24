// src/validation/new.categories.validation.ts
import * as yup from "yup";

// กำหนด type สำหรับคีย์ภาษาที่รองรับ
type LanguageKeys = "lo" | "en" | "zh_cn";

export const rulesNewsCategories = {
  // กฎการตรวจสอบสำหรับชื่อประเภทข่าวภาษาลาว
  lo_name: yup
    .string()
    .trim() // ตัดช่องว่างหน้าและหลัง
    .required("ກະລຸນາປ້ອນຊື່ຂ່າວສານເປັນພາສາລາວ") // กรุณาป้อนชื่อข่าวสารเป็นภาษาลาว
    .min(2, "ຊື່ຂ່າວສານຕ້ອງມີຄວາມຍາວຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ") // ชื่อข่าวสารต้องมีความยาวอย่างน้อย 2 ตัวอักษร
    .max(100, "ຊື່ຂ່າວສານຕ້ອງມີຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ"), // ชื่อข่าวสารต้องมีความยาวไม่เกิน 100 ตัวอักษร

  // กฎการตรวจสอบสำหรับชื่อประเภทข่าวภาษาอังกฤษ
  en_name: yup
    .string()
    .trim() // ตัดช่องว่างหน้าและหลัง
    .required("Please enter news category name in English") // กรุณาป้อนชื่อประเภทข่าวเป็นภาษาอังกฤษ
    .min(2, "Category name must be at least 2 characters long") // ชื่อประเภทต้องมีความยาวอย่างน้อย 2 ตัวอักษร
    .max(100, "Category name must not exceed 100 characters"), // ชื่อประเภทต้องมีความยาวไม่เกิน 100 ตัวอักษร

  // กฎการตรวจสอบสำหรับชื่อประเภทข่าวภาษาจีน
  zh_cn_name: yup
    .string()
    .trim() // ตัดช่องว่างหน้าและหลัง
    .required("请输入新闻类别名称") // กรุณาป้อนชื่อประเภทข่าวเป็นภาษาจีน
    .min(2, "类别名称至少需要2个字符") // ชื่อประเภทต้องมีความยาวอย่างน้อย 2 ตัวอักษร
    .max(100, "类别名称不能超过100个字符"), // ชื่อประเภทต้องมีความยาวไม่เกิน 100 ตัวอักษร
};

/**
 * Schema การตรวจสอบข้อมูลแบบ nested object ทั้งหมด
 * ใช้สำหรับตรวจสอบข้อมูลทั้งหมดก่อนส่งไปยัง API
 */
export const newsCategoriesSchema = yup.object().shape({
  // กฎการตรวจสอบสำหรับข้อมูลภาษาลาว
  lo: yup.object().shape({
    name: yup
      .string()
      .trim()
      .required("ກະລຸນາປ້ອນຊື່ຂ່າວສານເປັນພາສາລາວ")
      .min(2, "ຊື່ຂ່າວສານຕ້ອງມີຄວາມຍາວຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ")
      .max(100, "ຊື່ຂ່າວສານຕ້ອງມີຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ"),
  }),

  // กฎการตรวจสอบสำหรับข้อมูลภาษาอังกฤษ
  en: yup.object().shape({
    name: yup
      .string()
      .trim()
      .required("Please enter news category name in English")
      .min(2, "Category name must be at least 2 characters long")
      .max(100, "Category name must not exceed 100 characters"),
  }),

  // กฎการตรวจสอบสำหรับข้อมูลภาษาจีน
  zh_cn: yup.object().shape({
    name: yup
      .string()
      .trim()
      .required("请输入新闻类别名称")
      .min(2, "类别名称至少需要2个字符")
      .max(100, "类别名称不能超过100个字符"),
  }),
});
export const validateNewsCategoriesData = async (
  formData: Record<LanguageKeys, { name: string }>
) => {
  try {
    // ตรวจสอบข้อมูลด้วย schema
    await newsCategoriesSchema.validate(formData, { abortEarly: false });
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      // แปลงรายการข้อผิดพลาดให้เป็นรูปแบบที่เข้าใจง่าย
      const formattedErrors = error.inner.reduce((acc, err) => {
        const path = err.path || "";
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);

      return { isValid: false, errors: formattedErrors };
    }

    // กรณีเกิดข้อผิดพลาดอื่นๆ
    return {
      isValid: false,
      errors: { general: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" },
    };
  }
};
