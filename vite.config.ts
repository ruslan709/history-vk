import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// ВАЖНО: base = имя репозитория на GitHub Pages.
// Сайт публикуется по адресу https://<логин>.github.io/history-vk/
// поэтому base = '/history-vk/'. Если переименуешь репозиторий — поменяй здесь.
export default defineConfig({
  base: '/history-vk/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
