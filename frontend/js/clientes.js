if (!obtenerToken()) {
  window.location.href = 'index.html';
}

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Usuario';
document.getElementById('rolUsuario').textContent = usuario.rol || '';
document.getElementById('avatarUsuario').textContent = (usuario.nombre || 'U').charAt(0).toUpperCase();

const tabla = document.getElementById('tablaClientes');
const modal = document.getElementById('modal');
const form = document.getElementById('formCliente');
const mensajeForm = document.getElementById('mensajeForm');
const buscador = document.getElementById('buscador');
const toast = document.getElementById('toast');

let clientes = [];
let editandoId = null;

const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';

function mostrarToast(texto, esError = false) {
  toast.textContent = texto;
  toast.className = 'toast visible' + (esError ? ' error-toast' : '');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

async function cargarClientes() {
  try {
    clientes = await api('/clientes');
    pintarTabla(clientes);
  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="5" class="error">${escapar(error.message)}</td></tr>`;
  }
}

function pintarTabla(lista) {
  if (lista.length === 0) {
    tabla.innerHTML = '<tr><td colspan="5" class="vacio">No hay clientes para mostrar</td></tr>';
    return;
  }
  tabla.innerHTML = lista.map((c) => `
    <tr>
      <td>
        <div class="producto-celda">
          <div class="producto-inicial">${escapar(c.nombre.charAt(0).toUpperCase())}</div>
          <div class="producto-nombre">${escapar(c.nombre)}</div>
        </div>
      </td>
      <td>${escapar(c.documento || '-')}</td>
      <td>${escapar(c.telefono || '-')}</td>
      <td>${escapar(c.direccion || '-')}</td>
      <td>
        <div class="acciones">
          <button class="btn-icono" title="Editar" onclick="editar(${c.id})">${ICONO_EDITAR}</button>
        </div>
      </td>
    </tr>`).join('');
}

buscador.addEventListener('input', () => {
  const t = buscador.value.toLowerCase();
  pintarTabla(clientes.filter((c) =>
    c.nombre.toLowerCase().includes(t) || (c.documento || '').toLowerCase().includes(t)
  ));
});

document.getElementById('btnNuevo').addEventListener('click', () => {
  editandoId = null;
  form.reset();
  document.getElementById('modalTitulo').textContent = 'Nuevo cliente';
  mensajeForm.textContent = '';
  modal.classList.add('abierto');
});

document.getElementById('btnCancelar').addEventListener('click', () => modal.classList.remove('abierto'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('abierto'); });

function editar(id) {
  const c = clientes.find((x) => x.id === id);
  editandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar cliente';
  document.getElementById('nombre').value = c.nombre;
  document.getElementById('documento').value = c.documento || '';
  document.getElementById('telefono').value = c.telefono || '';
  document.getElementById('direccion').value = c.direccion || '';
  mensajeForm.textContent = '';
  modal.classList.add('abierto');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeForm.textContent = '';

  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    documento: document.getElementById('documento').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
  };

  try {
    if (editandoId) {
      await api('/clientes/' + editandoId, { method: 'PUT', body: JSON.stringify(datos) });
      mostrarToast('Cliente actualizado');
    } else {
      await api('/clientes', { method: 'POST', body: JSON.stringify(datos) });
      mostrarToast('Cliente creado');
    }
    modal.classList.remove('abierto');
    cargarClientes();
  } catch (error) {
    mensajeForm.textContent = error.message;
  }
});

cargarClientes();