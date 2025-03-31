import * as Yup from "yup";

export const rulesProvince = Yup.object().shape({
  lo: Yup.object().shape({
    name: Yup.string()
      .required("ປ້ອນຊື່ແຂວງພາສາລາວ")
      .min(3, "ຊື່ແຂວງຕ້ອງມີຢ່າງນ້ອຍ 3 ຕົວອັກສອນ"),
  }),
  en: Yup.object().shape({
    name: Yup.string()
      .required("ປ້ອນຊື່ແຂວງພາສາອັງກິດ")
      .min(3, "ຊື່ແຂວງຕ້ອງມີຢ່າງນ້ອຍ 3 ຕົວອັກສອນ"),
  }),
  zh_cn: Yup.object().shape({
    name: Yup.string()
      .required("ປ້ອນຊື່ແຂວງພາສາຈີນ")
      .min(3, "ຊື່ແຂວງຕ້ອງມີຢ່າງນ້ອຍ 3 ຕົວອັກສອນ"),
  }),
});
