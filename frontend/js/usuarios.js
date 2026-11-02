if (!obtenerToken()) window.location.href = 'index.html';

const tablaUsuarios = document.getElementById('tablaUsuarios');
const modalUsuario = document.getElementById('modal');
const formUsuario = document.getElementById('formUsuario');
const mensajeUsuario = document.getElementById('mensajeForm');

function escaparUsuario(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

async function cargarUsuarios() {
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.rol !== 'admin') {
      document.getElementById('btnNuevo').disabled = true;
      document.getElementById('mensajeUsuarios').textContent = 'Solo un administrador puede crear usuarios.';
      return;
    }
    const usuarios = await api('/auth/usuarios');
    tablaUsuarios.innerHTML = usuarios.map((perfil) => `<tr><td>${escaparUsuario(perfil.nombre)}</td><td>${escaparUsuario(perfil.email)}</td><td>${escaparUsuario(perfil.rol)}</td></tr>`).join('');
  } catch (error) {
    document.getElementById('mensajeUsuarios').textContent = error.message;
  }
}

document.getElementById('btnNuevo').addEventListener('click', () => {
  formUsuario.reset();
  mensajeUsuario.textContent = '';
  modalUsuario.classList.add('abierto');
});
document.getElementById('btnCancelar').addEventListener('click', () => modalUsuario.classList.remove('abierto'));
modalUsuario.addEventListener('click', (event) => {
  if (event.target === modalUsuario) modalUsuario.classList.remove('abierto');
});
formUsuario.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensajeUsuario.textContent = '';
  try {
    await api('/auth/registrar', {
      method: 'POST',
      body: JSON.stringify({
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        rol: document.getElementById('rol').value,
      }),
    });
    modalUsuario.classList.remove('abierto');
    formUsuario.reset();
    cargarUsuarios();
  } catch (error) {
    mensajeUsuario.textContent = error.message;
  }
});

cargarUsuarios();
