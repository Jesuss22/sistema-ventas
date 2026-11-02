const API_URL = '/api';

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

function actualizarUsuario(usuario) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Hace peticiones a la API enviando el token automáticamente
async function api(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(obtenerToken() ? { Authorization: 'Bearer ' + obtenerToken() } : {}),
        ...(opciones.headers || {}),
      },
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el backend. Verifica que esté ejecutándose en http://localhost:3000.');
  }

  const tipoContenido = respuesta.headers.get('content-type') || '';
  if (!tipoContenido.includes('application/json')) {
    throw new Error(
      `La API devolvió ${respuesta.status} ${respuesta.statusText} en ${API_URL + ruta}. ` +
      'Verifica que el frontend se esté ejecutando desde el servidor backend y que la URL de la API sea correcta.'
    );
  }

  const datos = await respuesta.json();

  if (respuesta.status === 401 && obtenerToken()) {
    cerrarSesion(); // token vencido
  }
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error en la petición');
  }
  return datos;
}
