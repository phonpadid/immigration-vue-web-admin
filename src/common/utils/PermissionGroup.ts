/**
 * ไฟล์นี้เก็บค่าคงที่ของ permissions ทั้งหมดในระบบ
 * แบ่งตามกลุ่มของ permission
 */

// User permissions
export const USER_READ = "user:read";
export const USER_WRITE = "user:write";
export const USER_REMOVE = "user:remove";

// Registration permissions
export const REGISTRATION_READ = "registration:read";
export const REGISTRATION_WRITE = "registration:write";

// Banner permissions
export const BANNER_READ = "banner:read";
export const BANNER_WRITE = "banner:write";
export const BANNER_REMOVE = "banner:remove";

// Feedback permissions
export const FEEDBACK_READ = "feedback:read";
export const FEEDBACK_WRITE = "feedback:write";
export const FEEDBACK_REMOVE = "feedback:remove";

// Hotel permissions
export const HOTEL_READ = "hotel:read";
export const HOTEL_WRITE = "hotel:write";
export const HOTEL_REMOVE = "hotel:remove";

// News permissions
export const NEWS_READ = "news:read";
export const NEWS_WRITE = "news:write";
export const NEWS_REMOVE = "news:remove";

// Visa permissions
export const VISA_READ = "visa:read";
export const VISA_WRITE = "visa:write";
export const VISA_REMOVE = "visa:remove";

// Law permissions
export const LAW_READ = "law:read";
export const LAW_WRITE = "law:write";
export const LAW_REMOVE = "law:remove";

// Checkpoint permissions
export const CHECKPOINT_READ = "checkpoint:read";
export const CHECKPOINT_WRITE = "checkpoint:write";
export const CHECKPOINT_REMOVE = "checkpoint:remove";

// Contact permissions
export const CONTACT_READ = "contact:read";
export const CONTACT_REMOVE = "contact:remove";

// Country permissions
export const COUNTRY_READ = "country:read";
export const COUNTRY_WRITE = "country:write";
export const COUNTRY_REMOVE = "country:remove";

// Service permissions
export const SERVICE_READ = "service:read";
export const SERVICE_WRITE = "service:write";
export const SERVICE_REMOVE = "service:remove";

// กลุ่มของ permissions ตามประเภทการใช้งาน
export const ALL_READ_PERMISSIONS = [
  USER_READ,
  REGISTRATION_READ,
  BANNER_READ,
  FEEDBACK_READ,
  HOTEL_READ,
  NEWS_READ,
  VISA_READ,
  LAW_READ,
  CHECKPOINT_READ,
  CONTACT_READ,
  COUNTRY_READ,
  SERVICE_READ,
];

export const ALL_WRITE_PERMISSIONS = [
  USER_WRITE,
  REGISTRATION_WRITE,
  BANNER_WRITE,
  FEEDBACK_WRITE,
  HOTEL_WRITE,
  NEWS_WRITE,
  VISA_WRITE,
  LAW_WRITE,
  CHECKPOINT_WRITE,
  COUNTRY_WRITE,
  SERVICE_WRITE,
];

export const ALL_REMOVE_PERMISSIONS = [
  USER_REMOVE,
  BANNER_REMOVE,
  FEEDBACK_REMOVE,
  HOTEL_REMOVE,
  NEWS_REMOVE,
  VISA_REMOVE,
  LAW_REMOVE,
  CHECKPOINT_REMOVE,
  CONTACT_REMOVE,
  COUNTRY_REMOVE,
  SERVICE_REMOVE,
];

// กลุ่มของ permissions ตามโมดูล
export const USER_PERMISSIONS = [USER_READ, USER_WRITE, USER_REMOVE];
export const REGISTRATION_PERMISSIONS = [REGISTRATION_READ, REGISTRATION_WRITE];
export const BANNER_PERMISSIONS = [BANNER_READ, BANNER_WRITE, BANNER_REMOVE];
export const FEEDBACK_PERMISSIONS = [FEEDBACK_READ, FEEDBACK_WRITE, FEEDBACK_REMOVE];
export const HOTEL_PERMISSIONS = [HOTEL_READ, HOTEL_WRITE, HOTEL_REMOVE];
export const NEWS_PERMISSIONS = [NEWS_READ, NEWS_WRITE, NEWS_REMOVE];
export const VISA_PERMISSIONS = [VISA_READ, VISA_WRITE, VISA_REMOVE];
export const LAW_PERMISSIONS = [LAW_READ, LAW_WRITE, LAW_REMOVE];
export const CHECKPOINT_PERMISSIONS = [CHECKPOINT_READ, CHECKPOINT_WRITE, CHECKPOINT_REMOVE];
export const CONTACT_PERMISSIONS = [CONTACT_READ, CONTACT_REMOVE];
export const COUNTRY_PERMISSIONS = [COUNTRY_READ, COUNTRY_WRITE, COUNTRY_REMOVE];
export const SERVICE_PERMISSIONS = [SERVICE_READ, SERVICE_WRITE, SERVICE_REMOVE];

// รวมทุก permissions
export const ALL_PERMISSIONS = [
  ...USER_PERMISSIONS,
  ...REGISTRATION_PERMISSIONS,
  ...BANNER_PERMISSIONS,
  ...FEEDBACK_PERMISSIONS,
  ...HOTEL_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...VISA_PERMISSIONS,
  ...LAW_PERMISSIONS,
  ...CHECKPOINT_PERMISSIONS,
  ...CONTACT_PERMISSIONS,
  ...COUNTRY_PERMISSIONS,
  ...SERVICE_PERMISSIONS,
];