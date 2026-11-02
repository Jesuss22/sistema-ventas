if (!obtenerToken()) window.location.href = 'index.html';

const modalCaja = document.getElementById('modal');
const mensajeCajaForm = document.getElementById('mensajeForm');

function monedaCaja(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

async function cargarCaja() {
  try {
    const caja = await api('/caja');
    const boton = document.getElementById('btnAbrir');
    if (!caja) {
      document.getElementById('estadoCaja').textContent = 'Caja cerrada';
      document.getElementById('detalleCaja').textContent = 'Abre una caja para comenzar a registrar movimientos.';
      document.getElementById('saldoCaja').textContent = 'S/ 0.00';
      boton.disabled = false;
      return;
    }
    document.getElementById('estadoCaja').textContent = 'Caja abierta';
    document.getElementById('detalleCaja').textContent = `Apertura: ${new Date(caja.abierta_en).toLocaleString()}`;
    document.getElementById('saldoCaja').textContent = monedaCaja(caja.movimientos);
    boton.disabled = true;
    boton.textContent = 'Caja abierta';
  } catch (error) {
    document.getElementById('mensajeCaja').textContent = error.message;
  }
}

document.getElementById('btnAbrir').addEventListener('click', () => {
  mensajeCajaForm.textContent = '';
  modalCaja.classList.add('abierto');
});
document.getElementById('btnCancelar').addEventListener('click', () => modalCaja.classList.remove('abierto'));
modalCaja.addEventListener('click', (event) => {
  if (event.target === modalCaja) modalCaja.classList.remove('abierto');
});
document.getElementById('formCaja').addEventListener('submit', async (event) => {
  event.preventDefault();
  mensajeCajaForm.textContent = '';
  try {
    await api('/caja', {
      method: 'POST',
      body: JSON.stringify({ monto_inicial: Number(document.getElementById('montoInicial').value) }),
    });
    modalCaja.classList.remove('abierto');
    cargarCaja();
  } catch (error) {
    mensajeCajaForm.textContent = error.message;
  }
});

cargarCaja();
