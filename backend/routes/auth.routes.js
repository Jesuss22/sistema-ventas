const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.post('/login', auth.login);
router.post('/registrar', verificarToken, soloAdmin, auth.registrar);

module.exports = router;