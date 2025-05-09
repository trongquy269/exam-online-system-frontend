import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		port: process.env.VITE_PORT,
		// https: {
		// 	key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
		// 	cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem')),
		// },
	},
	preview: {
		port: process.env.VITE_PORT,
	},
});
