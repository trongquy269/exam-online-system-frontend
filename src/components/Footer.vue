<script setup>
import MailIcon from '../stores/icons/Mail.vue';
</script>

<template>
	<div class="w-full bg-slate-200 px-12 pt-12">
		<div class="w-fit mx-auto">
			<div class="flex items-start justify-center gap-12 mb-6">
				<div class="w-[500px]">
					<h4 class="uppercase font-semibold mb-2">Về chúng tôi</h4>
					<div>
						Kiểm tra kiến thức mọi lúc, mọi nơi! e-Exam cung cấp nền
						tảng thi trực tuyến đáng tin cậy với hệ thống tạo đề đa
						dạng, chấm điểm tự động và giao diện dễ dùng. Phù hợp
						cho giáo viên, tổ chức đào tạo và tự học.
					</div>
				</div>
				<div>
					<h4 class="uppercase font-semibold mb-2">Liên hệ</h4>
					<div class="flex items-center gap-2">
						<MailIcon class="w-6" />
						<span>eexam@online.com</span>
					</div>
				</div>
			</div>
			<div
				class="w-full h-12 flex items-center justify-center border-t border-slate-400"
			>
				Copyright © 2024 All Rights Reserved by e-Exam
			</div>
		</div>
	</div>
</template>
