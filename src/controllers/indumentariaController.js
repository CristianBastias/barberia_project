const indumentariaRepository = require('../repositories/indumentariaRepository');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para el almacenamiento de imágenes de indumentaria
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/img/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prenda-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten archivos de imagen válidos (jpg, jpeg, png, webp)"));
    }
});

class IndumentariaController {
    // Middleware de subida para usar en las rutas
    uploadImage = upload.single('imagen');

    async obtenerTodas(req, res) {
        try {
            const prendas = await indumentariaRepository.obtenerTodas();
            res.json(prendas);
        } catch (error) {
            console.error("Error al obtener indumentaria:", error);
            res.status(500).json({ error: "Error interno al cargar la indumentaria" });
        }
    }

    async crear(req, res) {
        try {
            const { nombre, precio, stock, descripcion } = req.body;
            
            if (!nombre || !precio || stock === undefined) {
                return res.status(400).json({ error: "Faltan campos obligatorios (nombre, precio, stock)" });
            }

            let imagen_url = null;
            if (req.file) {
                imagen_url = `/img/${req.file.filename}`;
            }

            await indumentariaRepository.crear({
                nombre,
                precio,
                stock,
                imagen_url,
                descripcion
            });

            res.status(201).json({ message: "Prenda registrada con éxito" });
        } catch (error) {
            console.error("Error al crear prenda:", error);
            res.status(500).json({ error: "Error al registrar la prenda" });
        }
    }

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, precio, stock, descripcion } = req.body;

            if (!nombre || !precio || stock === undefined) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            // Obtener prenda actual para verificar si hay imagen previa que reemplazar
            const prendas = await indumentariaRepository.obtenerTodas();
            const prendaActual = prendas.find(p => p.id == id);

            let imagen_url = prendaActual ? prendaActual.imagen_url : null;

            if (req.file) {
                imagen_url = `/img/${req.file.filename}`;
                // Opcional: limpiar imagen anterior si existía y está en disco local
                if (prendaActual && prendaActual.imagen_url && prendaActual.imagen_url.startsWith('/img/')) {
                    const rutaAntigua = path.join('public', prendaActual.imagen_url);
                    if (fs.existsSync(rutaAntigua)) {
                        fs.unlinkSync(rutaAntigua);
                    }
                }
            }

            await indumentariaRepository.actualizar(id, {
                nombre,
                precio,
                stock,
                imagen_url,
                descripcion
            });

            res.json({ message: "Prenda actualizada con éxito" });
        } catch (error) {
            console.error("Error al actualizar prenda:", error);
            res.status(500).json({ error: "Error al actualizar la prenda" });
        }
    }

    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            await indumentariaRepository.cambiarEstado(id);
            res.json({ message: "Estado de la prenda modificado" });
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            res.status(500).json({ error: "Error al cambiar el estado" });
        }
    }

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            // Buscar la prenda para borrar su archivo de imagen asociado si existe
            const prendas = await indumentariaRepository.obtenerTodas();
            const prenda = prendas.find(p => p.id == id);

            if (prenda && prenda.imagen_url && prenda.imagen_url.startsWith('/img/')) {
                const rutaImagen = path.join('public', prenda.imagen_url);
                if (fs.existsSync(rutaImagen)) {
                    fs.unlinkSync(rutaImagen);
                }
            }

            await indumentariaRepository.eliminar(id);
            res.json({ message: "Prenda eliminada correctamente" });
        } catch (error) {
            console.error("Error al eliminar prenda:", error);
            res.status(500).json({ error: "Error al eliminar la prenda" });
        }
    }
}

module.exports = new IndumentariaController();