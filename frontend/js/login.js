const form = document.getElementById('formLogin');
const mensaje = document.getElementById('mensaje');

// Si ya hay sesión, ir directo al panel
if (obtenerToken()) {
  window.location.href = 'productos.html';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';

  try {
    const datos = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });

    guardarSesion(datos.token, datos.usuario);
    window.location.href = 'productos.html';
  } catch (error) {
    mensaje.textContent = error.message;
  }
});
