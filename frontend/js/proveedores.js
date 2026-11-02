if (!obtenerToken()) window.location.href = 'index.html';

const tablaProveedores = document.getElementById('tablaProveedores');
const modalProveedor = document.getElementById('modal');
const formProveedor = document.getElementById('formProveedor');
const mensajeProveedor = document.getElementById('mensajeForm');

function escaparProveedor(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

async function cargarProveedores() {
  try {
    const proveedores = await api('/proveedores');
    tablaProveedores.innerHTML = proveedores.length
      ? proveedores.map((proveedor) => `<tr><td>${escaparProveedor(proveedor.nombre)}</td><td>${escaparProveedor(proveedor.documento || '-')}</td><td>${escaparProveedor(proveedor.telefono || '-')}</td><td>${escaparProveedor(proveedor.email || '-')}</td><td>${escaparProveedor(proveedor.direccion || '-')}</td></tr>`).join('')
      : '<tr><td colspan="5">No hay proveedores registrados.</td></tr>';
  } catch (error) {
    document.getElementById('mensajeProveedores').textContent = error.message;
  }
}

document.getElementById('btnNuevo').addEventListener('click', () => {
  formProveedor.reset();
  mensajeProveedor.textContent = '';
  modalProveedor.classList.add('abierto');
});
document.getElementById('btnCancelar').addEventListener('click', () => modalProveedor.classList.remove('abierto'));
modalProveedor.addEventListener('click', (event) => {
  if (event.target === modalProveedor) modalProveedor.classList.remove('abierto');
});
formProveedor.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensajeProveedor.textContent = '';
  try {
    await api('/proveedores', {
      method: 'POST',
      body: JSON.stringify({
        nombre: document.getElementById('nombre').value.trim(),
        documento: document.getElementById('documento').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
      }),
    });
    modalProveedor.classList.remove('abierto');
    cargarProveedores();
  } catch (error) {
    mensajeProveedor.textContent = error.message;
  }
});

cargarProveedores();
