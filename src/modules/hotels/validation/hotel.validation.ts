// src/validations/hotel.validation.ts
import * as Yup from "yup";
import { computed, ref } from "vue";

// แยก validation สำหรับการสร้างใหม่และการอัปเดต
export const createValidationSchema = (hasUserAccess: boolean) => {
  return computed(() => {
    // Base schema for all fields when creating new hotel
    const baseSchema = Yup.object().shape({
      lo: Yup.object().shape({
        name: Yup.string().required("ກະລຸນາປ້ອນຊື່ໂຮງແຮມ"),
        province: Yup.string().required("ກະລຸນາປ້ອນແຂວງ"),
        district: Yup.string().required("ກະລຸນາປ້ອນເມືອງ"),
        village: Yup.string().required("ກະລຸນາປ້ອນບ້ານ"),
      }),
      en: Yup.object().shape({
        name: Yup.string().required("Please enter hotel name"),
        province: Yup.string().required("Please enter province"),
        district: Yup.string().required("Please enter district"),
        village: Yup.string().required("Please enter village"),
      }),
      zh_cn: Yup.object().shape({
        name: Yup.string().required("请输入酒店名称"),
        province: Yup.string().required("请输入省份"),
        district: Yup.string().required("请输入区"),
        village: Yup.string().required("请输入村"),
      }),
      image: Yup.mixed().required("ກະລຸນາອັບໂຫຼດຮູບພາບ"),
      link: Yup.string()
        .url("ກະລຸນາປ້ອນ URL ໃຫ້ຖືກຕ້ອງ")
        .required("ກະລຸນາປ້ອນລິ້ງ"),
      phone_number: Yup.string().required("ກະລຸນາປ້ອນເບີໂທລະສັບ"),
    });

    // Add user validation if hasUserAccess is true
    if (hasUserAccess) {
      return baseSchema.shape({
        user: Yup.object().shape({
          email: Yup.string()
            .email("ອີເມວບໍ່ຖືກຕ້ອງ")
            .required("ກະລຸນາປ້ອນອີເມວ"),
          password: Yup.string()
            .min(8, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ")
            .required("ກະລຸນາປ້ອນລະຫັດຜ່ານ"),
        }),
      });
    }

    return baseSchema;
  });
};

// สำหรับการอัปเดต - ไม่จำเป็นต้องมีรูปภาพ
export const updateValidationSchema = (hasUserAccess: boolean) => {
  return computed(() => {
    // Base schema for updating hotel
    const baseSchema = Yup.object().shape({
      lo: Yup.object().shape({
        name: Yup.string().required("ກະລຸນາປ້ອນຊື່ໂຮງແຮມ"),
        province: Yup.string().required("ກະລຸນາປ້ອນແຂວງ"),
        district: Yup.string().required("ກະລຸນາປ້ອນເມືອງ"),
        village: Yup.string().required("ກະລຸນາປ້ອນບ້ານ"),
      }),
      en: Yup.object().shape({
        name: Yup.string().required("Please enter hotel name"),
        province: Yup.string().required("Please enter province"),
        district: Yup.string().required("Please enter district"),
        village: Yup.string().required("Please enter village"),
      }),
      zh_cn: Yup.object().shape({
        name: Yup.string().required("请输入酒店名称"),
        province: Yup.string().required("请输入省份"),
        district: Yup.string().required("请输入区"),
        village: Yup.string().required("请输入村"),
      }),
      // ไม่บังคับให้มีรูปภาพสำหรับการอัปเดต
      link: Yup.string()
        .url("ກະລຸນາປ້ອນ URL ໃຫ້ຖືກຕ້ອງ")
        .required("ກະລຸນາປ້ອນລິ້ງ"),
      phone_number: Yup.string().required("ກະລຸນາປ້ອນເບີໂທລະສັບ"),
    });

    // Add user validation if hasUserAccess is true
    if (hasUserAccess) {
      return baseSchema.shape({
        user: Yup.object().shape({
          email: Yup.string()
            .email("ອີເມວບໍ່ຖືກຕ້ອງ")
            .required("ກະລຸນາປ້ອນອີເມວ"),
          // รหัสผ่านเป็นทางเลือกสำหรับการอัปเดต
          password: Yup.string().min(8, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ"),
        }),
      });
    }

    return baseSchema;
  });
};

// ให้คงไว้เพื่อความเข้ากันได้กับโค้ดเดิม แต่ให้ใช้ createValidationSchema แทน
export const validationSchema = createValidationSchema(
  ref<boolean>(false).value
);
