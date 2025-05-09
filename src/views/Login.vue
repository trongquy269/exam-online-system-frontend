<script setup>
import { ref } from 'vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import axios from 'axios';
import { useRouter } from 'vue-router';

import UserIcon from '../stores/icons/User.vue';
import KeyIcon from '../stores/icons/Key.vue';
import EyeIcon from '../stores/icons/Eye.vue';
import EyeFlashIcon from '../stores/icons/EyeFlash.vue';

const username = ref('');
const password = ref('');
const isShowPassword = ref(false);
const usernameError = ref('');
const passwordError = ref('');

const router = useRouter();

const inputUsernameStyle = ref({
	root: 'text-black w-full border text-lg outline-none pl-1 rounded-r-md',
});

const inputPasswordStyle = ref({
	root: 'text-black w-full border-y border-l text-lg outline-none pl-1',
});

const submit = () => {
	const usernameValue = username.value.trim();
	const passwordValue = password.value.trim();

	usernameError.value = '';
	passwordError.value = '';

	if (!!!usernameValue) {
		usernameError.value = 'Tên đăng nhập không đúng';
		return;
	}

	if (!!!passwordValue) {
		passwordError.value = 'Mật khẩu không được để trống';
		return;
	}

	axios
		.post('/login', {
			username: btoa(usernameValue),
			password: btoa(passwordValue),
		})
		.then((res) => {
			if (res?.data?.message === 'Success') {
				router.push('/');
			}
		})
		.catch((err) => {
			const message = err.response.data.message;

			if (message === 'Username does not exist') {
				usernameError.value = 'Tài khoản không tồn tại';
			} else if (message === 'Wrong password') {
				passwordError.value = 'Sai mật khẩu';
			}
		});
};
</script>

<template>
	<div class="w-screen h-screen flex items-center justify-center">
		<div
			class="xl:mt-[-100px] border rounded-xl flex items-center justify-between p-9 shadow-md"
		>
			<div class="w-96 flex flex-col items-center justify-center">
				<img
					src="/logo.svg"
					alt="Logo"
					class="w-52 object-cover"
				/>
				<div class="text-3xl font-bold mt-6">
					e-<span class="text-sky-700">Exam</span>
				</div>
			</div>
			<div
				class="w-96 text-black uppercase flex flex-col items-center justify-center"
			>
				<h2 class="text-2xl font-semibold mb-8">Đăng nhập</h2>
				<InputGroup
					class="h-12 mb-2"
					:class="{
						'animate-shake': !!usernameError,
					}"
				>
					<InputGroupAddon
						:class="{ 'border-red-600': !!usernameError }"
						><UserIcon
					/></InputGroupAddon>
					<InputText
						type="text"
						placeholder="Email"
						id="username"
						class="text-black"
						v-model="username"
						:pt="inputUsernameStyle"
						:class="{
							'border-red-600': !!usernameError,
						}"
						@keyup.enter="submit"
					/>
				</InputGroup>
				<span
					class="w-full flex items-center justify-start normal-case text-xs font-normal mt-[-4px] mb-2 text-red-600"
					v-if="!!usernameError"
					>{{ usernameError }}</span
				>
				<InputGroup
					class="h-12"
					:class="{
						'animate-shake': !!passwordError,
					}"
				>
					<InputGroupAddon
						:class="{
							'border-red-600': !!passwordError,
						}"
						><KeyIcon
					/></InputGroupAddon>
					<InputText
						:type="!isShowPassword ? 'password' : 'text'"
						placeholder="Mật khẩu"
						id="password"
						class="text-black"
						v-model="password"
						:pt="inputPasswordStyle"
						@keyup.enter="submit"
						:class="{
							'border-red-600': !!passwordError,
						}"
					/>
					<InputGroupAddon
						@click="isShowPassword = !isShowPassword"
						class="cursor-pointer"
						:class="{
							'border-red-600': !!passwordError,
						}"
					>
						<EyeIcon v-if="isShowPassword" />
						<EyeFlashIcon v-else />
					</InputGroupAddon>
				</InputGroup>
				<span
					class="w-full flex items-center justify-start normal-case text-xs font-normal mt-1 text-red-600"
					v-if="!!passwordError"
					>{{ passwordError }}</span
				>
				<button
					class="w-full h-12 bg-sky-700 hover:bg-sky-600 rounded-md mt-4 text-white font-bold"
					@click="submit"
					@keyup.enter="submit"
				>
					Đăng nhập
				</button>
				<button
					class="w-full flex items-center justify-start text-sky-700 hover:text-sky-600 mt-4 text-sm"
					@click="router.push('/forgot-password')"
				>
					Quên mật khẩu?
				</button>
				<button
					class="mt-24 text-sm hover:text-slate-700"
					@click="router.push('/register')"
				>
					Đăng ký tài khoản
				</button>
			</div>
		</div>
	</div>
</template>
