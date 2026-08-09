// src/repositories/citaRepository.js
const db = require('../config/db');

class CitaRepository {
    async buscarPorBarberoYFecha(barbero_id, fecha_hora) {
        const [existentes] = await db.query(
            'SELECT id FROM citas WHERE barbero_id = ? AND fecha = ?', 
            [barbero_id, fecha_hora]
        );
        return existentes;
    }

    async crear(data) {
        const { nombre, telefono, barbero_id, servicio_id, fecha_hora, metodo_pago, total_pagado = 0 } = data;
        
        const [result] = await db.query(`
            INSERT INTO citas 
            (nombre, telefono, fecha, usuario_id, barbero_id, servicio_id, metodo_pago, total_pagado, estado) 
            VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'pendiente')
        `, [
            nombre || 'Cliente General', 
            telefono || '', 
            fecha_hora, 
            barbero_id, 
            servicio_id, 
            metodo_pago, 
            total_pagado
        ]);
        
        return result.insertId;
    }

    async obtenerTodas() {
        const [citas] = await db.query(`
            SELECT 
                id, 
                fecha AS fecha_hora, 
                estado, 
                metodo_pago, 
                total_pagado,
                COALESCE(nombre, 'Cliente General') AS cliente_nombre,
                COALESCE(telefono, 'Sin teléfono') AS telefono,
                barbero_id,
                servicio_id,
                CONCAT('Barbero #', barbero_id) AS barbero_nombre,
                CONCAT('Servicio #', servicio_id) AS servicio_nombre
            FROM citas
            ORDER BY fecha DESC
        `);
        return citas;
    }

    async filtrar(estado, barbero_id) {
        let sql = `
            SELECT 
                id, 
                fecha AS fecha_hora, 
                estado, 
                metodo_pago, 
                total_pagado,
                COALESCE(nombre, 'Cliente General') AS cliente_nombre,
                COALESCE(telefono, 'Sin teléfono') AS telefono,
                barbero_id,
                servicio_id,
                CONCAT('Barbero #', barbero_id) AS barbero_nombre,
                CONCAT('Servicio #', servicio_id) AS servicio_nombre
            FROM citas 
            WHERE 1=1
        `;
        const params = [];
        
        if (estado) { 
            sql += ' AND estado = ?'; 
            params.push(estado); 
        }
        if (barbero_id) { 
            sql += ' AND barbero_id = ?'; 
            params.push(barbero_id); 
        }
        
        sql += ' ORDER BY fecha DESC';
        
        const [citas] = await db.query(sql, params);
        return citas;
    }

    async actualizarEstado(id, estado) {
        await db.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);
    }

    async eliminar(id) {
        await db.query('DELETE FROM citas WHERE id = ?', [id]);
    }
}

module.exports = new CitaRepository();