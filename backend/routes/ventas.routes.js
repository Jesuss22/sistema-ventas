const express = require('express');
const router = express.Router();
const ventas = require('../controllers/ventas.controller');

router.get('/', ventas.listar);
router.get('/:id', ventas.obtener);
router.post('/', ventas.crear);

module.exports = router;
