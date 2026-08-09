const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { esAdmin } = require('../middlewares/auth');

router.get('/api/configuracion', esAdmin, configuracionController.obtenerConfiguracion);
router.put('/api/configuracion', esAdmin, configuracionController.actualizarConfiguracion);

module.exports = router;