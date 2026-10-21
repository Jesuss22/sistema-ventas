// Si no hay sesión, volver al login
if (!obtenerToken()) {
  window.location.href = 'index.html';
}

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Usuario';
document.getElementById('rolUsuario').textContent = usuario.rol || '';
document.getElementById('avatarUsuario').textContent = (usuario.nombre || 'U').charAt(0).toUpperCase();

const tabla = document.getElementById('tablaProductos');
const modal = document.getElementById('modal');
const form = document.getElementById('formProducto');
const mensajeForm = document.getElementById('mensajeForm');
const buscador = document.getElementById('buscador');
const toast = document.getElementById('toast');

let productos = [];
let editandoId = null;

const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
const ICONO_BORRAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

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

async function cargarProductos() {
  try {
    productos = await api('/productos');
    actualizarResumen();
    pintarTabla(productos);
  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="6" class="error">${escapar(error.message)}</td></tr>`;
  }
}

function actualizarResumen() {
  const bajos = productos.filter((p) => p.stock <= p.stock_minimo).length;
  const valor = productos.reduce((s, p) => s + p.stock * Number(p.precio_compra), 0);
  document.getElementById('kpiTotal').textContent = productos.length;
  document.getElementById('kpiBajo').textContent = bajos;
  document.getElementById('kpiValor').textContent = dinero(valor);
}

function estadoProducto(p) {
  if (p.stock === 0) return '<span class="etiqueta-estado estado-agotado">Agotado</span>';
  if (p.stock <= p.stock_minimo) return '<span class="etiqueta-estado estado-bajo">Stock bajo</span>';
  return '<span class="etiqueta-estado estado-ok">Disponible</span>';
}

function pintarTabla(lista) {
  if (lista.length === 0) {
    tabla.innerHTML = '<tr><td colspan="6" class="vacio">No hay productos para mostrar</td></tr>';
    return;
  }

  tabla.innerHTML = lista.map((p) => `
    <tr>
      <td>
        <div class="producto-celda">
          <div class="producto-inicial">${escapar(p.nombre.charAt(0).toUpperCase())}</div>
          <div>
            <div class="producto-nombre">${escapar(p.nombre)}</div>
            <div class="producto-codigo">Cód. ${escapar(p.codigo || '-')}</div>
          </div>
        </div>
      </td>
      <td class="dinero">${dinero(p.precio_compra)}</td>
      <td class="dinero"><strong>${dinero(p.precio_venta)}</strong></td>
      <td>${p.stock}</td>
      <td>${estadoProducto(p)}</td>
      <td>
        <div class="acciones">
          <button class="btn-icono" title="Editar" onclick="editar(${p.id})">${ICONO_EDITAR}</button>
          <button class="btn-icono peligro" title="Desactivar" onclick="desactivar(${p.id})">${ICONO_BORRAR}</button>
        </div>
      </td>
    </tr>`).join('');
}

// Buscador
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();
  pintarTabla(productos.filter((p) =>
    p.nombre.toLowerCase().includes(texto) || (p.codigo || '').toLowerCase().includes(texto)
  ));
});

// Abrir ventana para crear
document.getElementById('btnNuevo').addEventListener('click', () => {
  editandoId = null;
  form.reset();
  document.getElementById('stock_minimo').value = 5;
  document.getElementById('modalTitulo').textContent = 'Nuevo producto';
  mensajeForm.textContent = '';
  modal.classList.add('abierto');
});

document.getElementById('btnCancelar').addEventListener('click', () => modal.classList.remove('abierto'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('abierto'); });

// Abrir ventana para editar
function editar(id) {
  const p = productos.find((x) => x.id === id);
  editandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar producto';
  document.getElementById('codigo').value = p.codigo || '';
  document.getElementById('nombre').value = p.nombre;
  document.getElementById('precio_compra').value = p.precio_compra;
  document.getElementById('precio_venta').value = p.precio_venta;
  document.getElementById('stock').value = p.stock;
  document.getElementById('stock_minimo').value = p.stock_minimo;
  mensajeForm.textContent = '';
  modal.classList.add('abierto');
}

// Guardar (crear o editar)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeForm.textContent = '';

  const datos = {
    codigo: document.getElementById('codigo').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    precio_compra: Number(document.getElementById('precio_compra').value),
    precio_venta: Number(document.getElementById('precio_venta').value),
    stock: Number(document.getElementById('stock').value),
    stock_minimo: Number(document.getElementById('stock_minimo').value),
  };

  try {
    if (editandoId) {
      await api('/productos/' + editandoId, { method: 'PUT', body: JSON.stringify(datos) });
      mostrarToast('Producto actualizado');
    } else {
      await api('/productos', { method: 'POST', body: JSON.stringify(datos) });
      mostrarToast('Producto creado');
    }
    modal.classList.remove('abierto');
    cargarProductos();
  } catch (error) {
    mensajeForm.textContent = error.message;
  }
});

async function desactivar(id) {
  if (!confirm('¿Desactivar este producto?')) return;
  try {
    await api('/productos/' + id, { method: 'DELETE' });
    mostrarToast('Producto desactivado');
    cargarProductos();
  } catch (error) {
    mostrarToast(error.message, true);
  }
}

cargarProductos();
