document.addEventListener("DOMContentLoaded", function () {
    cargarBarberosDesdeBD();

    const formCrearBarbero = document.getElementById('formCrearBarbero');
    if (formCrearBarbero) {
        formCrearBarbero.addEventListener('submit', async function (e) {
            e.preventDefault();

            const id = document.getElementById('barberoIdEdit').value;
            const nombre = document.getElementById('nombreBarbero').value;
            const especialidad = document.getElementById('especialidadBarbero').value;
            const datosBarbero = { nombre, especialidad };

            try {
                let response;
                if (id) {
                    response = await fetch(`/api/barberos/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(datosBarbero)
                    });
                } else {
                    response = await fetch('/api/barberos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(datosBarbero)
                    });
                }

                if (response.ok) {
                    alert(id ? '¡Barbero actualizado con éxito!' : '¡Barbero registrado con éxito!');
                    resetearFormularioBarbero();
                    cargarBarberosDesdeBD();
                } else {
                    alert('Error al procesar la solicitud.');
                }
            } catch (error) {
                console.error("Error:", error);
                alert('Error de conexión con el servidor.');
            }
        });
    }
});

async function cargarBarberosDesdeBD() {
    try {
        const response = await fetch('/api/barberos');
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        const barberos = await response.json();
        renderizarTablaBarberos(barberos);
    } catch (error) {
        console.error("Error al cargar los barberos:", error);
    }
}

function renderizarTablaBarberos(barberos) {
    const tbody = document.getElementById('tablaBarberos');
    const contador = document.getElementById('contadorBarberos');
    if (!tbody) return;
    
    tbody.innerHTML = ''; 

    if (!barberos || barberos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500 italic">No hay barberos registrados en la base de datos.</td></tr>`;
        if (contador) contador.innerText = `0 barberos`;
        return;
    }

    barberos.forEach(barb => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800/50 text-sm text-slate-300 hover:bg-slate-800/30 transition-all duration-150";
        
        const activo = barb.activo == 1 || barb.activo === true;
        const estadoBadge = activo 
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">Activo</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">Inactivo</span>`;

        // Lógica visual para la columna de Citas Pendientes
        const totalCitas = barb.citas_pendientes || 0;
        const citasBadge = totalCitas > 0
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit"><i class="fa-solid fa-clock"></i> ${totalCitas} turnos pendientes</span>`
            : `<span class="text-xs text-slate-500 italic">Sin turnos pendientes</span>`;

        tr.innerHTML = `
            <td class="py-4 px-6 font-mono text-slate-400 text-xs font-medium">#${barb.id}</td>
            <td class="py-4 px-6 font-semibold text-slate-200">
                ${barb.nombre} <div class="mt-1">${estadoBadge}</div>
            </td>
            <td class="py-4 px-6 text-slate-300">${barb.especialidad}</td>
            <td class="py-4 px-6">${citasBadge}</td> <!-- Nueva Columna de Servicios/Citas -->
            <td class="py-4 px-6 text-right whitespace-nowrap space-x-2">
                <button type="button" onclick="cambiarEstadoBarbero(${barb.id})" class="bg-slate-950 hover:bg-blue-600/20 text-blue-400 border border-slate-800 hover:border-blue-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Cambiar Estado">
                    <i class="fa-solid fa-power-off text-xs"></i>
                </button>
                <button type="button" onclick="prepararEditarBarbero(${barb.id}, '${barb.nombre.replace(/'/g, "\\'")}', '${barb.especialidad.replace(/'/g, "\\'")}')" class="bg-slate-950 hover:bg-amber-600/20 text-amber-400 border border-slate-800 hover:border-amber-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Editar Barbero">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button type="button" onclick="eliminarBarbero(${barb.id})" class="bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Eliminar Barbero">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (contador) contador.innerText = `${barberos.length} barberos`;
}

function prepararEditarBarbero(id, nombre, especialidad) {
    document.getElementById('barberoIdEdit').value = id;
    document.getElementById('nombreBarbero').value = nombre;
    document.getElementById('especialidadBarbero').value = especialidad;
    
    // Cambios visuales evidentes para notificar al usuario que está EDITANDO
    const cardForm = document.getElementById('formCrearBarbero').closest('div');
    if (cardForm) {
        cardForm.classList.remove('border-slate-800/80');
        cardForm.classList.add('border-amber-500/50', 'bg-amber-950/10');
    }

    const btnSubmit = document.getElementById('btnSubmitBarbero');
    if (btnSubmit) {
        btnSubmit.innerText = 'Actualizar Cambios';
        btnSubmit.className = "bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer";
    }

    const titulo = document.getElementById('formTituloBarbero');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Barbero ID #${id} (Modo Edición Activo)`;
    }
    
    const btnCancelar = document.getElementById('btnCancelarEdicionBarbero');
    if (btnCancelar) btnCancelar.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormularioBarbero() {
    document.getElementById('formCrearBarbero').reset();
    document.getElementById('barberoIdEdit').value = '';
    
    const cardForm = document.getElementById('formCrearBarbero').closest('div');
    if (cardForm) {
        cardForm.classList.add('border-slate-800/80');
        cardForm.classList.remove('border-amber-500/50', 'bg-amber-950/10');
    }

    const btnSubmit = document.getElementById('btnSubmitBarbero');
    if (btnSubmit) {
        btnSubmit.innerText = 'Guardar Barbero';
        btnSubmit.className = "bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer";
    }

    const titulo = document.getElementById('formTituloBarbero');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Barbero`;
    }
    
    const btnCancelar = document.getElementById('btnCancelarEdicionBarbero');
    if (btnCancelar) btnCancelar.classList.add('hidden');
}

async function eliminarBarbero(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este barbero?')) return;

    try {
        const response = await fetch(`/api/barberos/${id}`, { method: 'DELETE' });
        const data = await response.json(); // Leemos la respuesta del servidor en formato JSON

        if (response.ok) {
            alert('Barbero eliminado correctamente.');
            cargarBarberosDesdeBD(); 
        } else {
            // AQUÍ ES DONDE LEE EL MENSAJE: Si el servidor falló (ej. código 400), 
            // muestra el texto exacto que mandó el backend (las citas pendientes).
            alert(data.error || 'No se pudo eliminar el barbero.');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert('Error de conexión al intentar eliminar.');
    }
}

async function cambiarEstadoBarbero(id) {
    try {
        const response = await fetch(`/api/barberos/${id}/estado`, { method: 'PATCH' });
        const data = await response.json(); // Leemos la respuesta del servidor

        if (response.ok) {
            cargarBarberosDesdeBD();
        } else {
            // AQUÍ HACE LO MISMO: Si tiene turnos pendientes, la API responde con error 
            // y esta línea muestra la alerta explicándole al usuario el motivo.
            alert(data.error || 'No se pudo cambiar el estado.');
        }
    } catch (error) {
        console.error("Error al cambiar estado:", error);
    }
}

// Sugerencia: Función para cambiar estado rápidamente sin borrar al barbero
async function cambiarEstadoBarbero(id) {
    try {
        const response = await fetch(`/api/barberos/${id}/estado`, { method: 'PATCH' });
        if (response.ok) {
            cargarBarberosDesdeBD();
        } else {
            alert('No se pudo cambiar el estado.');
        }
    } catch (error) {
        console.error("Error al cambiar estado:", error);
    }
}