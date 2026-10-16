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