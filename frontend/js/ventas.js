if (!obtenerToken()) {
  window.location.href = 'index.html';
}

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Usuario';
document.getElementById('rolUsuario').textContent = usuario.rol || '';
document.getElementById('avatarUsuario').textContent = (usuario.nombre || 'U').charAt(0).toUpperCase();

const catalogo = document.getElementById('catalogo');
const carritoItems = document.getElementById('carritoItems');
const totalEl = document.getElementById('total');
const btnCobrar = document.getElementById('btnCobrar');
const mensajeVenta = document.getElementById('mensajeVenta');
const buscador = document.getElementById('buscador');
const selectCliente = document.getElementById('cliente');
const toast = document.getElementById('toast');

let productos = [];
let carrito = []; // { id, nombre, precio, cantidad, stock }

function mostrarToast(texto, esError = false) {
  toast.textContent = texto;
  toast.className = 'toast visible' + (esError ? ' error-toast' : '');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

function dinero(n) {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

async function cargarDatos() {
  try {
    productos = await api('/productos');
    pintarCatalogo(productos);

    const clientes = await api('/clientes');
    clientes.forEach((c) => {
      const op = document.createElement('option');
      op.value = c.id;
      op.textContent = c.nombre;
      selectCliente.appendChild(op);
    });
  } catch (error) {
    catalogo.innerHTML = `<p class="error">${escapar(error.message)}</p>`;
  }
}

function pintarCatalogo(lista) {
  if (lista.length === 0) {
    catalogo.innerHTML = '<p class="vacio">No hay productos</p>';
    return;
  }
  catalogo.innerHTML = lista.map((p) => `
    <button class="prod-card ${p.stock === 0 ? 'agotado' : ''}" ${p.stock === 0 ? 'disabled' : ''} onclick="agregar(${p.id})">
      <div class="producto-inicial">${escapar(p.nombre.charAt(0).toUpperCase())}</div>
      <div class="prod-nombre">${escapar(p.nombre)}</div>
      <div class="prod-precio">${dinero(p.precio_venta)}</div>
      <div class="prod-stock">${p.stock === 0 ? 'Agotado' : 'Stock: ' + p.stock}</div>
    </button>`).join('');
}

buscador.addEventListener('input', () => {
  const t = buscador.value.toLowerCase();
  pintarCatalogo(productos.filter((p) =>
    p.nombre.toLowerCase().includes(t) || (p.codigo || '').toLowerCase().includes(t)
  ));
});

// Enter con un código exacto lo agrega directo (útil con lector de código de barras)
buscador.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const p = productos.find((x) => (x.codigo || '').toLowerCase() === buscador.value.trim().toLowerCase());
  if (p) {
    agregar(p.id);
    buscador.value = '';
    pintarCatalogo(productos);
  }
});

function agregar(id) {
  const p = productos.find((x) => x.id === id);
  const item = carrito.find((c) => c.id === id);

  if (item) {
    if (item.cantidad >= p.stock) return mostrarToast('No hay más stock de ' + p.nombre, true);
    item.cantidad++;
  } else {
    carrito.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio_venta), cantidad: 1, stock: p.stock });
  }
  pintarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((c) => c.id === id);
  const nueva = item.cantidad + delta;
  if (nueva > item.stock) return mostrarToast('No hay más stock', true);
  if (nueva <= 0) carrito = carrito.filter((c) => c.id !== id);
  else item.cantidad = nueva;
  pintarCarrito();
}

function quitar(id) {
  carrito = carrito.filter((c) => c.id !== id);
  pintarCarrito();
}

function pintarCarrito() {
  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="vacio">El carrito está vacío</p>';
  } else {
    carritoItems.innerHTML = carrito.map((c) => `
      <div class="item">
        <div class="item-info">
          <div class="item-nombre">${escapar(c.nombre)}</div>
          <div class="item-precio">${dinero(c.precio)} c/u</div>
        </div>
        <div class="cantidad">
          <button onclick="cambiarCantidad(${c.id}, -1)">−</button>
          <span>${c.cantidad}</span>
          <button onclick="cambiarCantidad(${c.id}, 1)">+</button>
        </div>
        <div class="item-sub">${dinero(c.precio * c.cantidad)}</div>
        <button class="quitar" title="Quitar" onclick="quitar(${c.id})">×</button>
      </div>`).join('');
  }

  const total = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);
  totalEl.textContent = dinero(total);
  btnCobrar.disabled = carrito.length === 0;
}

document.getElementById('btnVaciar').addEventListener('click', () => {
  carrito = [];
  pintarCarrito();
});

btnCobrar.addEventListener('click', async () => {
  mensajeVenta.textContent = '';
  btnCobrar.disabled = true;

  try {
    const venta = await api('/ventas', {
      method: 'POST',
      body: JSON.stringify({
        cliente_id: selectCliente.value || null,
        items: carrito.map((c) => ({ producto_id: c.id, cantidad: c.cantidad })),
      }),
    });

    mostrarToast(`Venta #${venta.id} registrada: ${dinero(venta.total)}`);
    carrito = [];
    selectCliente.value = '';
    pintarCarrito();
    productos = await api('/productos'); // refresca el stock
    pintarCatalogo(productos);
  } catch (error) {
    mensajeVenta.textContent = error.message;
    btnCobrar.disabled = false;
  }
});

pintarCarrito();
cargarDatos();