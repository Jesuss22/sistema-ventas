const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    }

    const rolFinal = rol === 'admin' ? 'admin' : 'vendedor';
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rolFinal]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Usuario creado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, passwordActual, passwordNueva } = req.body;

    if (!nombre?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'El nombre y el email son obligatorios' });
    }

    if (passwordNueva && !passwordActual) {
      return res.status(400).json({ error: 'Ingresa tu contraseña actual para cambiarla' });
    }
    if (passwordNueva && passwordNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const [usuarios] = await pool.query(
      'SELECT id, password FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (passwordNueva) {
      const coincide = await bcrypt.compare(passwordActual, usuarios[0].password);
      if (!coincide) {
        return res.status(400).json({ error: 'La contraseña actual no es correcta' });
      }
    }

    if (passwordNueva) {
      const hash = await bcrypt.hash(passwordNueva, 10);
      await pool.query(
        'UPDATE usuarios SET nombre = ?, email = ?, password = ? WHERE id = ?',
        [nombre.trim(), email.trim(), hash, req.usuario.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
        [nombre.trim(), email.trim(), req.usuario.id]
      );
    }

    const [perfil] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    res.json({ usuario: perfil[0], mensaje: 'Cuenta actualizada correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ese email ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
};
