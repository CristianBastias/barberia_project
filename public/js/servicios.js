document.addEventListener('DOMContentLoaded', () => {
    cargarServicios();

    const formServicio = document.getElementById('formServicio');
    if (formServicio) {
        formServicio.addEventListener('submit', guardarServicio);
    }
});

async function cargarServicios() {
    try {
        const response = await fetch('/api/servicios');
        if (!response.ok) throw new Error('Error al cargar servicios');

        const servicios = await response.json();
        const tbody = document.getElementById('tablaServiciosCuerpo');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (servicios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500 italic">No hay servicios registrados.</td></tr>`;
            return;
        }

        servicios.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-800/50 text-sm text-slate-300 hover:bg-slate-800/30 transition-all duration-150";
            
            const activo = s.activo == 1 || s.activo === true;
            const estadoBadge = activo 
                ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">Activo</span>`
                : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">Inactivo</span>`;

            const precioFormateado = Number(s.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
            const duracionValor = s.duracion_minutos || s.duracion || '';

            tr.innerHTML = `
                <td class="py-4 px-4 font-mono text-xs text-slate-400">#${s.id}</td>
                <td class="py-4 px-4 text-white font-medium">${s.nombre} <div class="mt-1">${estadoBadge}</div></td>
                <td class="py-4 px-4 font-mono text-emerald-400 font-semibold">$${precioFormateado}</td>
                <td class="py-4 px-4 text-slate-400 text-xs">${duracionValor ? duracionValor + ' mins' : 'N/D'}</td>
                <td class="py-4 px-4 text-right whitespace-nowrap space-x-2">
                    <button type="button" onclick="prepararEditarServicio(${s.id}, '${s.nombre.replace(/'/g, "\\'")}', ${s.precio}, '${duracionValor}')" class="bg-slate-950 hover:bg-amber-600/20 text-amber-400 border border-slate-800 hover:border-amber-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Editar Servicio">
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                    <button type="button" onclick="eliminarServicio(${s.id})" class="bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Eliminar / Desactivar">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar servicios:', error);
    }
}

async function guardarServicio(e) {
    e.preventDefault();
    
    const id = document.getElementById('servicioIdEdit') ? document.getElementById('servicioIdEdit').value : '';
    const nombre = document.getElementById('nombreServicio').value;
    const precio = document.getElementById('precioServicio').value;
    const duracion = document.getElementById('duracionServicio').value;

    const datosServicio = { nombre, precio, duracion_minutos: duracion };

    try {
        let response;
        if (id) {
            response = await fetch(`/admin/servicios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosServicio)
            });
        } else {
            response = await fetch('/admin/servicios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosServicio)
            });
        }

        if (!response.ok) throw new Error('No se pudo procesar la solicitud');

        alert(id ? '¡Servicio actualizado con éxito!' : '¡Servicio registrado con éxito!');
        resetearFormularioServicio();
        cargarServicios();
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al guardar el servicio.');
    }
}

function prepararEditarServicio(id, nombre, precio, duracion) {
    let inputId = document.getElementById('servicioIdEdit');
    if (!inputId) {
        inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.id = 'servicioIdEdit';
        const form = document.getElementById('formServicio');
        if (form) form.appendChild(inputId);
    }
    inputId.value = id;

    document.getElementById('nombreServicio').value = nombre;
    document.getElementById('precioServicio').value = precio;
    const inputDuracion = document.getElementById('duracionServicio');
    if (inputDuracion) inputDuracion.value = duracion;

    const formServicioElement = document.getElementById('formServicio');
    if (formServicioElement) {
        const cardForm = formServicioElement.closest('div.bg-slate-900') || formServicioElement.closest('div[class*="bg-slate"]') || formServicioElement.parentElement;
        if (cardForm) {
            cardForm.classList.remove('border-slate-800', 'border-slate-800/80');
            cardForm.classList.add('border-amber-500/50', 'bg-amber-950/10', 'transition-all', 'duration-300');
        }
    }

    const btnSubmit = document.getElementById('btnSubmitServicio') || document.querySelector('#formServicio button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.innerText = 'Actualizar Servicio';
        btnSubmit.className = "w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2.5 px-6 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2";
    }

    const titulo = document.getElementById('formTituloServicio');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Servicio ID #${id} (Modo Edición Activo)`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormularioServicio() {
    const form = document.getElementById('formServicio');
    if (form) form.reset();
    
    const inputId = document.getElementById('servicioIdEdit');
    if (inputId) inputId.value = '';

    if (form) {
        const cardForm = form.closest('div.bg-slate-900') || form.closest('div[class*="bg-slate"]') || form.parentElement;
        if (cardForm) {
            cardForm.classList.remove('border-amber-500/50', 'bg-amber-950/10');
            cardForm.classList.add('border-slate-800/80');
        }
    }

    const btnSubmit = document.getElementById('btnSubmitServicio') || document.querySelector('#formServicio button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.innerText = 'Guardar Servicio';
        btnSubmit.className = "w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2";
    }

    const titulo = document.getElementById('formTituloServicio');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Servicio`;
    }
}

async function eliminarServicio(id) {
    if (!confirm('¿Estás seguro de que deseas desactivar este servicio?')) return;

    try {
        const response = await fetch(`/admin/servicios/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message || 'Servicio dado de baja con éxito.');
            cargarServicios(); 
        } else {
            throw new Error(result.error || 'No se pudo eliminar el servicio.');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert('Error: ' + error.message);
    }
}