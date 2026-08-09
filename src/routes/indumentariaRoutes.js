const express = require('express');
const router = express.Router();
const indumentariaController = require('../controllers/indumentariaController');

router.get('/api/indumentaria', indumentariaController.obtenerTodas);
router.post('/api/indumentaria', indumentariaController.uploadImage, indumentariaController.crear);
router.put('/api/indumentaria/:id', indumentariaController.uploadImage, indumentariaController.actualizar);
router.patch('/api/indumentaria/:id/estado', indumentariaController.cambiarEstado);
router.delete('/api/indumentaria/:id', indumentariaController.eliminar);

module.exports = router;