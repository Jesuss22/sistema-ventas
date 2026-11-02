const pool = require('../db');
const { responderError } = require('../utils/error-response');

exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
    responderError(res, error, 'No se pudieron listar los proveedores');
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, documento, telefono, email, direccion } = req.body || {};
    if (typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre, documento, telefono, email, direccion)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre.trim(), documento || null, telefono || null, email || null, direccion || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Proveedor creado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un proveedor con ese documento' });
    }
    responderError(res, error, 'No se pudo crear el proveedor');
  }
};
