const pool = require('../db');

// Registrar una venta
// Body: { "cliente_id": 1, "items": [ { "producto_id": 1, "cantidad": 2 }, ... ] }
exports.crear = async (req, res) => {
  const { cliente_id, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const detalle = [];

    for (const item of items) {
      const cantidad = Number(item.cantidad);
      if (!item.producto_id || !Number.isInteger(cantidad) || cantidad <= 0) {
        throw { status: 400, message: 'Producto o cantidad inválidos' };
      }

      // FOR UPDATE bloquea la fila para que dos ventas simultáneas no descuenten mal el stock
      const [rows] = await conn.query(
        'SELECT id, nombre, precio_venta, stock FROM productos WHERE id = ? AND activo = 1 FOR UPDATE',
        [item.producto_id]
      );
      if (rows.length === 0) {
        throw { status: 404, message: `Producto ${item.producto_id} no existe` };
      }

      const producto = rows[0];
      if (producto.stock < cantidad) {
        throw {
          status: 400,
          message: `Stock insuficiente de "${producto.nombre}" (disponible: ${producto.stock})`,
        };
      }

      const subtotal = Number(producto.precio_venta) * cantidad;
      total += subtotal;
      detalle.push({ producto_id: producto.id, cantidad, precio: producto.precio_venta, subtotal });
    }

    const [venta] = await conn.query(
      'INSERT INTO ventas (cliente_id, usuario_id, total) VALUES (?, ?, ?)',
      [cliente_id || null, req.usuario.id, total]
    );

    for (const d of detalle) {
      await conn.query(
        'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [venta.insertId, d.producto_id, d.cantidad, d.precio, d.subtotal]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [d.cantidad, d.producto_id]);
    }

    await conn.commit();
    res.status(201).json({ id: venta.insertId, total, mensaje: 'Venta registrada' });
  } catch (error) {
    await conn.rollback();
    res.status(error.status || 500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

// Listar ventas
exports.listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.total, v.fecha, c.nombre AS cliente, u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       JOIN usuarios u ON v.usuario_id = u.id
       ORDER BY v.fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ver una venta con su detalle
exports.obtener = async (req, res) => {
  try {
    const [ventas] = await pool.query(
      `SELECT v.id, v.total, v.fecha, c.nombre AS cliente, u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       JOIN usuarios u ON v.usuario_id = u.id
       WHERE v.id = ?`,
      [req.params.id]
    );
    if (ventas.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    const [items] = await pool.query(
      `SELECT p.nombre, d.cantidad, d.precio_unitario, d.subtotal
       FROM detalle_venta d
       JOIN productos p ON d.producto_id = p.id
       WHERE d.venta_id = ?`,
      [req.params.id]
    );
    res.json({ ...ventas[0], items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
