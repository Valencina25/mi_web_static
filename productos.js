// ===================================================================
//  productos.js  ·  Única fuente de productos de la tienda
// -------------------------------------------------------------------
//  La usan TANTO la tienda (index.html) COMO el panel de admin.
//  Así, lo que cambias en el admin se ve también en la tienda.
//
//  IMPORTANTE: los productos se guardan en el navegador (localStorage).
//  Para que los cambios los vea TODO el mundo en internet, usa el botón
//  "⬇️ Descargar productos.js" del admin y sube ese archivo al repositorio.
// ===================================================================

export const DEFAULT_PRODUCTS = [
    { id: 1,  nombre: 'Tomate',           precio: 3,   imagen: 'img/tomate.jpg',    categoria: 'verduras' },
    { id: 2,  nombre: 'Pimiento italiano', precio: 3,   imagen: 'img/pimiento.jpg',  categoria: 'verduras' },
    { id: 3,  nombre: 'Cebollino',        precio: 2,   imagen: 'img/cebollino.jpg', categoria: 'verduras' },
    { id: 4,  nombre: 'Berenjena morada', precio: 2,   imagen: 'img/berejena.jpg',  categoria: 'verduras' },
    { id: 5,  nombre: 'Calabacín',        precio: 2,   imagen: 'img/calabazin.jpg', categoria: 'verduras' },
    { id: 6,  nombre: 'Cebolla',          precio: 2,   imagen: 'img/cebolla.jpg',   categoria: 'verduras' },
    { id: 7,  nombre: 'Lechuga',          precio: 1.5, imagen: 'img/lechuga.jpg',   categoria: 'verduras' },
    { id: 8,  nombre: 'Fresa',            precio: 5,   imagen: 'img/fresa.jpg',     categoria: 'frutas' },
    { id: 9,  nombre: 'Pera',             precio: 2.8, imagen: 'img/pera.jpg',      categoria: 'frutas' }
];

const STORAGE_KEY = 'productos';

// Devuelve la lista de productos (los editados en el admin si existen,
// y si no, los de por defecto del archivo).
export function getProductos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(guardados) && guardados.length > 0) {
            return guardados;
        }
    } catch (e) {
        console.warn('No se pudieron leer los productos guardados:', e);
    }
    return DEFAULT_PRODUCTS.map(p => ({ ...p }));
}

// Guarda la lista de productos en el navegador.
export function saveProductos(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

// Vuelve a los productos de por defecto del archivo.
export function resetProductos() {
    localStorage.removeItem(STORAGE_KEY);
}

// Genera el contenido completo del archivo productos.js a partir de una lista.
export function generarArchivoProductos(lista) {
    const json = JSON.stringify(lista, null, 4)
        // Reajusta la indentación para que encaje dentro del array exportado
        .split('\n')
        .map((linea, i) => (i === 0 ? linea : '    ' + linea))
        .join('\n');
    return `export const DEFAULT_PRODUCTS = ${json};\n`;
}
