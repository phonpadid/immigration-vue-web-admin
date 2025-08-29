import type {
  TabConfig,
  CountryType,
  CheckpointForm,
} from "@/types/checkpoint.type";

export const TABS_CONFIG: TabConfig[] = [
  { key: "1", label: "ພາສາລາວ", slotName: "tab1", lang: "lo" },
  { key: "2", label: "ພາສາອັງກິດ", slotName: "tab2", lang: "en" },
  { key: "3", label: "ພາສາຈີນ", slotName: "tab3", lang: "zh_cn" },
];

export const COUNTRIES: Array<{ value: CountryType; label: string }> = [
  { value: "", label: "ເລືອກຊາຍແດນປະເທດ" },
  { value: "myanmar", label: "ມຽນມ້າ" },
  { value: "thailand", label: "ໄທ" },
  { value: "vietnam", label: "ຫວຽດນາມ" },
  { value: "cambodia", label: "ກຳປູເຈຍ" },
  { value: "china", label: "ຈີນ" },
];

export const DEFAULT_FORM_VALUES: CheckpointForm = {
  category_id: 0,
  province_id: 0,
  country: "",
  image: null,
  link_map: "",
  phone_number: "",
  email: "",
  visa: false,
  e_visa: false,
  is_open: false,
  translates: {
    lo: { name: "", time_operation: "", address: "", content: "" },
    en: { name: "", time_operation: "", address: "", content: "" },
    zh_cn: { name: "", time_operation: "", address: "", content: "" },
  },
};
