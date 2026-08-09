const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Asegúrate de que esta carpeta exista en tu proyecto
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/api/servicios', servicioController.obtenerServicios);

// Se añade upload.single('imagen') para interceptar y guardar el archivo de la PC
router.post('/admin/servicios', upload.single('imagen'), servicioController.crearServicio);
router.put('/admin/servicios/:id', upload.single('imagen'), servicioController.actualizarServicio);

router.delete('/admin/servicios/:id', servicioController.eliminarServicio);

module.exports = router;