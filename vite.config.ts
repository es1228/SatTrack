import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "/SatTrack/",
	build: {
		target: "esnext",
	},
	worker: {
		format: "es",
	},
});
