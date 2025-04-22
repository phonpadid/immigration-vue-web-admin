declare module "vue3-qrcode-reader" {
  import { DefineComponent } from "vue";

  // Declare the components provided by the library
  export const QrcodeStream: DefineComponent<{}, {}, any>;
  export const QrcodeDropZone: DefineComponent<{}, {}, any>;
  export const QrcodeCapture: DefineComponent<{}, {}, any>;
}
