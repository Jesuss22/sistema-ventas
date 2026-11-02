require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { verificarToken } = require('./middleware/auth');
const { responderError } = require('./utils/error-response');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('cambia_esta_clave')) {
  throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres no predecibles');
}

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: corsOrigins,
  credentials: false,
}));
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
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
    responderError(res, error, 'No se pudo comprobar la conexión a la base de datos');
  }
});

// Rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const ventasRoutes = require('./routes/ventas.routes');
const reportesRoutes = require('./routes/reportes.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const cajaRoutes = require('./routes/caja.routes');

app.use('/api/auth', authRoutes);                             // libre (aquí se obtiene el token)
app.use('/api/productos', verificarToken, productosRoutes);   // protegida
app.use('/api/clientes', verificarToken, clientesRoutes);     // protegida
app.use('/api/ventas', verificarToken, ventasRoutes);         // protegida
app.use('/api/reportes', verificarToken, reportesRoutes);     // protegida
app.use('/api/proveedores', verificarToken, proveedoresRoutes); // protegida
app.use('/api/caja', verificarToken, cajaRoutes);             // protegida

// Evita que una ruta API inexistente reciba el index.html del frontend.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
