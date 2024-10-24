import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import fs from "fs/promises";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		cssInjectedByJsPlugin({
			styleId: process.env.npm_package_name,
			injectCodeFunction: function injectCodeCustomRunTimeFunction(
				cssCode: string,
				options: any,
			) {
				if (!globalThis.pluginStyle) {
					globalThis.pluginStyle = {};
				}
				globalThis.pluginStyle[options.styleId] = cssCode;
			},
		}),
		{
			name: "index-html-config",
			async transformIndexHtml() {
				if (process.env.VITE_EXTERNAL_PLUGINS !== "true") {
					return await fs.readFile("index-restricted.html", "utf-8");
				}
			},
		},
	],
	server: {
		port: 54187,
	},
	build: {
		lib: {
			entry: "src/plugin.ts",
			fileName:
				process.env.VITE_EXTERNAL_PLUGINS === "true"
					? "index"
					: "index-restricted",
			formats: ["es"],
		},
	},
});
