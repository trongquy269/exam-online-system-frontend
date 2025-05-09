<script setup>
import { ref, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import CloseIcon from '../stores/icons/Close.vue';
import UserIcon from '../stores/icons/User.vue';
import LogoutIcon from '../stores/icons/Logout.vue';
import SearchIcon from '../stores/icons/Search.vue';

const router = useRouter();

const name = ref('');
const userID = ref('');
const isShowSlider = ref(false);
const sidebar = ref(null);
const nameRef = ref(null);
const searchValue = ref('');
const searchRef = ref(null);
const isSearchFocused = ref(false);

onMounted(() => {
	axios
		.post('/check/login')
		.then((res) => {
			if (res?.data?.message === 'Success') {
				name.value = res?.data?.user_name;
				userID.value = res?.data?.user_id;
			}
		})
		.catch((err) => {});

	// Close sidebar when click outside
	window.addEventListener('click', (e) => {
		if (
			(e.target !== sidebar.value ||
				e.target.parentNode !== sidebar.value) &&
			e.target !== nameRef.value
		) {
			return (isShowSlider.value = false);
		}
	});

	// Keyboard events
	window.addEventListener('keydown', (e) => {
		if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
			e.preventDefault();
			searchRef.value.focus();
			console.log(1);
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			isSearchFocused.value = false;
			searchRef.value.blur();
		}
	});
});

const logout = () => {
	axios.post('/logout').then(() => {
		router.push('/login');
	});
};

const sidebarItems = ref([
	{
		icon: markRaw(UserIcon),
		label: 'Thông tin cá nhân',
		clickHandler: () => router.push('/profile'),
		style: 'mt-2',
	},
	{
		icon: markRaw(LogoutIcon),
		label: 'Đăng xuất',
		clickHandler: logout,
		style: 'text-red-700',
	},
]);
</script>

<template>
	<div
		class="max-w-full w-full h-14 flex items-center justify-between mx-auto px-10 fixed top-0 left-0 bg-white z-10 shadow"
	>
		<div
			class="flex items-center gap-3 cursor-pointer"
			@click="router.push('/')"
		>
			<img
				src="/logo.svg"
				alt="Logo"
				class="h-11 object-cover"
			/>
			<div>
				<div class="text-2xl font-bold">
					e-<span class="text-sky-700">Exam</span>
				</div>
				<div class="text-sm font-semibold">Hệ thống thi trực tuyến</div>
			</div>
		</div>
		<!-- Search overlay -->
		<div
			class="w-full h-screen absolute top-0 left-0 bg-black opacity-65 backdrop-blur-sm ease-out duration-300"
			:class="isSearchFocused ? 'block' : 'hidden'"
		></div>
		<!-- Search -->
		<div
			class="w-2/4 h-10 border flex items-center justify-between shadow-sm relative ease-out duration-300 bg-white"
			:class="isSearchFocused ? 'rounded-t-lg' : 'rounded-lg'"
		>
			<SearchIcon class="w-6 mx-2" />
			<input
				type="text"
				class="w-full h-full rounded-lg outline-none"
				placeholder="Tìm kiếm nhanh lớp học..."
				@focus="isSearchFocused = true"
				@blur="isSearchFocused = false"
				v-model="searchValue"
				ref="searchRef"
			/>
			<span
				class="w-14 text-right mr-2 text-slate-400 font-semibold"
				v-if="!isSearchFocused"
			>
				Ctrl K
			</span>
			<button
				class="h-7 text-center text-slate-400 font-semibold flex items-center justify-center mr-[5px] p-2 rounded bg-slate-200"
				v-if="isSearchFocused"
			>
				ESC
			</button>
			<div
				class="max-h-0 top-full left-[-1px] right-[-1px] absolute bg-white rounded-b-lg overflow-hidden ease-out duration-300"
				:class="isSearchFocused ? 'max-h-96 border' : 'max-h-0'"
			>
				<!-- Search result -->
			</div>
		</div>
		<div>
			<div
				class="cursor-pointer font-semibold hover:bg-slate-200 rounded ease-out duration-300 p-2"
				@click="isShowSlider = !isShowSlider"
				ref="nameRef"
			>
				{{ name }}
			</div>
		</div>
	</div>
	<!-- Sidebar -->
	<div
		class="h-screen bg-white fixed right-0 top-0 ease-out duration-300 overflow-hidden border-l shadow-lg flex items-center justify-start flex-col z-10"
		:class="isShowSlider ? 'w-80' : 'w-0'"
		ref="sidebar"
	>
		<div class="w-72 h-14 flex items-center justify-between border-b mt-2">
			<div>
				<h2
					class="w-full flex items-center justify-start font-semibold"
				>
					{{ name }}
				</h2>
				<small>ID: {{ userID }}</small>
			</div>
			<div
				class="w-10 h-9 flex items-center justify-center cursor-pointer border border-transparent hover:border-gray-200 rounded ease-out duration-300 mb-1"
				@click="isShowSlider = false"
			>
				<CloseIcon />
			</div>
		</div>
		<ul class="w-72">
			<li
				v-for="item in sidebarItems"
				:key="item.label"
				class="w-full h-8 flex items-center justify-start gap-2 cursor-pointer"
				@click="item.clickHandler()"
				:class="item.style"
			>
				<component
					:is="item.icon"
					class="w-5 h-5"
				/>
				<span class="leading-8 mt-px">{{ item.label }}</span>
			</li>
		</ul>
	</div>
</template>
