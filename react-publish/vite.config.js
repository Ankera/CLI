import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  transpileDependencies: true,
  publishPath: '/dist',
  plugins: [react()],
})
