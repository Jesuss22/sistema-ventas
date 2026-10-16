const pool = require('../db');

// Listar productos activos
exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.activo = 1
       ORDER BY p.nombre`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un producto por id
exports.obtener = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE id = ? AND activo = 1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear producto
exports.crear = async (req, res) => {
  try {
    const { codigo, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo } = req.body;

    if (!nombre || precio_venta === undefined) {
      return res.status(400).json({ error: 'nombre y precio_venta son obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO productos
       (codigo, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo || null,
        nombre,
        categoria_id || null,
        precio_compra || 0,
        precio_venta,
        stock || 0,
        stock_minimo || 5,
      ]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Producto creado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un producto con ese código' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Editar producto
exports.actualizar = async (req, res) => {
  try {
    const { codigo, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo } = req.body;

    const [result] = await pool.query(
      `UPDATE productos SET
        codigo = ?, nombre = ?, categoria_id = ?, precio_compra = ?,
        precio_venta = ?, stock = ?, stock_minimo = ?
       WHERE id = ? AND activo = 1`,
      [
        codigo || null,
        nombre,
        categoria_id || null,
        precio_compra || 0,
        precio_venta,
        stock || 0,
        stock_minimo || 5,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Desactivar producto (no se borra, para conservar el historial de ventas)
exports.desactivar = async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE productos SET activo = 0 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};