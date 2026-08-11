const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');

// Middleware básico de respaldo por si multer no está definido
const multer = require('multer');
const upload = multer({ dest: 'public/img/' }); // Guarda temporalmente las imágenes en public/img/

router.get('/api/servicios', servicioController.listar);

router.post('/admin/servicios', upload.single('imagen'), servicioController.crear);
router.put('/admin/servicios/:id', upload.single('imagen'), servicioController.actualizar);
router.delete('/admin/servicios/:id', servicioController.eliminar);

module.exports = router;