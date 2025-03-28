import { createApp } from "vue";
import { createPinia } from "pinia";
import "./tailwind.css";
import Antd from "ant-design-vue";

import "ant-design-vue/dist/reset.css";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);

app.mount("#app");
