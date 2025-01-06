import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import { Tabs } from 'ant-design-vue';

const app = createApp(App);
app.use(Antd).use(Tabs).mount('#app');