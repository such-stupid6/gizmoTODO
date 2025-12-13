import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // 确保 Electron 可以正确加载资源
  server: {
    port: 5173,
    strictPort: true, // 如果端口被占用，直接报错而不是尝试下一个端口
  }
})
