const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');

// Ruta para obtener todos los servicios (API JSON)
router.get('/api/servicios', servicioController.listar);

// Ruta crítica de eliminación que conecta con el botón de la papelera
router.delete('/admin/servicios/:id', servicioController.eliminar);

module.exports = router;