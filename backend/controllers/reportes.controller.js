const pool = require('../db');

// Ventas del día (cantidad de ventas y total vendido hoy)
exports.ventasHoy = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cantidad_ventas, COALESCE(SUM(total), 0) AS total_vendido
       FROM ventas
       WHERE DATE(fecha) = CURDATE()`
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Productos más vendidos (top 10)
exports.masVendidos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.nombre,
              SUM(d.cantidad) AS unidades_vendidas,
              SUM(d.subtotal) AS total_generado
       FROM detalle_venta d
       JOIN productos p ON d.producto_id = p.id
       GROUP BY p.id, p.nombre
       ORDER BY unidades_vendidas DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Productos con poco stock
exports.pocoStock = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, codigo, nombre, stock, stock_minimo
       FROM productos
       WHERE activo = 1 AND stock <= stock_minimo
       ORDER BY stock ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resumen por periodo: ?dias=1 (hoy), 7, 30
exports.resumen = async (req, res) => {
  try {
    const dias = Math.min(Math.max(parseInt(req.query.dias) || 1, 1), 365);

    const [[resumen]] = await pool.query(
      `SELECT COUNT(*) AS cantidad_ventas,
              COALESCE(SUM(total), 0) AS total_vendido,
              COALESCE(AVG(total), 0) AS ticket_promedio
       FROM ventas
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY) + INTERVAL 1 DAY`,
      [dias]
    );

    const [recientes] = await pool.query(
      `SELECT v.id, v.total, v.fecha, c.nombre AS cliente, u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       JOIN usuarios u ON v.usuario_id = u.id
       ORDER BY v.fecha DESC
       LIMIT 8`
    );

    res.json({ ...resumen, recientes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};