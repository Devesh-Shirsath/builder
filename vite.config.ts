import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5180 },
  // @phosphor-icons/react is pre-bundled separately and would otherwise pull
  // in a second copy of React, which breaks every hook inside its components.
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom', 'react/jsx-runtime', '@phosphor-icons/react'] },
})
