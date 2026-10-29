const pool = require('../db');

// Listar clientes
exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un cliente
exports.obtener = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear cliente
exports.crear = async (req, res) => {
  try {
    const { nombre, documento, telefono, direccion } = req.body || {};

    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, documento, telefono, direccion) VALUES (?, ?, ?, ?)',
      [nombre.trim(), documento || null, telefono || null, direccion || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Cliente creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Editar cliente
exports.actualizar = async (req, res) => {
  try {
    const { nombre, documento, telefono, direccion } = req.body || {};

    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, documento = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre.trim(), documento || null, telefono || null, direccion || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
