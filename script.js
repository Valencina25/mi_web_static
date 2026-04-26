// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBdnHxrIgvUIW_078qF72DPChXmgKvURAw",
    authDomain: "mi-web-static.firebaseapp.com",
    projectId: "mi-web-static",
    storageBucket: "mi-web-static.firebasestorage.app",
    messagingSenderId: "761835869165",
    appId: "1:761835869165:web:64e92e55bbdba3fb614de4"
};

// Firebase SDK
let app, db;

async function initFirebase() {
    if (app) return;
    const { initializeApp: init } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    app = init(firebaseConfig);
    db = getFirestore(app);
}

window.guardarPedido = async function(carrito, total, nombre, telefono, direccion) {
    await initFirebase();
    const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    const pedido = {
        productos: carrito,
        total: total,
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        fecha: new Date().toISOString(),
        estado: 'pendiente'
    };
    
    return addDoc(collection(db, "pedidos"), pedido);
};

window.getPedidos = async function() {
    await initFirebase();
    const { getDocs, collection, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const productosDefault = [
    { id: 2, nombre: 'pimiento italiano', precio: 3.0, imagen: 'uploads/pimiento italiano.jpg', categoria: 'verduras' },
    { id: 3, nombre: 'cebollino', precio: 2.0, imagen: 'uploads/cebollino.jpg', categoria: 'verduras' },
    { id: 4, nombre: 'berejana morada', precio: 2.0, imagen: 'uploads/berejena morada.jpg', categoria: 'verduras' },
    { id: 5, nombre: 'calabazin', precio: 2.0, imagen: 'uploads/calabazin negro.jpg', categoria: 'verduras' },
    { id: 6, nombre: 'cebolla', precio: 2.0, imagen: 'uploads/cebolla.jpg', categoria: 'verduras' },
    { id: 7, nombre: 'puerro', precio: 2.0, imagen: 'uploads/puerro.jpg', categoria: 'verduras' },
    { id: 8, nombre: 'zanahoria', precio: 1.0, imagen: 'uploads/zanohoria.jpg', categoria: 'verduras' },
    { id: 9, nombre: 'aguacate', precio: 5.0, imagen: 'uploads/aguacate.jpg', categoria: 'verduras' },
    { id: 10, nombre: 'espinaca', precio: 2.0, imagen: 'uploads/espinaca.jpg', categoria: 'verduras' },
    { id: 11, nombre: 'patata', precio: 1.0, imagen: 'uploads/patata.jpg', categoria: 'verduras' },
    { id: 12, nombre: 'acelga', precio: 2.0, imagen: 'uploads/acelga.jpg', categoria: 'verduras' },
    { id: 13, nombre: 'lechuga', precio: 1.5, imagen: 'uploads/lechuga.jpg', categoria: 'verduras' },
    { id: 16, nombre: 'ajos', precio: 6.0, imagen: 'uploads/ajos.jpg', categoria: 'verduras' },
    { id: 17, nombre: 'Tomate rosa', precio: 4.0, imagen: 'uploads/tomate rosa.jpg', categoria: 'verduras' },
    { id: 18, nombre: 'fresa', precio: 5.0, imagen: 'uploads/fresa.jpg', categoria: 'frutas' },
    { id: 19, nombre: 'pera', precio: 2.8, imagen: 'uploads/pera.jpg', categoria: 'frutas' }
];

function getProductos() {
    const stored = localStorage.getItem('productos_admin');
    if (stored) return JSON.parse(stored);
    return productosDefault;
}

function getCarrito() {
    const stored = localStorage.getItem('carrito');
    return stored ? JSON.parse(stored) : [];
}

function saveCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function addCarrito(producto) {
    const allProducts = getProductos();
    const fullProduct = allProducts.find(p => p.id === producto.id) || producto;
    const carrito = getCarrito();
    const existing = carrito.find(p => p.id === fullProduct.id);
    if (existing) {
        existing.cantidad = (existing.cantidad || 1) + 1;
    } else {
        carrito.push({ ...fullProduct, cantidad: 1 });
    }
    saveCarrito(carrito);
    showFlash('Añadido al carrito', 'success');
}

function addCarritoById(id) {
    addCarrito({ id: id });
}

function removeCarrito(productoId) {
    let carrito = getCarrito();
    carrito = carrito.filter(p => p.id !== productoId);
    saveCarrito(carrito);
    showFlash('Producto eliminado', 'info');
}

function vaciarCarrito() {
    saveCarrito([]);
    showFlash('Carrito vaciado', 'info');
}

function showFlash(message, category = 'info') {
    const container = document.getElementById('flash-container');
    if (!container) return;
    const flash = document.createElement('div');
    flash.className = `flash flash-${category}`;
    flash.textContent = message;
    container.appendChild(flash);
    setTimeout(() => {
        flash.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => flash.remove(), 300);
    }, 5000);
}

function renderProductos() {
    const container = document.getElementById('productos-container');
    if (!container) return;
    const productos = getProductos();
    container.innerHTML = productos.map(p => `
        <article class="producto" data-categoria="${p.categoria}" role="listitem">
            <img src="${p.imagen}"
                 alt="${p.nombre}"
                 class="producto-img"
                 loading="lazy">
            <div class="producto-content">
                <h3 class="producto-title">${p.nombre}</h3>
                <p class="producto-categoria">${p.categoria}</p>
                <p class="producto-precio">${p.precio} €</p>
                <button class="btn btn-primary" onclick="addCarritoById(${p.id})">Añadir 🛒</button>
            </div>
        </article>
    `).join('');
}

function renderCarrito() {
    const container = document.getElementById('carrito-container');
    if (!container) return;
    
    const carrito = getCarrito();
    const total = document.getElementById('carrito-total');
    const totalElement = document.getElementById('carrito-total-amount');
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-2xl);">
                <p style="font-size: var(--text-xl); margin-bottom: var(--space-lg);">Tu carrito está vacío 🛒</p>
                <a href="index.html" class="btn btn-primary">🌱 Ver Productos</a>
            </div>
        `;
        if (total) total.style.display = 'none';
        return;
    }
    
    if (total) total.style.display = 'block';
    const suma = carrito.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
    if (totalElement) totalElement.textContent = suma.toFixed(2);
    
    container.innerHTML = carrito.map(p => `
        <article class="producto">
            <img src="${p.imagen}"
                 alt="${p.nombre}"
                 class="producto-img"
                 loading="lazy">
            <div class="producto-content">
                <h3 class="producto-title">${p.nombre}</h3>
                <p class="producto-precio">${p.precio} €</p>
                <p>Cantidad: ${p.cantidad || 1}</p>
                <button class="btn btn-outline" onclick="removeCarrito(${p.id}); renderCarrito();">
                    🗑️ Quitar
                </button>
            </div>
        </article>
    `).join('');
}

function checkout() {
    const carrito = getCarrito();
    if (carrito.length === 0) {
        showFlash('Tu carrito está vacío', 'error');
        return;
    }
    const total = carrito.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
    document.getElementById('checkout-section').style.display = 'none';
    document.getElementById('checkout-success').style.display = 'block';
    saveCarrito([]);
}

class Slider {
    constructor(container, wrapper) {
        this.container = container;
        this.wrapper = wrapper;
        this.slides = wrapper.querySelectorAll('.slide');
        this.current = 0;
        this.autoplay = null;
        this.interval = 6000;
        this.isTransitioning = false;
        this.progress = container.querySelector('.slider-progress');

        this.prevBtn = container.querySelector('.prev');
        this.nextBtn = container.querySelector('.next');

        this.init();
    }

    init() {
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.move(-1));
            this.nextBtn.addEventListener('click', () => this.move(1));
        }

        const dots = this.container.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.go(index));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.move(-1);
            if (e.key === 'ArrowRight') this.move(1);
        });

        this.setupTouch();
        this.container.addEventListener('mouseenter', () => this.pause());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());

        this.startAutoplay();
    }

    move(direction) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        this.current += direction;
        if (this.current >= this.slides.length) this.current = 0;
        if (this.current < 0) this.current = this.slides.length - 1;
        this.update();
        this.resetProgress();

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    go(index) {
        if (this.isTransitioning || index === this.current) return;
        this.isTransitioning = true;
        this.current = index;
        this.update();
        this.resetProgress();

        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    update() {
        this.wrapper.style.transform = `translateX(-${this.current * 100}%)`;

        const dots = this.container.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.current);
            dot.setAttribute('aria-selected', i === this.current);
        });
    }

    pause() {
        if (this.autoplay) {
            clearInterval(this.autoplay);
            this.autoplay = null;
        }
    }

    startAutoplay() {
        this.pause();
        this.resetProgress();
        this.autoplay = setInterval(() => this.move(1), this.interval);
    }

    resetProgress() {
        if (this.progress) {
            this.progress.style.transition = 'none';
            this.progress.style.width = '0%';
            setTimeout(() => {
                this.progress.style.transition = `width ${this.interval}ms linear`;
                this.progress.style.width = '100%';
            }, 50);
        }
    }

    setupTouch() {
        let startX = 0;
        let endX = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            this.pause();
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) this.move(1);
                else this.move(-1);
            }

            this.startAutoplay();
        }, { passive: true });
    }
}

class Filtros {
    constructor() {
        this.buttons = document.querySelectorAll('.filtro-btn');
        this.productos = document.querySelectorAll('.producto');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filter(filter);

                this.buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    filter(categoria) {
        this.productos.forEach(p => {
            const matches = categoria === 'todos' || p.dataset.categoria === categoria;
            p.style.display = matches ? '' : 'none';

            if (matches) {
                p.style.animation = 'none';
                p.offsetHeight;
                p.style.animation = 'fadeIn 0.3s ease';
            }
        });
    }
}

class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.menu-toggle');
        this.nav = document.getElementById('main-nav');
        this.init();
    }

    init() {
        if (this.toggle && this.nav) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }
    }

    toggleMenu() {
        const isOpen = this.nav.classList.toggle('active');
        this.toggle.setAttribute('aria-expanded', isOpen);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.slider');
    if (slider) {
        const wrapper = document.getElementById('slider-wrapper');
        new Slider(slider, wrapper);
    }

    renderProductos();
    new Filtros();
    new MobileMenu();

    renderCarrito();

    const contactoForm = document.getElementById('contacto-form');
    if (contactoForm) {
        contactoForm.addEventListener('submit', (e) => {
            const submitBtn = contactoForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;
            }
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
});

const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
}
`;
document.head.appendChild(style);