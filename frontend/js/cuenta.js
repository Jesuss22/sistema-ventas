if (!obtenerToken()) {
  window.location.href = 'index.html';
}

const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
const form = document.getElementById('formCuenta');
const mensaje = document.getElementById('mensajeCuenta');

function mostrarUsuario(usuario) {
  const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();
  document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Usuario';
  document.getElementById('rolUsuario').textContent = usuario.rol || 'usuario';
  document.getElementById('avatarUsuario').textContent = inicial;
  document.getElementById('nombreGrande').textContent = usuario.nombre || 'Usuario';
  document.getElementById('rolGrande').textContent = usuario.rol || 'Usuario del sistema';
  document.getElementById('avatarGrande').textContent = inicial;
  document.getElementById('nombre').value = usuario.nombre || '';
  document.getElementById('email').value = usuario.email || '';
}

mostrarUsuario(usuarioGuardado);

async function cargarPerfil() {
  try {
    const usuario = await api('/auth/perfil');
    actualizarUsuario(usuario);
    mostrarUsuario(usuario);
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = 'cuenta-mensaje error';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';
  mensaje.className = 'cuenta-mensaje';

  try {
    const datos = await api('/auth/perfil', {
      method: 'PUT',
      body: JSON.stringify({
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        passwordActual: document.getElementById('passwordActual').value,
        passwordNueva: document.getElementById('passwordNueva').value,
      }),
    });
    actualizarUsuario(datos.usuario);
    mostrarUsuario(datos.usuario);
    document.getElementById('passwordActual').value = '';
    document.getElementById('passwordNueva').value = '';
    mensaje.textContent = datos.mensaje;
    mensaje.className = 'cuenta-mensaje exito';
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.className = 'cuenta-mensaje error';
  }
});

cargarPerfil();
