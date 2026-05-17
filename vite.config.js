import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        login: resolve(__dirname, 'login.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        carrito: resolve(__dirname, 'carrito.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
