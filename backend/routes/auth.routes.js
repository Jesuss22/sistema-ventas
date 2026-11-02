const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
});

router.post('/login', limitarLogin, auth.login);
router.get('/perfil', verificarToken, auth.obtenerPerfil);
router.put('/perfil', verificarToken, auth.actualizarPerfil);
router.get('/usuarios', verificarToken, soloAdmin, auth.listar);
router.post('/registrar', verificarToken, soloAdmin, auth.registrar);

module.exports = router;