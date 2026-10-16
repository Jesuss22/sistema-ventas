const express = require('express');
const router = express.Router();
const productos = require('../controllers/productos.controller');

router.get('/', productos.listar);
router.get('/:id', productos.obtener);
router.post('/', productos.crear);
router.put('/:id', productos.actualizar);
router.delete('/:id', productos.desactivar);

module.exports = router;
