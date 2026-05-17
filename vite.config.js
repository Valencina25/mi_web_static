import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html',
        login: './login.html',
        checkout: './checkout.html',
        carrito: './carrito.html'
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
