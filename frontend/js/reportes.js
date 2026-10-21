if (!obtenerToken()) {
  window.location.href = 'index.html';
}

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
document.getElementById('nombreUsuario').textContent = usuario.nombre || 'Usuario';
document.getElementById('rolUsuario').textContent = usuario.rol || '';
document.getElementById('avatarUsuario').textContent = (usuario.nombre || 'U').charAt(0).toUpperCase();

function dinero(n) {
  return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function formatoFecha(f) {
  return new Date(f).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

async function cargarResumen() {
  const dias = document.getElementById('periodo').value;
  const r = await api('/reportes/resumen?dias=' + dias);

  document.getElementById('kpiVentas').textContent = r.cantidad_ventas;
  document.getElementById('kpiTotal').textContent = dinero(r.total_vendido);
  document.getElementById('kpiPromedio').textContent = dinero(r.ticket_promedio);

  document.getElementById('tablaRecientes').innerHTML = r.recientes.length
    ? r.recientes.map((v) => `
      <tr>
        <td><strong>#${v.id}</strong></td>
        <td>${formatoFecha(v.fecha)}</td>
        <td>${escapar(v.cliente || 'Cliente general')}</td>
        <td>${escapar(v.vendedor)}</td>
        <td class="dinero"><strong>${dinero(v.total)}</strong></td>
      </tr>`).join('')
    : '<tr><td colspan="5" class="vacio">Aún no hay ventas</td></tr>';
}

async function cargarMasVendidos() {
  const lista = await api('/reportes/mas-vendidos');
  const grafico = document.getElementById('grafico');

  if (lista.length === 0) {
    grafico.innerHTML = '<p class="vacio">Aún no hay ventas</p>';
    return;
  }

  const max = Math.max(...lista.map((p) => Number(p.unidades_vendidas)));
  grafico.innerHTML = lista.map((p) => `
    <div class="barra-fila">
      <div class="barra-info">
        <span>${escapar(p.nombre)}</span>
        <span><strong>${p.unidades_vendidas}</strong> uds · ${dinero(p.total_generado)}</span>
      </div>
      <div class="barra-fondo">
        <div class="barra-relleno" style="width:${(Number(p.unidades_vendidas) / max) * 100}%"></div>
      </div>
    </div>`).join('');
}

async function cargarPocoStock() {
  const poco = await api('/reportes/poco-stock');
  document.getElementById('kpiBajo').textContent = poco.length;
  document.getElementById('tablaPocoStock').innerHTML = poco.length
    ? poco.map((p) => `
      <tr>
        <td><strong>${escapar(p.nombre)}</strong></td>
        <td><span class="etiqueta-estado ${p.stock === 0 ? 'estado-agotado' : 'estado-bajo'}">${p.stock}</span></td>
        <td>${p.stock_minimo}</td>
      </tr>`).join('')
    : '<tr><td colspan="3" class="vacio">Todo el stock está bien ✅</td></tr>';
}

async function cargar() {
  try {
    await Promise.all([cargarResumen(), cargarMasVendidos(), cargarPocoStock()]);
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById('periodo').addEventListener('change', () => cargarResumen().catch((e) => alert(e.message)));

cargar();