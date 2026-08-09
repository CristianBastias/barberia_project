// src/services/citaService.js
const citaRepository = require('../repositories/citaRepository');
const db = require('../config/db');

class CitaService {
    async reservarTurno(data) {
        const { barbero_id, fecha_hora, servicio_id } = data;

        const existentes = await citaRepository.buscarPorBarberoYFecha(barbero_id, fecha_hora);
        if (existentes.length > 0) {
            throw new Error('El horario seleccionado ya está ocupado para este barbero.');
        }

        const [servicioRows] = await db.query('SELECT precio FROM servicios WHERE id = ?', [servicio_id]);
        const total_pagado = servicioRows.length > 0 ? servicioRows[0].precio : 0;

        const citaData = {
            ...data,
            nombre: data.nombre || 'Cliente General',
            telefono: data.telefono || 'Sin teléfono',
            total_pagado,
            metodo_pago: data.metodo_pago || 'efectivo'
        };

        return await citaRepository.crear(citaData);
    }

    async listarCitas() {
        return await citaRepository.obtenerTodas();
    }

    async filtrarCitas(estado, barbero_id) {
        return await citaRepository.filtrar(estado, barbero_id);
    }

    async cambiarEstadoCita(id, estado) {
        return await citaRepository.actualizarEstado(id, estado);
    }

    async eliminarCita(id) {
        return await citaRepository.eliminar(id);
    }
}

module.exports = new CitaService();