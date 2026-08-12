import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  // 相对路径：同时兼容 GitHub Pages 子路径（devcxl.github.io/blackhol/）
  // 与 Cloudflare Pages 根路径部署
  base: "./",
  plugins: [react(), glsl()],
});
