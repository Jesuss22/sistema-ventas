const express = require('express');
const router = express.Router();
const proveedores = require('../controllers/proveedores.controller');
const { soloAdmin } = require('../middleware/auth');

router.get('/', proveedores.listar);
router.post('/', soloAdmin, proveedores.crear);

module.exports = router;
