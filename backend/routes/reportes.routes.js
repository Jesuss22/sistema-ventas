const express = require('express');
const router = express.Router();
const reportes = require('../controllers/reportes.controller');

router.get('/ventas-hoy', reportes.ventasHoy);
router.get('/mas-vendidos', reportes.masVendidos);
router.get('/poco-stock', reportes.pocoStock);
router.get('/resumen', reportes.resumen);

module.exports = router;
