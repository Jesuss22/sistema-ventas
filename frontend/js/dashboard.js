function moneda(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

async function cargarDashboard() {
  try {
    const [resumen, top, pocoStock] = await Promise.all([
      api('/reportes/resumen?dias=30'),
      api('/reportes/mas-vendidos'),
      api('/reportes/poco-stock'),
    ]);

    document.getElementById('dashboardTotal').textContent = moneda(resumen.total_vendido);
    document.getElementById('dashboardVentas').textContent = resumen.cantidad_ventas;
    document.getElementById('dashboardPromedio').textContent = moneda(resumen.ticket_promedio);
    document.getElementById('dashboardStock').textContent = pocoStock.length;

    document.getElementById('dashboardTop').innerHTML = top.length
      ? top.slice(0, 5).map((producto, indice) => `
        <div class="fila-dashboard"><span class="ranking">${indice + 1}</span><span>${producto.nombre}</span><strong>${producto.unidades_vendidas} un.</strong></div>
      `).join('')
      : '<p class="texto-vacio">Aún no hay ventas registradas.</p>';

    document.getElementById('dashboardRecientes').innerHTML = (resumen.recientes || []).slice(0, 5).map((venta) => `
      <tr><td>#${venta.id}</td><td>${venta.cliente || 'Cliente general'}</td><td>${moneda(venta.total)}</td></tr>
    `).join('') || '<tr><td colspan="3">Aún no hay ventas.</td></tr>';
  } catch (error) {
    document.getElementById('dashboardError').textContent = error.message;
  }
}

cargarDashboard();
