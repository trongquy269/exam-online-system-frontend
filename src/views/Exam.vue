<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Button from 'primevue/button';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';

const router = useRouter();
const examID = router.currentRoute.value.query.id;

const exam = ref({});

const changeTitle = (title) => {
	document.title = `e-Exam | ${title}`;
};

const fetchExamInfo = () => {
	axios
		.get('/exam', {
			params: {
				exam_id: examID,
			},
		})
		.then((res) => {
			if (res?.data?.data) {
				exam.value = res.data.data;
			}
		})
		.catch((err) => {
			if (err?.response?.status === 404) {
				if (err?.response?.data?.message === 'Exam not found') {
					dialogErrorMessage.value = 'Không tìm thấy bài thi';
				}
			}
		});
};

onMounted(() => {
	changeTitle(examID);
	fetchExamInfo();
});
</script>
<template>
	<Header />
	<div
		class="xl:w-[1280px] w-full min-h-screen mx-auto flex items-start justify-between mt-24 mb-12 px-12 xl:px-0"
	>
		<div
			class="w-full flex flex-col items-center justify-center"
			v-if="exam?.tested?.length === 0"
		>
			<h1 class="text-4xl font-bold">{{ exam?.class_name }}</h1>
			<h3 class="text-xl mt-2 mb-8">
				Giáo viên: {{ exam?.lecturer_name }}
			</h3>
			<h1 class="text-4xl font-bold">{{ exam?.name }}</h1>
			<h3 class="text-2xl font-semibold mt-8 mb-2">
				Đề thi: {{ exam?.exam_paper_name }}
			</h3>
			<p>Thời gian bắt đầu: {{ exam?.day_begin }}</p>
			<p class="mb-2">Thời gian kết thúc: {{ exam?.day_end }}</p>
			<p>Thời gian làm bài: {{ exam?.duration }} phút</p>
			<p class="mb-2">
				Tổng số câu hỏi: {{ exam?.question_quantity_max }} câu
			</p>
			<p>
				Số lần thi tối đa: {{ exam?.max_times }} lần. Tính điểm dựa trên
				tổng số lần thi
			</p>
			<p>
				Cần đạt từ
				<span class="text-red-600">{{ exam?.mark_achieved }} điểm</span>
				để vượt qua kỳ thi
			</p>
			<Button
				class="mt-8"
				label="Bắt đầu làm bài"
				severity="success"
				@click="
					router.push(`/classroom/exam/paper/generate/?id=${examID}`)
				"
			/>
		</div>
		<div
			class="w-full flex flex-col items-center justify-center"
			v-if="exam?.tested?.length !== 0"
		>
			<h1 class="text-4xl font-bold">{{ exam?.class_name }}</h1>
			<h3 class="text-xl mt-2 mb-8">
				Giáo viên: {{ exam?.lecturer_name }}
			</h3>
			<h3 class="text-2xl font-semibold mt-8 mb-2">
				Đề thi: {{ exam?.exam_paper_name }}
			</h3>
			<table class="w-full mt-4">
				<thead class="bg-blue-200">
					<tr class="h-10">
						<th class="w-20">Lần</th>
						<th>Điểm</th>
						<th class="w-52">Thời gian bắt đầu</th>
						<th class="w-52">Thời gian kết thúc</th>
						<th class="w-16"></th>
					</tr>
				</thead>
				<tbody class="border-l border-l-blue-200">
					<tr
						class="h-10"
						v-for="item in exam?.tested"
					>
						<td class="text-center">{{ item.times }}</td>
						<td
							class="text-center"
							v-if="item.mark !== null"
						>
							{{ item.mark }}/10
						</td>
						<td
							class="text-center"
							v-if="item.mark === null"
						>
							Chưa có
						</td>
						<td class="text-center">{{ item.time_start }}</td>
						<td
							class="text-center"
							v-if="!!item.time_end"
						>
							{{ item.time_end }}
						</td>
						<td
							class="text-center"
							v-if="!!!item.time_end"
						>
							Chưa nộp bài
						</td>
						<td
							class="text-center"
							:class="!!!item.mark && 'w-52'"
						>
							<button
								class="hover:text-sky-500 hover:underline"
								v-if="item.mark !== null"
							>
								Xem lại
							</button>
							<button
								v-if="item.mark === null"
								@click="
									router.push(
										`/classroom/exam/paper/generate/?id=${examID}`
									)
								"
							>
								Tiếp tục làm bài
							</button>
						</td>
					</tr>
				</tbody>
			</table>
			<Button
				class="mt-16"
				label="Thực hiện lại bài thi"
				severity="success"
				@click="
					router.push(`/classroom/exam/paper/generate/?id=${examID}`)
				"
				v-if="exam?.tested?.length <= exam?.max_times"
			/>
		</div>
	</div>
	<Footer />
</template>
