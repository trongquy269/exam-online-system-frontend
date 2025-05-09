import { createRouter, createWebHashHistory } from 'vue-router';

import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Classroom from './views/Classroom.vue';
import Exam from './views/Exam.vue';
import GenerateExamPaper from './views/GenerateExamPaper.vue';

const routes = [
	{ path: '/login', component: Login },
	{ path: '/register', component: Register },
	{ path: '/forgot-password', component: Login },
	{ path: '/classroom', component: Classroom },
	{ path: '/classroom/exam', component: Exam },
	{ path: '/classroom/exam/paper/generate/', component: GenerateExamPaper },
	{ path: '/', component: Home },
];

const router = createRouter({
	history: createWebHashHistory(import.meta.env.VITE_BASE_URL),
	routes,
});

export default router;
