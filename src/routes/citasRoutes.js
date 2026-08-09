// src/routes/citasRoutes.js
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

router.get('/citas', citaController.obtenerCitas);
router.get('/citas/filtrar', citaController.filtrarCitas);
router.post('/citas', citaController.crearCita);
router.put('/citas/:id/estado', citaController.actualizarEstadoCita);
router.delete('/citas/:id', citaController.eliminarCita);

module.exports = router;