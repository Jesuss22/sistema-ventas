const pool = require('./db');

const categorias = [
  'Abarrotes',
  'Bebidas',
  'Limpieza',
  'Cuidado personal',
  'Snacks',
];

const productos = [
  { codigo: 'DEMO-001', nombre: 'Arroz Extra 5 kg', categoria: 'Abarrotes', compra: 16.50, venta: 21.90, stock: 24, minimo: 8 },
  { codigo: 'DEMO-002', nombre: 'Aceite vegetal 1 L', categoria: 'Abarrotes', compra: 7.20, venta: 9.50, stock: 18, minimo: 6 },
  { codigo: 'DEMO-003', nombre: 'Azúcar rubia 1 kg', categoria: 'Abarrotes', compra: 3.10, venta: 4.20, stock: 5, minimo: 8 },
  { codigo: 'DEMO-004', nombre: 'Leche evaporada 400 g', categoria: 'Abarrotes', compra: 3.20, venta: 4.50, stock: 32, minimo: 10 },
  { codigo: 'DEMO-005', nombre: 'Agua mineral 625 ml', categoria: 'Bebidas', compra: 1.10, venta: 2.00, stock: 40, minimo: 12 },
  { codigo: 'DEMO-006', nombre: 'Gaseosa cola 1.5 L', categoria: 'Bebidas', compra: 5.20, venta: 7.50, stock: 21, minimo: 8 },
  { codigo: 'DEMO-007', nombre: 'Detergente en polvo 1 kg', categoria: 'Limpieza', compra: 8.00, venta: 11.90, stock: 3, minimo: 6 },
  { codigo: 'DEMO-008', nombre: 'Lavavajilla líquido 750 ml', categoria: 'Limpieza', compra: 5.50, venta: 8.20, stock: 14, minimo: 5 },
  { codigo: 'DEMO-009', nombre: 'Papel higiénico pack x4', categoria: 'Limpieza', compra: 6.80, venta: 9.90, stock: 0, minimo: 5 },
  { codigo: 'DEMO-010', nombre: 'Shampoo familiar 400 ml', categoria: 'Cuidado personal', compra: 9.50, venta: 14.90, stock: 11, minimo: 4 },
  { codigo: 'DEMO-011', nombre: 'Galletas de chocolate', categoria: 'Snacks', compra: 1.80, venta: 3.00, stock: 28, minimo: 10 },
  { codigo: 'DEMO-012', nombre: 'Papas fritas clásicas 150 g', categoria: 'Snacks', compra: 2.40, venta: 4.00, stock: 16, minimo: 6 },
];

const clientes = [
  { nombre: 'Comercial Los Andes S.A.C.', documento: '20601234567', telefono: '987654321', direccion: 'Av. Argentina 1450' },
  { nombre: 'Rosa Mendoza', documento: '45872136', telefono: '986123450', direccion: 'Jr. Las Flores 220' },
  { nombre: 'Carlos Quispe', documento: '70451238', telefono: '985234671', direccion: 'Calle Los Pinos 108' },
  { nombre: 'María Torres', documento: '43125678', telefono: '984345612', direccion: 'Av. Brasil 890' },
  { nombre: 'Bodega El Sol', documento: '10456789123', telefono: '983456723', direccion: 'Jr. Unión 560' },
  { nombre: 'Lucía Ramírez', documento: '72894561', telefono: '982567834', direccion: 'Calle Lima 315' },
  { nombre: 'Distribuidora Norte', documento: '20598765431', telefono: '981678945', direccion: 'Av. Túpac Amaru 1200' },
  { nombre: 'Jorge Salazar', documento: '46781259', telefono: '980789156', direccion: 'Jr. Tacna 440' },
];

const ventas = [
  { dias: 0, cliente: '45872136', items: [['DEMO-001', 2], ['DEMO-011', 3], ['DEMO-005', 2]] },
  { dias: 0, cliente: '70451238', items: [['DEMO-004', 4], ['DEMO-006', 2]] },
  { dias: 1, cliente: '20601234567', items: [['DEMO-001', 5], ['DEMO-002', 3], ['DEMO-008', 2]] },
  { dias: 3, cliente: '43125678', items: [['DEMO-011', 6], ['DEMO-012', 4], ['DEMO-005', 5]] },
  { dias: 6, cliente: '10456789123', items: [['DEMO-004', 6], ['DEMO-006', 4], ['DEMO-010', 2]] },
];

async function obtenerIds(conn) {
  const [productoRows] = await conn.query(
    'SELECT id, codigo, precio_venta FROM productos WHERE codigo LIKE ?',
    ['DEMO-%']
  );
  const [clienteRows] = await conn.query(
    'SELECT id, documento FROM clientes WHERE documento IS NOT NULL'
  );
  return {
    productos: new Map(productoRows.map((p) => [p.codigo, p])),
    clientes: new Map(clienteRows.map((c) => [c.documento, c.id])),
  };
}

async function ejecutar() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS demo_seed_runs (
        nombre VARCHAR(80) PRIMARY KEY,
        ejecutado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [ejecuciones] = await conn.query(
      'SELECT nombre FROM demo_seed_runs WHERE nombre = ?',
      ['demo-2026-11']
    );
    if (ejecuciones.length > 0) {
      console.log('La semilla demo ya fue ejecutada. No se agregaron duplicados.');
      await conn.rollback();
      return;
    }

    for (const nombre of categorias) {
      await conn.query('INSERT IGNORE INTO categorias (nombre) VALUES (?)', [nombre]);
    }

    const [categoriaRows] = await conn.query('SELECT id, nombre FROM categorias');
    const categoriaIds = new Map(categoriaRows.map((c) => [c.nombre, c.id]));

    for (const p of productos) {
      await conn.query(
        `INSERT INTO productos
          (codigo, nombre, categoria_id, precio_compra, precio_venta, stock, stock_minimo, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre), categoria_id = VALUES(categoria_id),
          precio_compra = VALUES(precio_compra), precio_venta = VALUES(precio_venta),
          stock = VALUES(stock), stock_minimo = VALUES(stock_minimo), activo = 1`,
        [p.codigo, p.nombre, categoriaIds.get(p.categoria), p.compra, p.venta, p.stock, p.minimo]
      );
    }

    for (const c of clientes) {
      const [existentes] = await conn.query(
        'SELECT id FROM clientes WHERE documento = ? LIMIT 1',
        [c.documento]
      );
      if (existentes.length === 0) {
        await conn.query(
          'INSERT INTO clientes (nombre, documento, telefono, direccion) VALUES (?, ?, ?, ?)',
          [c.nombre, c.documento, c.telefono, c.direccion]
        );
      }
    }

    const ids = await obtenerIds(conn);
    const [usuarios] = await conn.query(
      `SELECT id FROM usuarios WHERE rol = 'admin' ORDER BY id LIMIT 1`
    );
    const usuarioId = usuarios[0]?.id;
    if (!usuarioId) {
      throw new Error('No existe un usuario admin para registrar las ventas demo');
    }

    for (const venta of ventas) {
      let total = 0;
      const detalle = venta.items.map(([codigo, cantidad]) => {
        const producto = ids.productos.get(codigo);
        if (!producto) throw new Error(`No se encontró el producto demo ${codigo}`);
        const subtotal = Number(producto.precio_venta) * cantidad;
        total += subtotal;
        return [producto.id, cantidad, producto.precio_venta, subtotal];
      });

      const [resultado] = await conn.query(
        `INSERT INTO ventas (cliente_id, usuario_id, total, fecha)
         VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ${venta.dias} DAY))`,
        [ids.clientes.get(venta.cliente) || null, usuarioId, total]
      );
      for (const [productoId, cantidad, precio, subtotal] of detalle) {
        await conn.query(
          `INSERT INTO detalle_venta
            (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [resultado.insertId, productoId, cantidad, precio, subtotal]
        );
      }
    }

    await conn.query(
      'INSERT INTO demo_seed_runs (nombre) VALUES (?)',
      ['demo-2026-11']
    );
    await conn.commit();
    console.log(`Datos demo creados: ${productos.length} productos, ${clientes.length} clientes y ${ventas.length} ventas.`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

ejecutar()
  .catch((error) => {
    console.error('No se pudo cargar la semilla demo:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
