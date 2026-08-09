// src/controllers/mailController.js
const db = require('../config/db');

const CORREO_ADMIN = 'admin@buho.com';

const mailController = {
    async enviarCorreo(req, res) {
        try {
            const { remitente, asunto, mensaje, destinatario } = req.body; 

            if (!asunto || !mensaje) {
                return res.status(400).json({ error: "Faltan campos obligatorios." });
            }

            // Unificamos el remitente y destinatario por defecto al correo oficial único
            const remitenteReal = remitente || CORREO_ADMIN;
            const destinoReal = destinatario || CORREO_ADMIN;

            // Si el correo sale del administrador, nace como leído (1). Si viene de afuera, como no leído (0).
            const esAdmin = remitenteReal === CORREO_ADMIN;
            const estadoLeido = esAdmin ? 1 : 0;

            const query = `INSERT INTO correos_historial (remitente, asunto, mensaje, destinatario, leido, fecha) VALUES (?, ?, ?, ?, ?, NOW())`;
            await db.query(query, [remitenteReal, asunto, mensaje, destinoReal, estadoLeido]);

            res.status(200).json({ message: "Correo guardado exitosamente." });
        } catch (error) {
            console.error("Error al guardar mail en DB:", error);
            res.status(500).json({ error: "Error interno al procesar el correo." });
        }
    },

    async obtenerHistorial(req, res) {
        try {
            const [rows] = await db.query(`SELECT * FROM correos_historial ORDER BY fecha DESC`);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener historial:", error);
            res.status(500).json({ error: "Error al obtener el historial de correos." });
        }
    },

    async marcarComoLeido(req, res) {
        try {
            const { id } = req.params;
            await db.query(`UPDATE correos_historial SET leido = 1 WHERE id = ?`, [id]);
            res.json({ message: "Correo marcado como leído." });
        } catch (error) {
            console.error("Error al marcar como leído:", error);
            res.status(500).json({ error: "No se pudo actualizar el estado." });
        }
    },

    async eliminarCorreo(req, res) {
        try {
            const { id } = req.params;
            await db.query(`DELETE FROM correos_historial WHERE id = ?`, [id]);
            res.json({ message: "Correo eliminado correctamente." });
        } catch (error) {
            console.error("Error al eliminar correo:", error);
            res.status(500).json({ error: "No se pudo eliminar el correo." });
        }
    }
};

module.exports = mailController;