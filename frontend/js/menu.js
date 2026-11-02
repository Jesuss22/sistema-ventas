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
})();
