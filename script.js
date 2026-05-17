const productosDefault = [
    { id: 1, nombre: 'tomate', precio: 3, imagen: 'img/tomate.jpg', categoria: 'verduras' },
    { id: 2, nombre: 'pimiento italiano', precio: 3, imagen: 'img/pimiento.jpg', categoria: 'verduras' },
    { id: 3, nombre: 'cebollino', precio: 2, imagen: 'img/cebollino.jpg', categoria: 'verduras' },
    { id: 4, nombre: 'berejena morada', precio: 2, imagen: 'img/berejena.jpg', categoria: 'verduras' },
    { id: 5, nombre: 'calabazin', precio: 2, imagen: 'img/calabazin.jpg', categoria: 'verduras' },
    { id: 6, nombre: 'cebolla', precio: 2, imagen: 'img/cebolla.jpg', categoria: 'verduras' },
    { id: 13, nombre: 'lechuga', precio: 1.5, imagen: 'img/lechuga.jpg', categoria: 'verduras' },
    { id: 18, nombre: 'fresa', precio: 5, imagen: 'img/fresa.jpg', categoria: 'frutas' },
    { id: 19, nombre: 'pera', precio: 2.8, imagen: 'img/pera.jpg', categoria: 'frutas' }
];

function getProductos() {
    let productos = JSON.parse(localStorage.getItem('productos'));
    if (!productos || productos.length === 0) {
        localStorage.setItem('productos', JSON.stringify(productosDefault));
        return productosDefault;
    }
    return productos;
}

function getCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

function saveCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function addCarrito(producto) {
    const items = getCarrito();
    const existing = items.find(p => p.id === producto.id);
    if (existing) {
        existing.cantidad = (existing.cantidad || 1) + 1;
    } else {
        items.push({ ...producto, cantidad: 1 });
    }
    saveCarrito(items);
    showMsg('Añadido al carrito');
}

function showMsg(texto) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:20px;right:20px;background:#386641;color:white;padding:10px 20px;border-radius:8px;z-index:9999;';
    div.textContent = texto;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
}

function removeCarrito(id) {
    let items = getCarrito();
    items = items.filter(p => p.id !== id);
    saveCarrito(items);
}

function vaciarCarrito() {
    localStorage.removeItem('carrito');
}

window.addCarritoById = function(id) {
    const p = getProductos().find(x => x.id === id);
    if (p) addCarrito(p);
}

let filtroActual = 'todos';

window.filtrar = function(cat, event) {
    filtroActual = cat;
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    render();
}

function render() {
    const container = document.getElementById('productos-container');
    if (container) {
        const ps = getProductos();
        const filtrados = filtroActual === 'todos' ? ps : ps.filter(p => p.categoria === filtroActual);
        container.innerHTML = filtrados.map(p => `
            <article class="producto">
                <img src="${p.imagen}" alt="${p.nombre}" class="producto-img">
                <div class="producto-content">
                    <h3>${p.nombre}</h3>
                    <p>${p.categoria}</p>
                    <p>${p.precio} €</p>
                    <button class="btn btn-primary" onclick="addCarritoById(${p.id})">Añadir</button>
                </div>
            </article>
        `).join('');
    }
    
    const c = document.getElementById('carrito-container');
    if (c) {
        const items = getCarrito();
        if (items.length === 0) {
            c.innerHTML = '<p>Carrito vacío</p>';
        } else {
            let total = 0;
            c.innerHTML = items.map(p => {
                total += p.precio * (p.cantidad || 1);
                return `<div style="display:flex;justify-content:space-between;padding:5px;border-bottom:1px solid #eee;">
                    <span>${p.nombre} x${p.cantidad || 1}</span>
                    <span>${(p.precio * (p.cantidad || 1)).toFixed(2)} € <button onclick="removeCarrito(${p.id});location.reload();" style="background:red;color:white;border:none;padding:2px 8px;">X</button></span>
                </div>`;
            }).join('') + `<div style="font-weight:bold;margin-top:10px;">Total: ${total.toFixed(2)} €</div>
            <a href="checkout.html" class="btn btn-primary" style="display:block;margin-top:10px;text-align:center;">Continuar</a>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', render);

const sliderWrapper = document.getElementById('slider-wrapper');
if (sliderWrapper) {
    let currentSlide = 0;
    const slides = sliderWrapper.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const progressBar = document.getElementById('slider-progress');
    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
        sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
            dot.setAttribute('aria-selected', i === currentSlide);
        });
        
        if (progressBar) {
            progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
        }
    }

    document.querySelector('.slider-btn.prev')?.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
    });

    document.querySelector('.slider-btn.next')?.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
    });

    let autoSlideInterval;
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    startAutoSlide();
}