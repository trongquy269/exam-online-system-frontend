<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Button from 'primevue/button';

import FlagIcon from '../stores/icons/Flag.vue';
import BookmarkIcon from '../stores/icons/Bookmark.vue';

const router = useRouter();
const examID = router.currentRoute.value.query.id;
let page = router.currentRoute.value.query.page || '1';

const exam = ref({});
const questions = ref([]);
const flags = ref({});
const answerSelected = ref({});
const examTimer = ref('00 : 00');

const changeTitle = (title) => {
	document.title = `e-Exam | ${title}`;
};

const distributeQuestions = (arr) => {
	// Scroll to top
	window.scrollTo({ top: 0, behavior: 'smooth' });

	const arrCopy = arr.slice();

	return arrCopy.slice(parseInt(page) * 5 - 5, parseInt(page) * 5);
};

const countdown = (datetime, duration) => {
	// Format: YYYY-MM-DD HH:MM:SS
	const parseDate = (datetime) => {
		const parts = datetime.split(' ');
		const dateParts = parts[0].split('/');
		const timeParts = parts[1].split(':');

		return new Date(
			dateParts[2],
			dateParts[1] - 1,
			dateParts[0],
			timeParts[0],
			timeParts[1],
			timeParts[2]
		).getTime();
	};
	const time_start = parseDate(datetime);
	const time_end = time_start + duration * 60 * 1000;

	const timer = setInterval(() => {
		const now = new Date().getTime();
		const time_left = time_end - now;

		// Calculate time left in minutes and seconds
		const minutes = Math.floor(
			(time_left % (1000 * 60 * 60)) / (1000 * 60)
		);
		const seconds = Math.floor((time_left % (1000 * 60)) / 1000);

		examTimer.value = `${minutes < 10 ? '0' : ''}${minutes} : ${
			seconds < 10 ? '0' : ''
		}${seconds}`;

		if (time_left < 0) {
			clearInterval(timer);
			examTimer.value = '00 : 00';
		}
	});
};

const fetchExamInfo = () => {
	axios
		.get('/exam-paper', {
			params: {
				exam_id: examID,
			},
		})
		.then((res) => {
			if (res?.data?.data) {
				exam.value = res.data.data;
				questions.value = distributeQuestions(res.data.data.questions);
				countdown(res.data.data.time_start, res.data.data.duration);
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

watch(
	() => router.currentRoute.value.query.page,
	(newPage) => {
		page = newPage;
		questions.value = distributeQuestions(exam.value.questions);
	}
);

const onAnswer = (question, answer) => {
	axios
		.post('/exam-paper/answer', {
			question,
			answer,
			studentTestID: exam.value.id,
		})
		.catch((err) => console.error(err));

	answerSelected.value = { ...answerSelected.value, [question]: answer };
};

const clearStudentAnswer = (question) => {
	axios
		.post('/exam-paper/answer', {
			question,
			answer: '',
			studentTestID: exam.value.id,
		})
		.catch((err) => console.error(err));

	answerSelected.value = { ...answerSelected.value, [question]: '' };
};

const changeStatusFlag = (event, question) => {
	const target = event.currentTarget;
	const condition = target.classList.contains('text-red-600');

	if (condition) {
		axios
			.post('/exam-paper/flag', {
				question: question.question,
				status: false,
				studentTestID: exam.value.id,
			})
			.catch((err) => console.error(err));

		target.classList.remove('text-red-600', 'font-semibold');

		const questionIndex = exam.value?.questions.indexOf(question);
		flags.value = { ...flags.value, [questionIndex]: false };
	} else {
		axios
			.post('/exam-paper/flag', {
				question: question.question,
				status: true,
				studentTestID: exam.value.id,
			})
			.catch((err) => console.error(err));

		target.classList.add('text-red-600', 'font-semibold');

		const questionIndex = exam.value?.questions.indexOf(question);
		flags.value = { ...flags.value, [questionIndex]: true };
	}
};

const changeQuestion = (index) => {
	let gotoPage = 0;

	if (index % 5 === 0) {
		gotoPage = Math.floor(index / 5);
	} else {
		gotoPage = Math.floor(index / 5) + 1;
	}

	router.push(
		`/classroom/exam/paper/generate/?id=${examID}&page=${gotoPage}`
	);
};

const finishExam = () => {
	axios
		.post('/exam-paper/submit', {
			studentTestID: exam.value.id,
		})
		.then((res) => {
			if (res?.data?.message === 'Success') {
				router.push(`/classroom/exam?id=${examID}`);
			}
		})
		.catch((err) => {
			console.error(err);
		});
};
</script>
<template>
	<div class="h-10"></div>
	<div class="w-full flex gap-8">
		<div class="flex-1">
			<div
				class="flex items-start gap-4 mb-16 pl-6 xl:pl-0"
				v-for="question in questions"
			>
				<div class="w-48 h-max xl:block hidden pl-6">
					<div
						class="flex items-center gap-2 cursor-pointer mb-2"
						:class="
							(flags[exam?.questions.indexOf(question)] ===
							undefined
								? question.is_flag
								: flags[exam?.questions.indexOf(question)]) &&
							'text-red-600 font-semibold'
						"
						@click="(event) => changeStatusFlag(event, question)"
					>
						<FlagIcon class="w-5" />
						<span class="text-sm select-none">Gắn cờ</span>
					</div>
					<div class="text-sm">
						Điểm số:
						<span
							>{{
								(
									answerSelected[question.question] ===
									undefined
										? question.student_answer !== ''
										: !!answerSelected[question.question]
								)
									? 10 / exam?.questions?.length
									: 0
							}}/</span
						>{{ 10 / exam?.questions?.length }}
					</div>
				</div>
				<div class="flex flex-1 flex-col items-start justify-center">
					<h3 class="flex flex-wrap mb-4 font-semibold">
						{{
							`Câu ${
								questions.indexOf(question) +
								(parseInt(page) * 5 - 5) +
								1
							}: ${question.question}`
						}}
					</h3>
					<ul class="flex flex-col gap-2">
						<li
							class="cursor-pointer hover:text-sky-600"
							v-if="!!question.answers[0]"
							@click="
								onAnswer(question.question, question.answers[0])
							"
						>
							<span
								class="w-6 h-6 inline-block rounded-full text-center border-sky-600"
								:class="
									(answerSelected[question.question] ===
									undefined
										? question.student_answer ===
										  question.answers[0]
										: answerSelected[question.question] ===
										  question.answers[0]) && 'border'
								"
								>A.</span
							>
							{{ question.answers[0] }}
						</li>
						<li
							class="cursor-pointer hover:text-sky-600"
							v-if="!!question.answers[1]"
							@click="
								onAnswer(question.question, question.answers[1])
							"
						>
							<span
								class="w-6 h-6 inline-block rounded-full text-center border-sky-600"
								:class="
									(answerSelected[question.question] ===
									undefined
										? question.student_answer ===
										  question.answers[1]
										: answerSelected[question.question] ===
										  question.answers[1]) && 'border'
								"
								>B.</span
							>
							{{ question.answers[1] }}
						</li>
						<li
							class="cursor-pointer hover:text-sky-600"
							v-if="!!question.answers[2]"
							@click="
								onAnswer(question.question, question.answers[2])
							"
						>
							<span
								class="w-6 h-6 inline-block rounded-full text-center border-sky-600"
								:class="
									(answerSelected[question.question] ===
									undefined
										? question.student_answer ===
										  question.answers[2]
										: answerSelected[question.question] ===
										  question.answers[2]) && 'border'
								"
								>C.</span
							>
							{{ question.answers[2] }}
						</li>
						<li
							class="cursor-pointer hover:text-sky-600"
							v-if="!!question.answers[3]"
							@click="
								onAnswer(question.question, question.answers[3])
							"
						>
							<span
								class="w-6 h-6 inline-block rounded-full text-center border-sky-600"
								:class="
									(answerSelected[question.question] ===
									undefined
										? question.student_answer ===
										  question.answers[3]
										: answerSelected[question.question] ===
										  question.answers[3]) && 'border'
								"
								>D.</span
							>
							{{ question.answers[3] }}
						</li>
					</ul>
					<button
						class="text-[13px] hover:text-red-500 ml-1 mt-3"
						@click="clearStudentAnswer(question.question)"
					>
						Xoá đáp án
					</button>
				</div>
			</div>
			<!-- Pagination -->
			<div class="w-full flex items-center justify-between pl-6 xl:pl-48">
				<Button
					severity="info"
					label="Trang trước"
					text
					:class="'ml-[-16px] xl:ml-0'"
					v-if="page !== '1'"
					@click="
						router.push(
							`/classroom/exam/paper/generate/?id=${examID}&page=${
								parseInt(page) - 1
							}`
						)
					"
				/>
				<Button
					severity="info"
					label="Trang sau"
					text
					:class="'ml-auto'"
					v-if="
						parseInt(page) !==
						Math.round(exam?.questions?.length / 5)
					"
					@click="
						router.push(
							`/classroom/exam/paper/generate/?id=${examID}&page=${
								parseInt(page) + 1
							}`
						)
					"
				/>
				<Button
					severity="info"
					label="Hoàn thành bài thi"
					text
					:class="'ml-auto'"
					v-if="
						parseInt(page) ===
						Math.round(exam?.questions?.length / 5)
					"
				/>
			</div>
		</div>
		<div
			class="w-80 h-fit bg-slate-100 sticky top-10 right-0 px-2 py-6 flex flex-col items-center justify-start"
		>
			<h2 class="text-xl text-center font-semibold uppercase">
				{{ exam?.class_name }}
			</h2>
			<p class="mb-3 text-sm">Giáo viên: {{ exam?.lecturer_name }}</p>
			<h4 class="font-semibold">Bài thi: {{ exam?.exam_paper_name }}</h4>
			<ul class="w-full flex flex-wrap gap-1 justify-start mt-10">
				<li
					class="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-400 relative"
					v-for="item in exam?.questions"
					:class="
						exam?.questions.indexOf(item) >=
							parseInt(page) * 5 - 5 &&
						exam?.questions.indexOf(item) < parseInt(page) * 5
							? 'bg-slate-300'
							: 'bg-slate-200'
					"
					@click="changeQuestion(exam?.questions.indexOf(item) + 1)"
				>
					<p
						:class="
							(answerSelected[item.question] === undefined
								? item.student_answer !== ''
								: !!answerSelected[item.question]) &&
							'text-sky-600'
						"
					>
						{{ exam?.questions.indexOf(item) + 1 }}
					</p>
					<BookmarkIcon
						class="w-3 h-3 absolute top-0 right-0 text-red-400 stroke-[3]"
						v-if="
							flags[exam?.questions.indexOf(item)] === undefined
								? item.is_flag
								: flags[exam?.questions.indexOf(item)]
						"
					/>
				</li>
			</ul>
			<h4 class="font-semibold mt-12">Thời gian làm bài</h4>
			<h1 class="text-5xl font-bold mt-4">{{ examTimer }}</h1>
			<Button
				severity="info"
				label="Hoàn thành bài thi"
				text
				:class="'text-sm py-2-important mt-8'"
			/>
			<Button
				severity="info"
				label="Nộp bài và kết thúc"
				text
				:class="'text-sm py-2-important'"
				@click="finishExam"
			/>
		</div>
	</div>
	<div class="h-16"></div>
</template>

<style scoped>
.py-2-important {
	@apply py-2;
}
</style>
