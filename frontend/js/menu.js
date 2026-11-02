(function () {
  const nav = document.querySelector('.lateral nav');
  if (!nav) return;

  const paginaActual = window.location.pathname.split('/').pop() || 'dashboard.html';
  const enlaces = [
    ['dashboard.html', 'Inicio', '⌂'],
    ['productos.html', 'Productos', '▦'],
    ['clientes.html', 'Clientes', '♙'],
    ['ventas.html', 'Punto de venta', '🛒'],
    ['proveedores.html', 'Proveedores / Compras', '▤'],
    ['caja.html', 'Caja', '$'],
    ['reportes.html', 'Reportes', '▥'],
    ['usuarios.html', 'Usuarios', '♟'],
  ];

  nav.innerHTML = enlaces.map(([href, texto, icono]) => `
    <a href="${href}" class="${paginaActual === href ? 'activo' : ''}">
      <span class="menu-icono" aria-hidden="true">${icono}</span>
      <span>${texto}</span>
    </a>
  `).join('');

  const lateral = document.querySelector('.lateral');
  let pie = lateral.querySelector('.pie');
  if (!pie) {
    pie = document.createElement('div');
    pie.className = 'pie';
    lateral.appendChild(pie);
  }

  if (!pie.querySelector('.enlace-perfil')) {
    pie.insertAdjacentHTML('afterbegin', `
      <a class="perfil enlace-perfil" href="cuenta.html" title="Ver mi cuenta">
        <div class="avatar" id="avatarUsuario">U</div>
        <div>
          <div class="nombre" id="nombreUsuario">Usuario</div>
          <div class="rol" id="rolUsuario">usuario</div>
          <div class="cuenta-enlace">Mi cuenta</div>
        </div>
      </a>
    `);
  } else if (!pie.querySelector('.cuenta-enlace')) {
    const perfil = pie.querySelector('.enlace-perfil > div:last-child');
    perfil.insertAdjacentHTML('beforeend', '<div class="cuenta-enlace">Mi cuenta</div>');
  }

  if (!pie.querySelector('.btn-salir')) {
    pie.insertAdjacentHTML('beforeend', '<button class="btn-salir" onclick="cerrarSesion()">Cerrar sesión</button>');
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nombre = usuario.nombre || 'Usuario';
  document.getElementById('nombreUsuario').textContent = nombre;
  document.getElementById('rolUsuario').textContent = usuario.rol || 'usuario';
  document.getElementById('avatarUsuario').textContent = nombre.charAt(0).toUpperCase();
})();
