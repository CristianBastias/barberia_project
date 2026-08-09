const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');

// Debe ser POST, ya que el formulario envía datos
router.post('/enviar', mailController.enviarCorreo);

router.get('/historial', mailController.obtenerHistorial);

// Ruta faltante para actualizar el estado a leído (lo que apagará la campanita)
router.put('/leer/:id', mailController.marcarComoLeido);

router.delete('/:id', mailController.eliminarCorreo);

module.exports = router;