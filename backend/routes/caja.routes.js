const express = require('express');
const router = express.Router();
const caja = require('../controllers/caja.controller');

router.get('/', caja.estado);
router.post('/', caja.abrir);

module.exports = router;
