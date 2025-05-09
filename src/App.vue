<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import { useRemoveDarkClasses } from './useRemoveDarkClasses';

const { observeClasses, stopObserving } = useRemoveDarkClasses();
const router = useRouter();

onMounted(() => {
	observeClasses();
});

onBeforeUnmount(() => {
	stopObserving();
});

axios.defaults.baseURL = import.meta.env.VITE_BASE_API;
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err?.response?.status === 401) {
			if (err?.response?.data?.message === 'Unauthorized') {
				router.push('/login');
			}
		}
		return Promise.reject(err);
	}
);
</script>

<template>
	<div class="w-full text-base font-Montserrat">
		<RouterView />
	</div>
</template>
