import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/admin': 'https://inventory-management-server-vue1.onrender.com'
//     },
//     historyApiFallback: true
//   },
  
// });

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/admin': 'https://inventory-management-server-vue1.onrender.com'
    }
  },
  build: {
    outDir: 'dist'
  }
});

