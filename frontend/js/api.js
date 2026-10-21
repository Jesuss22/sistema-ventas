const API_URL = 'http://localhost:3000/api';

function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function obtenerToken() {
  return localStorage.getItem('token');
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Hace peticiones a la API enviando el token automáticamente
async function api(ruta, opciones = {}) {
  const respuesta = await fetch(API_URL + ruta, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(obtenerToken() ? { Authorization: 'Bearer ' + obtenerToken() } : {}),
      ...(opciones.headers || {}),
    },
  });

  const datos = await respuesta.json();

  if (respuesta.status === 401 && obtenerToken()) {
    cerrarSesion(); // token vencido
  }
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error en la petición');
  }
  return datos;
}
