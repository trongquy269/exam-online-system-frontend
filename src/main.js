import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import App from './App.vue';
import Lara from './presets/lara';
import './style.css';
import router from './router.js';

const app = createApp(App);
app.use(PrimeVue, {
	unstyled: true,
	pt: Lara,
});
app.use(router);
app.use(ToastService);
app.mount('#app');
