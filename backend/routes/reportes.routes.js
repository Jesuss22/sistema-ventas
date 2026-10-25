const express = require('express');
const router = express.Router();
const productos = require('../controllers/productos.controller');
const { soloAdmin } = require('../middleware/auth');

router.get('/', productos.listar);
router.get('/:id', productos.obtener);
router.post('/', soloAdmin, productos.crear);
router.put('/:id', soloAdmin, productos.actualizar);
router.delete('/:id', soloAdmin, productos.desactivar);

module.exports = router; 