const express = require('express');
const router = express.Router();
const clientes = require('../controllers/clientes.controller');

router.get('/', clientes.listar);
router.get('/:id', clientes.obtener);
router.post('/', clientes.crear);
router.put('/:id', clientes.actualizar);

module.exports = router;
