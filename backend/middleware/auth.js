const jwt = require('jsonwebtoken');

// Exige un token válido
exports.verificarToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1]; // formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
};

// Exige un rol específico (por ejemplo, admin)
exports.soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo un administrador puede hacer esto' });
  }
  next();
};
