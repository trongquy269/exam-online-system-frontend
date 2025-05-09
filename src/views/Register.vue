<script setup>
import { ref } from 'vue';
import axios from 'axios';
import InputMask from 'primevue/inputmask';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import InputOtp from 'primevue/inputotp';

import EyeIcon from '../stores/icons/Eye.vue';
import EyeFlashIcon from '../stores/icons/EyeFlash.vue';
import isValidEmail from '../stores/utils/isValidEmail';
import isValidPhone from '../stores/utils/isValidPhone';
import isValidPassword from '../stores/utils/isValidPassword';

const steps = ref(3);
const name = ref('');
const dateOfBirth = ref('');
const gender = ref('');
const email = ref('');
const phone = ref('');
const username = ref('');
const password = ref('');
const rePassword = ref('');
const acceptPolicy = ref(true);
const isShowPassword = ref(false);
const isShowRePassword = ref(false);
const nameError = ref('');
const dateOfBirthError = ref('');
const genderError = ref('');
const emailError = ref('');
const phoneError = ref('');
const usernameError = ref('');
const passwordError = ref('');
const rePasswordError = ref('');
const verifyCode = ref('');
const role = ref('');

const router = useRouter();
const toast = useToast();

const genderOptions = ref([
	{ name: 'Nam', value: 'male' },
	{ name: 'Nữ', value: 'female' },
	{ name: 'Khác', value: 'diff' },
]);

const inputStyleRef = ref({
	root: 'h-10 text-black w-full border text-lg outline-none pl-2 rounded-lg',
});

const inputPasswordStyleRef = ref({
	root: 'h-10 text-black w-full border text-lg outline-none pl-2 pr-10 rounded-lg',
});

const submit = () => {
	nameError.value = '';
	dateOfBirthError.value = '';
	genderError.value = '';
	emailError.value = '';
	phoneError.value = '';
	usernameError.value = '';
	passwordError.value = '';
	rePasswordError.value = '';

	const nameValue = name.value.trim();
	const dateOfBirthValue = dateOfBirth.value.trim();
	const genderValue = gender.value.trim();
	const emailValue = email.value.trim();
	const phoneValue = phone.value.trim();
	const usernameValue = username.value.trim();
	const passwordValue = password.value.trim();
	const rePasswordValue = rePassword.value.trim();

	if (!!!nameValue) {
		nameError.value = 'Họ và tên không được để trống';
		return;
	}

	if (!!!dateOfBirthValue) {
		dateOfBirthError.value = 'Ngày tháng năm sinh không hợp lệ';
		return;
	}

	if (!!!genderValue) {
		genderError.value = 'Giờ tính không hợp lệ';
		return;
	}

	if (!!!emailValue) {
		emailError.value = 'Email không được để trống';
		return;
	}

	if (!!!phoneValue) {
		phoneError.value = 'Số điện thoại không được để trống';
		return;
	}

	if (!!!usernameValue) {
		usernameError.value = 'Tên đăng nhập không được bỏ trống';
		return;
	}

	if (!!!passwordValue) {
		passwordError.value = 'Mật khẩu không hợp lệ';
		return;
	}

	if (!isValidEmail(emailValue)) {
		emailError.value = 'Email không hợp lệ';
		return;
	}

	if (!isValidPhone(phoneValue)) {
		phoneError.value = 'Số điện thoại không hợp lệ';
		return;
	}

	if (!isValidPassword(passwordValue)) {
		passwordError.value =
			'Mật khẩu phải có ít nhất 8 ký tự, bao gổm chữ hoa, chữ thường và số';
		return;
	}

	if (passwordValue !== rePasswordValue) {
		rePasswordError.value = 'Mật khẩu xác nhập không khớp nhau';
		return;
	}

	if (!acceptPolicy.value) {
		toast.add({
			severity: 'error',
			summary: 'Lỗi',
			detail: 'Vui lòng đồng ý chính sách và điều khoản của e-Exam để tiến hành tạo tài khoản',
			life: 3000,
		});
		return;
	}

	steps.value = 2;
};

const submitRegister = () => {
	if (role.value === '') {
		toast.add({
			severity: 'error',
			summary: 'Lỗi',
			detail: 'Vui lòng chọn nhu cầu công việc của tài khoản của bạn',
			life: 3000,
		});
		return;
	}

	const nameValue = name.value.trim();
	const dateOfBirthValue = dateOfBirth.value.trim();
	const genderValue = gender.value.trim();
	const emailValue = email.value.trim();
	const phoneValue = phone.value.trim();
	const usernameValue = username.value.trim();
	const passwordValue = password.value.trim();

	axios
		.post(
			'/register',
			{
				name: nameValue,
				dateOfBirth: dateOfBirthValue,
				gender: genderValue,
				email: emailValue,
				phone: phoneValue,
				username: usernameValue,
				password: btoa(passwordValue),
				role: role.value,
			},
			{
				withCredentials: true,
			}
		)
		.then((res) => {
			if (res?.data?.message === 'Success') {
				router.push('/');
			}
		})
		.catch((err) => {
			const message = err.response.data.message;

			if (message === 'Username already exists') {
				usernameError.value = 'Tài khoản đã tồn tại';
			}
		});
};

const getVerifyCode = () => {
	const emailValue = email.value.trim();

	axios
		.post('/request/verify-code', {
			email: emailValue,
		})
		.then((res) => {
			toast.add({
				severity: 'success',
				summary: 'Thành công',
				detail: 'Mã xác nhận đã được gửi',
				life: 3000,
			});
		})
		.catch((err) => {
			toast.add({
				severity: 'error',
				summary: 'Lỗi',
				detail: 'Không thể gửi mã xác nhận',
				life: 3000,
			});
		});
};

const sendVerifyCode = () => {
	const verifyCodeValue = verifyCode.value.trim();

	if (verifyCodeValue.length < 6) {
		toast.add({
			severity: 'error',
			summary: 'Lỗi',
			detail: 'Mã xác thực không đủ ký tự',
			life: 3000,
		});

		return;
	}

	axios
		.post('/check/verify-code', {
			code: verifyCodeValue,
		})
		.then((res) => {
			steps.value = 3;
		})
		.catch((err) => {
			toast.add({
				severity: 'error',
				summary: 'Lỗi',
				detail: 'Mã xác thực không chính xác',
				life: 3000,
			});
		});
};
</script>

<template>
	<div class="w-screen h-screen flex items-center justify-center">
		<!-- Step 1 -->
		<div
			class="md:w-[800px] w-full xl:mt-[-40px] border rounded-xl flex flex-col items-center justify-between p-9 shadow-md overflow-hidden"
			v-if="steps === 1"
		>
			<div class="w-full flex items-center justify-between">
				<div class="w-72 h-72 relative">
					<div
						class="w-52 h-64 absolute left-14 top-0 rounded-full bg-neutral-400"
					></div>
					<div class="rounded-box bg-green-400"></div>
					<div class="rounded-box bg-green-400"></div>
					<div class="rounded-box bg-green-300"></div>
					<div class="rounded-box bg-green-300"></div>
					<div
						class="w-56 h-[17rem] absolute left-8 top-[-26px] rounded-full bg-white"
					></div>
					<div
						class="w-52 h-64 absolute left-10 top-[-20px] rounded-full bg-red-400"
					></div>
					<img
						src="/logo.svg"
						alt="Logo"
						class="w-24 absolute z-1 object-cover top-10 left-2/4 translate-x-[-50%]"
					/>
					<div
						class="text-3xl font-bold absolute z-1 bottom-24 left-2/4 translate-x-[-50%]"
					>
						e-<span class="text-sky-700">Exam</span>
					</div>
				</div>
				<div
					class="w-2/4 h-72 flex flex-col items-center justify-start"
				>
					<h2
						class="w-full text-center text-2xl font-semibold mb-8 uppercase"
					>
						Đăng ký tài khoản
					</h2>
					<div class="w-full flex flex-col mb-6">
						<label
							for="name"
							class="mb-1"
							>Họ và Tên</label
						>
						<InputText
							v-model="name"
							:pt="inputStyleRef"
							id="name"
							placeholder="Nguyễn Văn A"
							:class="{
								'border-red-600': !!nameError,
							}"
						/>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="nameError"
							>{{ nameError }}</span
						>
					</div>
					<div class="w-full flex items-start justify-between gap-2">
						<div class="flex flex-col flex-1">
							<label
								for="dateOfBirth"
								class="mb-1"
								>Ngày tháng năm sinh</label
							>
							<InputMask
								id="dateOfBirth"
								v-model="dateOfBirth"
								placeholder="01/01/2000"
								mask="99/99/9999"
								slotChar="dd/mm/yyyy"
								:pt="inputStyleRef"
								:class="{
									'border-red-600': !!dateOfBirthError,
								}"
							/>
							<span
								class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
								v-if="dateOfBirthError"
								>{{ dateOfBirthError }}</span
							>
						</div>
						<div class="w-28 flex flex-col">
							<label
								for="gender"
								class="mb-1"
								>Giới tính</label
							>
							<select
								name="gender"
								id="gender"
								class="h-10 border rounded-lg bg-white outline-none text-lg cursor-pointer"
								v-model="gender"
								:class="{
									'border-red-600': !!genderError,
								}"
							>
								<option
									v-for="gender in genderOptions"
									:value="gender.value"
									class="cursor-pointer"
								>
									{{ gender.name }}
								</option>
							</select>
							<span
								class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
								v-if="genderError"
								>{{ genderError }}</span
							>
						</div>
					</div>
				</div>
			</div>
			<div class="w-full flex items-start justify-between">
				<div class="w-2/4 pr-4">
					<div class="w-full flex flex-col mb-6">
						<label
							for="email"
							class="mb-1"
							>Địa chỉ Email</label
						>
						<InputText
							v-model="email"
							:pt="inputStyleRef"
							id="email"
							placeholder="example@ex.com"
							:class="{
								'border-red-600': !!emailError,
							}"
						/>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="emailError"
							>{{ emailError }}</span
						>
					</div>
					<div class="w-full flex flex-col mb-6">
						<label
							for="phone"
							class="mb-1"
							>Số điện thoại</label
						>
						<InputMask
							v-model="phone"
							:pt="inputStyleRef"
							id="phone"
							mask="999 999 9999"
							placeholder="091 234 5678"
							:class="{
								'border-red-600': !!phoneError,
							}"
						/>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="phoneError"
							>{{ phoneError }}</span
						>
					</div>
					<div class="w-full flex mb-6 items-center justify-start">
						<input
							type="checkbox"
							id="policy"
							class="w-5 h-5 mr-3 mb-1 cursor-pointer"
							checked
							v-model="acceptPolicy"
						/>
						<label for="policy"
							>Đồng ý với
							<span
								class="underline cursor-pointer italic hover:text-sky-700"
								>chính sách và điều khoản </span
							>của
							<span class="font-semibold">e-Exam</span></label
						>
					</div>
				</div>
				<div class="flex-1">
					<div class="w-full flex flex-col mb-6">
						<label
							for="username"
							class="mb-1"
							>Email đăng nhập</label
						>
						<InputText
							v-model="username"
							:pt="inputStyleRef"
							id="username"
							placeholder="example@ex.com"
							:class="{
								'border-red-600': !!usernameError,
							}"
						/>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="usernameError"
							>{{ usernameError }}</span
						>
					</div>
					<div class="w-full flex flex-col mb-6">
						<label
							for="password"
							class="mb-1"
							>Mật khẩu</label
						>
						<div class="relative">
							<InputText
								:type="!isShowPassword ? 'password' : 'text'"
								v-model="password"
								:pt="inputPasswordStyleRef"
								id="password"
								:class="{
									'border-red-600': !!passwordError,
								}"
							/>
							<EyeIcon
								class="w-5 h-5 absolute top-2/4 right-3 translate-y-[-50%] cursor-pointer"
								@click="isShowPassword = !isShowPassword"
								v-if="isShowPassword"
							/>
							<EyeFlashIcon
								class="w-5 h-5 absolute top-2/4 right-3 translate-y-[-50%] cursor-pointer"
								@click="isShowPassword = !isShowPassword"
								v-if="!isShowPassword"
							/>
						</div>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="passwordError"
							>{{ passwordError }}</span
						>
					</div>
					<div class="w-full flex flex-col mb-6">
						<label
							for="re-password"
							class="mb-1"
							>Nhập lại mật khẩu</label
						>
						<div class="relative">
							<InputText
								:type="!isShowRePassword ? 'password' : 'text'"
								v-model="rePassword"
								:pt="inputPasswordStyleRef"
								id="re-password"
								:class="{
									'border-red-600': !!rePasswordError,
								}"
							/>
							<EyeIcon
								class="w-5 h-5 absolute top-2/4 right-3 translate-y-[-50%] cursor-pointer"
								@click="isShowRePassword = !isShowRePassword"
								v-if="isShowRePassword"
							/>
							<EyeFlashIcon
								class="w-5 h-5 absolute top-2/4 right-3 translate-y-[-50%] cursor-pointer"
								@click="isShowRePassword = !isShowRePassword"
								v-if="!isShowRePassword"
							/>
						</div>
						<span
							class="w-full flex items-center justify-start normal-case text-xs font-normal text-red-600"
							v-if="rePasswordError"
							>{{ rePasswordError }}</span
						>
					</div>
				</div>
			</div>
			<div class="w-full flex items-center justify-center mt-8">
				<Button
					label="Đã có tài khoản"
					class="flex-1 bg-red-400 outline-none mr-4"
					severity="secondary"
					outlined
					@click="router.push('/login')"
				/>
				<Button
					label="Đăng ký"
					class="w-2/4 bg-red-400 outline-none border-none"
					severity="success"
					@click="submit"
				/>
			</div>
		</div>
		<!-- Step 2 -->
		<div
			class="md:w-[800px] w-full xl:mt-[-40px] border rounded-xl flex flex-col items-center justify-between p-9 shadow-md"
			v-if="steps === 2"
		>
			<h2
				class="w-full text-center text-2xl font-semibold mb-8 uppercase"
			>
				Nhập mã xác nhận
			</h2>
			<div class="w-full text-center text-base mb-1">
				Mã kích hoạt đã được gửi đến
				<span class="font-semibold">{{ email }}</span>
			</div>
			<div class="w-full text-center text-base mb-10">
				Vui lòng gửi mã xác nhận để xác nhận đăng ký tài khoản
			</div>
			<InputOtp
				v-model="verifyCode"
				integerOnly
				:length="6"
			/>
			<div class="w-full flex items-center justify-center gap-2 mt-16">
				<Button
					label="Tôi không nhận được mã"
					severity="secondary"
					outlined
					:class="'flex-1'"
					@click="getVerifyCode"
				/>
				<Button
					label="Gửi"
					severity="success"
					:class="'flex-1'"
					@click="sendVerifyCode"
				/>
			</div>
			<div class="mt-10">
				<Button
					label="Quay lại"
					link
					@click="steps = 1"
				/>
			</div>
		</div>
		<!-- Step 3 -->
		<div
			class="md:w-[400px] w-full xl:mt-[-40px] border rounded-xl flex flex-col items-center justify-between p-9 shadow-md"
			v-if="steps === 3"
		>
			<h2
				class="w-full text-center text-2xl font-semibold mb-8 uppercase"
			>
				Công việc của bạn là?
			</h2>
			<div class="w-full flex items-center justify-center gap-2">
				<Button
					label="Học sinh"
					severity="info"
					raised
					:text="role !== 'student'"
					:class="'flex-1'"
					@click="role = 'student'"
				/>
				<Button
					label="Giáo viên"
					severity="help"
					raised
					:text="role !== 'lecturer'"
					:class="'flex-1'"
					@click="role = 'lecturer'"
				/>
			</div>
			<div
				class="w-full flex flex-col items-center justify-center mt-6 text-xs gap-3"
			>
				<p>
					<span class="text-red-600">(*)</span>
					Học sinh: có thể tham gia bất kỳ kỳ thi nào, nhưng không
					được tạo phòng thi
				</p>
				<p>
					<span class="text-red-600">(*)</span>
					Giáo viên: có thể tạo bất kỳ phòng thi nào, nhưng không được
					tham gia kỳ thi
				</p>
			</div>
			<div class="w-full flex items-center justify-center gap-2 mt-16">
				<Button
					label="Quay lại"
					severity="secondary"
					outlined
					:class="'flex-1'"
					@click="steps = 2"
				/>
				<Button
					label="Gửi"
					severity="success"
					:class="'flex-1'"
					@click="submitRegister"
				/>
			</div>
		</div>
		<Toast />
	</div>
</template>

<style scoped>
.rounded-box {
	width: 100%;
	height: 100%;
	border-radius: 64% 36% 60% 40% / 33% 41% 59% 67%;
	position: absolute;
	top: -64px;
	left: -56px;
}

.rounded-box:nth-child(3) {
	width: 100%;
	height: 100%;
	border-radius: 64% 36% 60% 40% / 33% 41% 59% 67%;
	position: absolute;
	top: -92px;
	left: -16px;
}

.rounded-box:nth-child(4) {
	width: 90%;
	height: 90%;
	border-radius: 39% 61% 44% 56% / 30% 41% 59% 70%;
}

.rounded-box:nth-child(5) {
	width: 90%;
	height: 90%;
	border-radius: 39% 61% 44% 56% / 30% 41% 59% 70%;
	top: -110px;
	left: 0px;
}
</style>
