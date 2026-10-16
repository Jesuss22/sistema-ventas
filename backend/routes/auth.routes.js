const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

router.post('/registrar', auth.registrar);
router.post('/login', auth.login);

module.exports = router;
