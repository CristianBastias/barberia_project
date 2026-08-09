const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/api/clientes', clienteController.obtenerClientes);
router.post('/api/clientes', clienteController.crearCliente);

module.exports = router;