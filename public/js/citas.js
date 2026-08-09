// src/public/js/citas.js
document.addEventListener('DOMContentLoaded', () => {
    const formNuevaCita = document.getElementById('formNuevaCita');
    
    cargarCitas();

    if (formNuevaCita) {
        formNuevaCita.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nuevaCita = {
                nombre: document.getElementById('nombreCliente').value,
                telefono: document.getElementById('telefonoCliente').value,
                barbero_id: document.getElementById('barbero_id').value,
                servicio_id: document.getElementById('servicio_id').value,
                fecha_hora: document.getElementById('fecha_hora').value,
                total_pagado: 0 
            };

            try {
                const response = await fetch('/citas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaCita)
                });

                const resultado = await response.json();

                if (!response.ok) {
                    throw new Error(resultado.error || 'Error al registrar la cita');
                }

                this.reset();
                alert('¡Cita registrada con éxito!');
                cargarCitas();
            } catch (error) {
                console.error('Error detallado:', error);
                alert(`Hubo un problema al guardar la cita: ${error.message}`);
            }
        });
    }
});

async function cargarCitas() {
    const estado = document.getElementById('filtroEstado').value;
    const barbero_id = document.getElementById('filtroBarbero').value;

    let url = '/citas';
    const params = new URLSearchParams();
    
    if (estado) params.append('estado', estado);
    if (barbero_id) params.append('barbero_id', barbero_id);
    
    if (params.toString()) {
        url = `/citas/filtrar?${params.toString()}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener la agenda de citas');
        
        const citas = await response.json();
        renderizarTabla(citas);
    } catch (error) {
        console.error('Error en cargarCitas:', error);
    }
}

function aplicarFiltros() {
    cargarCitas();
}

function renderizarTabla(citas) {
    const tbody = document.getElementById('tablaCitas');
    const contador = document.getElementById('contadorCitas');
    
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (!Array.isArray(citas)) return;

    if (contador) {
        contador.textContent = `${citas.length} cita${citas.length !== 1 ? 's' : ''}`;
    }

    if (citas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="py-6 text-center text-slate-500 italic">No se encontraron turnos registrados.</td>
            </tr>
        `;
        return;
    }

    citas.forEach(cita => {
        let badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (cita.estado === 'completado') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (cita.estado === 'cancelado') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';

        // Mapeo ordenado exactamente con las columnas de la vista
        const nombreCliente = cita.cliente_nombre || cita.nombre || 'Cliente General';
        const telefonoCliente = cita.telefono || 'Sin teléfono';
        const barberoTexto = cita.barbero_nombre || `Barbero #${cita.barbero_id}`;
        const servicioTexto = cita.servicio_nombre || `Servicio #${cita.servicio_id}`;
        const fechaTexto = formatearFecha(cita.fecha_hora || cita.fecha);

        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800/60 hover:bg-slate-800/30 transition-all';
        
        // El orden de las celdas (td) corresponde estrictamente a las 8 columnas del encabezado:
        // 1. ID | 2. CLIENTE | 3. TELÉFONO | 4. BARBERO ID | 5. SERVICIO ID | 6. FECHA / HORA | 7. ESTADO | 8. ACCIONES
        tr.innerHTML = `
            <td class="py-4 px-6 font-mono text-xs text-slate-400">#${cita.id}</td>
            <td class="py-4 px-6 font-medium text-white">${nombreCliente}</td>
            <td class="py-4 px-6 font-mono text-xs text-slate-300">${telefonoCliente}</td>
            <td class="py-4 px-6">${barberoTexto}</td>
            <td class="py-4 px-6">${servicioTexto}</td>
            <td class="py-4 px-6 font-mono text-xs text-slate-300">${fechaTexto}</td>
            <td class="py-4 px-6">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}">
                    ${cita.estado}
                </span>
            </td>
            <td class="py-4 px-6 text-center space-x-1">
                <button onclick="cambiarEstado(${cita.id}, 'completado')" class="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-all border border-emerald-500/30" title="Marcar como Completado">
                    <i class="fas fa-check text-xs"></i>
                </button>
                <button onclick="cambiarEstado(${cita.id}, 'cancelado')" class="p-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-all border border-amber-500/30" title="Cancelar Cita">
                    <i class="fas fa-ban text-xs"></i>
                </button>
                <button onclick="eliminarCita(${cita.id})" class="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/30" title="Eliminar Turno">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cambiarEstado(id, nuevoEstado) {
    try {
        const response = await fetch(`/citas/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) throw new Error('Error al actualizar el estado');
        
        cargarCitas();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al actualizar el estado de la cita.');
    }
}

async function eliminarCita(id) {
    if (!confirm('¿Estás seguro de eliminar este turno de la base de datos?')) return;

    try {
        const response = await fetch(`/citas/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar el turno');
        
        cargarCitas();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al intentar eliminar la cita.');
    }
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return isNaN(fecha) ? fechaStr : fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}