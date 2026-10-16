require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { verificarToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del sistema de ventas funcionando' });
});

// Probar conexión a la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS tablas FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME]
    );
    res.json({ conectado: true, tablas: rows[0].tablas });
  } catch (error) {
    res.status(500).json({ conectado: false, error: error.message });
  }
});

// Rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const ventasRoutes = require('./routes/ventas.routes');
const reportesRoutes = require('./routes/reportes.routes');

app.use('/api/auth', authRoutes);                             // libre (aquí se obtiene el token)
app.use('/api/productos', verificarToken, productosRoutes);   // protegida
app.use('/api/clientes', verificarToken, clientesRoutes);     // protegida
app.use('/api/ventas', verificarToken, ventasRoutes);         // protegida
app.use('/api/reportes', verificarToken, reportesRoutes);     // protegida

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
