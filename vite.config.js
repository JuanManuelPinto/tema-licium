import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
     plugins: [vue()],
     server: {
          proxy: {
               '/api': {
                    // target: 'https://arcadium.cluster24.libnamic.eu/',
                    target: 'https://expobus.licium.libnamic.com/',
                    changeOrigin: true,
                    secure: false,
               }
          }
     }
})
