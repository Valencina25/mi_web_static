// ===================================================================
//  script.js  ·  Lógica de la tienda (productos, carrito y slider)
// ===================================================================
import { getProductos } from './productos.js?v=2';

const CART_KEY = 'carrito';

/* ----------------------------- Avisos ----------------------------- */

function showMsg(texto, color = '#386641') {
    const div = document.createElement('div');
    div.textContent = texto;
    div.style.cssText =
        `position:fixed;top:20px;right:20px;background:${color};color:#fff;` +
        'padding:12px 20px;border-radius:8px;z-index:9999;' +
        'box-shadow:0 4px 12px rgba(0,0,0,.25);font-family:inherit;';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2200);
}

/* ----------------------------- Carrito ---------------------------- */

function getCarrito() {
    try {
        const c = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(c) ? c : [];
    } catch (e) {
        return [];
    }
}

function saveCarrito(carrito) {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

function totalCarrito() {
    return getCarrito().reduce(
        (total, p) => total + (Number(p.precio) || 0) * (p.cantidad || 1),
        0
    );
}

function addCarritoById(id) {
    const producto = getProductos().find(p => String(p.id) === String(id));
    if (!producto) return;

    const items = getCarrito();
    const existente = items.find(i => String(i.id) === String(id));

    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        items.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio) || 0,
            imagen: producto.imagen,
            categoria: producto.categoria,
            cantidad: 1
        });
    }

    saveCarrito(items);
    actualizarContador();
    showMsg('✅ ' + producto.nombre + ' añadido al carrito');
}

function removeCarrito(id) {
    saveCarrito(getCarrito().filter(p => String(p.id) !== String(id)));
    renderCarrito();
    actualizarContador();
}

function cambiarCantidad(id, delta) {
    const items = getCarrito();
    const item = items.find(p => String(p.id) === String(id));
    if (!item) return;

    item.cantidad = (item.cantidad || 1) + delta;

    if (item.cantidad <= 0) {
        saveCarrito(items.filter(p => String(p.id) !== String(id)));
    } else {
        saveCarrito(items);
    }

    renderCarrito();
    actualizarContador();
}

function vaciarCarrito() {
    localStorage.removeItem(CART_KEY);
    renderCarrito();
    actualizarContador();
}

// Muestra el número de artículos en el icono del carrito (si existe).
function actualizarContador() {
    const n = getCarrito().reduce((a, p) => a + (p.cantidad || 1), 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = n;
        el.style.display = n > 0 ? 'inline-block' : 'none';
    });
}

/* ---------------------------- Productos --------------------------- */

let filtroActual = 'todos';

function renderProductos(categoria) {
    const cont = document.getElementById('productos-container');
    if (!cont) return;

    filtroActual = categoria || filtroActual;

    const productos = getProductos().filter(
        p => filtroActual === 'todos' || p.categoria === filtroActual
    );

    if (productos.length === 0) {
        cont.innerHTML = '<p style="grid-column:1/-1;text-align:center;">No hay productos en esta categoría.</p>';
        return;
    }

    cont.innerHTML = productos.map(p => `
        <article class="producto">
            <img src="${p.imagen}" alt="${p.nombre}" class="producto-img" loading="lazy"
                 onerror="this.onerror=null;this.src='img/juan.jpg'">
            <div class="producto-content">
                <h3>${p.nombre}</h3>
                <p>${p.categoria}</p>
                <p class="producto-precio">${(Number(p.precio) || 0).toFixed(2)} €</p>
                <button class="btn btn-primary" data-add="${p.id}">Añadir</button>
            </div>
        </article>
    `).join('');
}

/* ----------------------------- Carrito (página) ------------------- */

function renderCarrito() {
    const cont = document.getElementById('carrito-container');
    if (!cont) return;

    const items = getCarrito();
    const totalEl = document.getElementById('carrito-total-amount');
    const totalBox = document.getElementById('carrito-total');
    const checkoutLink = document.getElementById('checkout-link');

    if (items.length === 0) {
        cont.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px;">
                <p style="font-size:1.2rem;">Tu carrito está vacío 🛒</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:20px;display:inline-block;">🌱 Ver productos</a>
            </div>`;
        if (totalBox) totalBox.style.display = 'none';
        if (checkoutLink) checkoutLink.style.display = 'none';
        return;
    }

    if (totalBox) totalBox.style.display = 'block';
    if (checkoutLink) checkoutLink.style.display = 'inline-block';

    cont.innerHTML = items.map(p => `
        <div class="carrito-item" style="display:flex;align-items:center;gap:15px;padding:12px;border-bottom:1px solid #eee;width:100%;">
            <img src="${p.imagen}" alt="${p.nombre}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">
            <div style="flex:1;text-align:left;">
                <strong>${p.nombre}</strong><br>
                <small>${(Number(p.precio) || 0).toFixed(2)} € / unidad</small>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <button class="btn btn-outline" data-menos="${p.id}" style="padding:2px 10px;">−</button>
                <span>${p.cantidad || 1}</span>
                <button class="btn btn-outline" data-mas="${p.id}" style="padding:2px 10px;">+</button>
            </div>
            <div style="min-width:90px;text-align:right;font-weight:bold;">
                ${((Number(p.precio) || 0) * (p.cantidad || 1)).toFixed(2)} €
            </div>
            <button class="btn btn-outline" data-remove="${p.id}" title="Quitar"
                    style="color:#c0392b;border-color:#c0392b;padding:6px 10px;">🗑️</button>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = totalCarrito().toFixed(2);
}

/* ------------------------- Delegación de clics -------------------- */

document.addEventListener('click', e => {
    const t = e.target.closest('[data-add],[data-remove],[data-mas],[data-menos],[data-filter],[data-vaciar]');
    if (!t) return;

    if (t.dataset.vaciar !== undefined)  vaciarCarrito();
    if (t.dataset.add !== undefined)     addCarritoById(t.dataset.add);
    if (t.dataset.remove !== undefined)  removeCarrito(t.dataset.remove);
    if (t.dataset.mas !== undefined)     cambiarCantidad(t.dataset.mas, 1);
    if (t.dataset.menos !== undefined)   cambiarCantidad(t.dataset.menos, -1);

    if (t.dataset.filter !== undefined) {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        t.classList.add('active');
        renderProductos(t.dataset.filter);
    }
});

/* ------------------------------- Slider --------------------------- */

function initSlider() {
    const wrapper = document.querySelector('.slider-wrapper');
    if (!wrapper) return;

    const slides = wrapper.querySelectorAll('.slide');
    const total = slides.length;
    if (total === 0) return;

    const progress = document.querySelector('#slider-progress');
    const dots = document.querySelectorAll('.dot');
    let actual = 0;

    const ir = index => {
        actual = ((index % total) + total) % total;
        wrapper.style.transform = `translateX(-${actual * 100}%)`;
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === actual);
            d.setAttribute('aria-selected', i === actual);
        });
        if (progress) progress.style.width = `${((actual + 1) / total) * 100}%`;
    };

    document.querySelector('.slider-btn.prev')?.addEventListener('click', () => { ir(actual - 1); reiniciar(); });
    document.querySelector('.slider-btn.next')?.addEventListener('click', () => { ir(actual + 1); reiniciar(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { ir(i); reiniciar(); }));

    let intervalo;
    const auto = () => { intervalo = setInterval(() => ir(actual + 1), 5000); };
    const reiniciar = () => { clearInterval(intervalo); auto(); };

    auto();
}

/* ------------------------------- Menú móvil ----------------------- */

function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-list');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.setAttribute('aria-expanded', nav.classList.contains('active'));
    });
}

/* ------------------------------- Arranque ------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    renderProductos();
    renderCarrito();
    actualizarContador();
    initSlider();
    initMenu();
});

// Funciones expuestas por si algún enlace antiguo las llama desde el HTML
window.addCarritoById = addCarritoById;
window.vaciarCarrito = vaciarCarrito;
window.renderCarrito = renderCarrito;
