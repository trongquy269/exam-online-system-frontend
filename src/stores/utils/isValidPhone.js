function isValidPhone(phone) {
	return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(phone);
}

export default isValidPhone;
