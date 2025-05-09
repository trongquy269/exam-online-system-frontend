<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Button from 'primevue/button';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

const router = useRouter();

const classes = ref([]);
const myClasses = ref([]);
const inputPasswordVisible = ref(false);
const inputPasswordValue = ref('');
const classIDSelected = ref('');
const dialogErrorMessage = ref('');

onMounted(() => {
	try {
		Promise.all([
			axios
				.get('/classes')
				.then((res) => {
					classes.value = res.data.data;
				})
				.catch((err) => {
					console.error(err);
				}),

			axios
				.get('/my-classes')
				.then((res) => {
					myClasses.value = res.data.data;
				})
				.catch((err) => {
					console.error(err);
				}),
		]);
	} catch (err) {
		console.error(err.message);
	}
});

const showDialogHandler = (classID) => {
	classIDSelected.value = classID;
	inputPasswordVisible.value = true;
};

const closeDialogHandler = () => {
	inputPasswordVisible.value = false;
	inputPasswordValue.value = '';
	dialogErrorMessage.value = '';
};

const joinClass = () => {
	const classID = classIDSelected.value;
	const password = inputPasswordValue.value;

	axios
		.post('/join-class', {
			class_id: classID,
			password: btoa(password),
		})
		.then((res) => {
			if (res?.data?.message === 'Success') {
				router.push(`/classroom?id=${classID}`);
			}
		})
		.catch((err) => {
			if (err?.response?.status === 401) {
				if (err?.response?.data?.message === 'Wrong password') {
					dialogErrorMessage.value = 'Sai mật nhẩu';
				}
			} else if (err?.response?.status === 404) {
				if (err?.response?.data?.message === 'Class not found') {
					dialogErrorMessage.value = 'Không tìm thấy lớp học';
				}
			}
		});
};
</script>

<template>
	<Header />
	<div class="w-full px-10 flex items-start justify-between mt-24 mb-12">
		<div class="w-full lg:w-3/5 lg:pr-5">
			<h2 class="text-3xl font-semibold uppercase mb-8">
				DANH MỤC LỚP HỌC
			</h2>
			<ul>
				<li
					v-for="item in classes"
					:key="item.class_id"
				>
					<h3 class="text-2xl font-semibold mb-2">{{ item.name }}</h3>
					<div class="w-full flex items-center justify-start gap-12">
						<div>Giáo viên: {{ item.lecturer_name }}</div>
						<div>Mã lớp: {{ item.class_id }}</div>
					</div>
					<div>
						Thời gian mở lớp:
						{{ item.create_date.substring(0, 10) }}
					</div>
					<button
						class="w-48 h-9 bg-sky-300 hover:bg-sky-200 rounded mt-2 mb-12"
						@click="showDialogHandler(item.class_id)"
					>
						Ghi danh tôi
					</button>
				</li>
			</ul>
			<button
				class="flex items-center gap-2 mx-auto hover:bg-slate-100 rounded ease-out duration-300 py-2 px-8 mb-[-0.5rem] mt-[-0.5rem]"
			>
				<div class="mb-[-2px]">>>></div>
				Xem thêm
				<div class="mb-[-2px]"><<<</div>
			</button>
		</div>
		<div class="flex-1 border-l pl-5">
			<h2 class="text-3xl font-semibold uppercase hidden lg:flex mb-8">
				CÁC LỚP HỌC CỦA TÔI
			</h2>
			<ul v-if="myClasses.length !== 0">
				<li
					v-for="item in myClasses"
					:key="item.class_id"
				>
					<h3 class="text-2xl font-semibold mb-2">{{ item.name }}</h3>
					<div class="w-full flex items-center justify-start gap-12">
						<div>Giáo viên: {{ item.lecturer_name }}</div>
						<div>Mã lớp: {{ item.class_id }}</div>
					</div>
					<div>
						Thời gian mở lớp:
						{{ item.create_date.substring(0, 10) }}
					</div>
					<button
						class="w-48 h-9 bg-sky-300 hover:bg-sky-200 rounded mt-2 mb-12"
						@click="router.push(`/classroom?id=${item.class_id}`)"
					>
						Vào lớp học
					</button>
				</li>
			</ul>
			<button
				class="flex items-center gap-2 mx-auto hover:bg-slate-100 rounded ease-out duration-300 py-2 px-8 mb-[-0.5rem] mt-[-0.5rem]"
				v-if="myClasses.length !== 0"
			>
				<div class="mb-[-2px]">>>></div>
				Xem thêm
				<div class="mb-[-2px]"><<<</div>
			</button>
			<div v-if="myClasses.length === 0">
				<div class="">Bạn chưa ghi danh vào lớp học nào</div>
				<button
					class="w-48 h-9 bg-sky-300 hover:bg-sky-200 rounded mt-4 mb-4"
				>
					Ghi danh ngay
				</button>
			</div>
		</div>
	</div>
	<!-- Overlay -->
	<div
		class="w-full h-screen fixed top-0 left-0 bg-black opacity-45 backdrop-blur-sm ease-out duration-300 z-20"
		v-if="inputPasswordVisible"
	></div>
	<!-- Dialog -->
	<div
		class="w-96 fixed top-2/4 left-2/4 flex flex-col items-center justify-center z-30 bg-white overflow-hidden rounded-lg translate-x-[-50%] translate-y-[-70%]"
		v-if="inputPasswordVisible"
	>
		<h2 class="text-2xl font-semibold uppercase p-4">Nhập mật khẩu</h2>
		<p>Vui lòng nhập mật khẩu để vào lớp học</p>
		<input
			class="w-80 border-b my-4 outline-none text-center"
			type="text"
			v-model="inputPasswordValue"
			placeholder="Nhập ở đây"
			:class="dialogErrorMessage ? 'border-red-600' : ''"
		/>
		<p
			class="text-xs mt-[-8px] mb-2 text-red-600"
			v-bind="!!dialogErrorMessage"
		>
			{{ dialogErrorMessage }}
		</p>
		<div class="w-80 flex items-center justify-between gap-2 mt-2 mb-4">
			<Button
				label="Đóng"
				:class="'flex-1'"
				severity="warning"
				outlined
				@click="closeDialogHandler"
			/>
			<Button
				label="Ghi danh tôi"
				:class="'flex-1'"
				severity="success"
				@click="joinClass"
			/>
		</div>
	</div>
	<Footer />
</template>
