const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');

// Middleware básico de respaldo ajustado para evitar error de escritura en disco en Vercel
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 

router.get('/api/servicios', servicioController.listar);

router.post('/admin/servicios', upload.single('imagen'), servicioController.crear);
router.put('/admin/servicios/:id', upload.single('imagen'), servicioController.actualizar);
router.delete('/admin/servicios/:id', servicioController.eliminar);

module.exports = router;