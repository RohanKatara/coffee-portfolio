import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/coffee-portfolio/',
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'r3f': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap'],
        },
      },
    },
  },
})
