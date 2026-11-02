const pool = require('../db');
const { responderError } = require('../utils/error-response');

exports.estado = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COALESCE(SUM(
        CASE WHEN m.tipo IN ('ingreso', 'venta') THEN m.monto
             WHEN m.tipo IN ('egreso', 'compra') THEN -m.monto ELSE 0 END
      ), 0) AS movimientos
       FROM cajas c
       LEFT JOIN movimientos_caja m ON m.caja_id = c.id
       WHERE c.estado = 'abierta'
       GROUP BY c.id
       ORDER BY c.id DESC
       LIMIT 1`
    );
    res.json(rows[0] || null);
  } catch (error) {
    responderError(res, error, 'No se pudo consultar el estado de caja');
  }
};

exports.abrir = async (req, res) => {
  try {
    const montoInicial = Number(req.body?.monto_inicial ?? 0);
    if (!Number.isFinite(montoInicial) || montoInicial < 0) {
      return res.status(400).json({ error: 'El monto inicial debe ser mayor o igual a 0' });
    }

    const [abiertas] = await pool.query(
      "SELECT id FROM cajas WHERE estado = 'abierta' LIMIT 1"
    );
    if (abiertas.length > 0) {
      return res.status(400).json({ error: 'Ya existe una caja abierta' });
    }

    const [result] = await pool.query(
      'INSERT INTO cajas (usuario_apertura_id, monto_inicial) VALUES (?, ?)',
      [req.usuario.id, montoInicial]
    );
    await pool.query(
      `INSERT INTO movimientos_caja (caja_id, usuario_id, tipo, concepto, monto)
       VALUES (?, ?, 'ingreso', 'Saldo inicial', ?)`,
      [result.insertId, req.usuario.id, montoInicial]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Caja abierta' });
  } catch (error) {
    responderError(res, error, 'No se pudo abrir la caja');
  }
};
