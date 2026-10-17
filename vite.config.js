import { defineConfig } from 'vite';

// Configuración para publicar en GitHub Pages.
// La web funciona directamente desde la raíz del repositorio,
// así que el build de Vite es totalmente opcional.
export default defineConfig({
  // Ruta base en GitHub Pages: https://valencina25.github.io/mi_web_static/
  base: '/mi_web_static/',
  root: '.',
  publicDir: false,
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
