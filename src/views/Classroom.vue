<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Button from 'primevue/button';

import checkedIcon from '../stores/icons/Checked.vue';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import LogoutIcon from '../stores/icons/Logout.vue';

const router = useRouter();
let classID = router.currentRoute.value.query.id;

const classInfo = ref({});
const myClasses = ref([]);
const groupExams = ref([]);
const inputPasswordVisible = ref(false);
const inputPasswordValue = ref('');
const examIDSelected = ref('');
const dialogErrorMessage = ref('');
const isShowLeaveClassDialog = ref(false);

const changeTitle = (title) => {
	document.title = `e-Exam | ${title}`;
};

function groupedExamByMonth(arr) {
	const groups = arr.reduce((acc, item) => {
		const date = item.date_creation.substring(0, 10);
		const [day, month, year] = date.split('/');
		const monthYear = `THÁNG ${month} NĂM ${year}`;

		if (!acc[monthYear]) {
			acc[monthYear] = [];
		}

		acc[monthYear].push(item);
		return acc;
	}, {});

	return Object.keys(groups).map((key) => {
		return {
			header: key,
			items: groups[key],
		};
	});
}

const fetchClassInfo = () => {
	try {
		Promise.all([
			axios
				.get('/class', {
					params: {
						class_id: classID,
					},
				})
				.then((res) => {
					if (res?.data) {
						classInfo.value = res.data.data;
					}
				})
				.catch((err) => {}),

			axios
				.get('/my-classes', {
					params: {
						limit: 5,
					},
				})
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
};

onMounted(() => {
	changeTitle(classID);
	fetchClassInfo();
});

watch(
	() => router.currentRoute.value.query.id,
	(newClassID) => {
		classID = newClassID;
		changeTitle(classID);
		fetchClassInfo();
	}
);

watch(
	() => classInfo.value,
	(newClassInfo) => {
		groupExams.value = groupedExamByMonth(newClassInfo.exams);
	}
);

const leaveClass = () => {
	axios
		.delete('/leave-class', {
			params: {
				class_id: classID,
			},
		})
		.then((res) => {
			if (res?.data?.message === 'Success') {
				router.push('/');
			}
		})
		.catch((err) => {
			console.error(err);
		});
};

const sendPassword = () => {
	const exam_id = examIDSelected.value;
	const password = btoa(inputPasswordValue.value);

	axios
		.post('/check/join-exam', {
			exam_id,
			password,
		})
		.then((res) => {
			if (res?.data?.message === 'Success') {
				inputPasswordVisible.value = false;
				router.push(`/classroom/exam?id=${exam_id}`);
			}
		})
		.catch((err) => {
			if (err?.response?.status === 401) {
				if (err?.response?.data?.message === 'Wrong password') {
					dialogErrorMessage.value = 'Sai mật nhẩu';
				}
			} else if (err?.response?.status === 404) {
				if (err?.response?.data?.message === 'Exam not found') {
					dialogErrorMessage.value = 'Không tìm thấy bài thi';
				}
			}
		});
};

const openExam = (examID, isExam) => {
	examIDSelected.value = examID;

	if (!isExam) {
		inputPasswordVisible.value = true;
	} else {
		router.push(`/classroom/exam?id=${examID}`);
	}
};

const closeDialogHandler = () => {
	inputPasswordVisible.value = false;
	isShowLeaveClassDialog.value = false;
	inputPasswordValue.value = '';
	dialogErrorMessage.value = '';
};
</script>
<template>
	<Header />
	<div
		class="xl:w-[1280px] w-full min-h-screen mx-auto flex items-start justify-between mt-24 mb-12 px-12 xl:px-0"
	>
		<div class="w-full lg:w-8/12 lg:pr-5">
			<div class="flex items-center justify-start gap-2">
				<h1 class="text-4xl font-bold">{{ classInfo?.name }}</h1>
				<h5 class="mt-2 text-2xl text-slate-400 font-semibold">
					{{ classInfo?.class_id }}
				</h5>
			</div>
			<h5 class="mt-2">Giáo viên: {{ classInfo?.lecturer_name }}</h5>
			<div>
				Thời gian mở lớp: {{ classInfo?.create_date?.substring(0, 10) }}
			</div>
			<div
				class="mt-16 text-xl"
				v-if="classInfo?.exams?.length === 0"
			>
				Chưa có bài thi nào
			</div>

			<div
				class="mt-16 text-xl border-l border-l-blue-200"
				v-if="classInfo?.exams?.length !== 0"
				v-for="group in groupExams"
			>
				<h2 class="w-full text-2xl bg-blue-200 py-3 px-4 mb-4">
					{{ group.header }}
				</h2>
				<div
					class="flex flex-col items-start justify-start gap-2"
					v-for="item in group.items"
				>
					<div class="w-full flex items-center justify-between">
						<div
							class="text-lg pl-4 cursor-pointer hover:underline hover:text-sky-500"
							@click="
								openExam(item?.exam_paper_id, item?.is_exam)
							"
						>
							{{ item?.name }}
						</div>
						<checkedIcon
							class="text-sky-500"
							v-if="item?.is_exam"
						/>
					</div>
				</div>
			</div>
			<button
				class="flex items-center justify-start gap-2 text-red-500 mt-20"
				@click="isShowLeaveClassDialog = true"
			>
				<LogoutIcon class="w-5 mb-0.5 ml-[-3px]" />
				Xoá ghi danh tôi ở lớp này
			</button>
		</div>
		<div class="flex-1 border-l pl-5 hidden lg:block">
			<h2 class="h-10 text-3xl font-bold flex items-end mb-6">
				LỚP HỌC CỦA TÔI
			</h2>
			<ul>
				<li
					class="py-2 border-y border-y-transparent hover:border-y-slate-400 hover:text-sky-600 cursor-pointer ease-out duration-100"
					v-for="item in myClasses"
					@click="router.push(`/classroom?id=${item.class_id}`)"
				>
					<h3 class="text-2xl font-semibold mb-2">{{ item.name }}</h3>
					<p>Giáo viên: {{ item.lecturer_name }}</p>
				</li>
			</ul>
			<button
				class="flex items-center gap-2 mx-auto hover:text-sky-600 rounded ease-out duration-100 py-2 px-8 mt-2"
				v-if="myClasses.length !== 0"
			>
				<div class="mb-[-2px]">>>></div>
				Xem thêm
				<div class="mb-[-2px]"><<<</div>
			</button>
		</div>
	</div>
	<!-- Overlay -->
	<div
		class="w-full h-screen fixed top-0 left-0 bg-black opacity-45 backdrop-blur-sm ease-out duration-300 z-20"
		v-if="inputPasswordVisible || isShowLeaveClassDialog"
	></div>
	<!-- Dialog -->
	<div
		class="w-96 fixed top-2/4 left-2/4 flex flex-col items-center justify-center z-30 bg-white overflow-hidden rounded-lg translate-x-[-50%] translate-y-[-70%]"
		v-if="inputPasswordVisible"
	>
		<h2 class="text-2xl font-semibold uppercase p-4">Nhập mật khẩu</h2>
		<p>Vui lòng nhập mật khẩu để vào bài thi</p>
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
				label="Xác nhận"
				:class="'flex-1'"
				severity="success"
				@click="sendPassword"
			/>
		</div>
	</div>
	<div
		class="w-96 fixed top-2/4 left-2/4 flex flex-col items-center justify-center z-30 bg-white overflow-hidden rounded-lg translate-x-[-50%] translate-y-[-70%]"
		v-if="isShowLeaveClassDialog"
	>
		<h2 class="text-2xl font-semibold uppercase p-4">Rời lớp học</h2>
		<p class="px-4 text-center mb-4">
			Bạn chắc chắn rằng sẽ xoá ghi danh ra khỏi lớp này
		</p>
		<div class="w-80 flex items-center justify-between gap-2 mt-2 mb-4">
			<Button
				label="Đóng"
				:class="'flex-1'"
				severity="success"
				outlined
				@click="closeDialogHandler"
			/>
			<Button
				label="Xác nhận"
				:class="'flex-1'"
				severity="danger"
				@click="leaveClass"
			/>
		</div>
	</div>
	<Footer />
</template>
