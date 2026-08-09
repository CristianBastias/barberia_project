const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debe ser POST para el envío del formulario
router.post('/login', authController.login);

module.exports = router;