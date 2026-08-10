document.addEventListener("DOMContentLoaded", function () {
    cargarServiciosDesdeBD();
    configurarFormularioServicio();
});

async function cargarServiciosDesdeBD() {
    try {
        const response = await fetch('/api/servicios');
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        const servicios = await response.json();
        renderizarTablaServicios(servicios);
    } catch (error) {
        console.error("Error al cargar los servicios:", error);
    }
}

function renderizarTablaServicios(servicios) {
    const tbody = document.getElementById('tabla-servicios');
    if (!tbody) return;
    
    tbody.innerHTML = ''; 

    if (!servicios || servicios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500 italic">No hay servicios registrados en la base de datos.</td></tr>`;
        const totalElem = document.getElementById('total-servicios');
        if (totalElem) totalElem.innerText = `0 servicios`;
        return;
    }

    servicios.forEach(serv => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800/50 text-sm text-slate-300 hover:bg-slate-800/30 transition-all duration-150";
        
        const activo = serv.activo == 1 || serv.activo === true;
        const estadoBadge = activo 
            ? `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">Activo</span>`
            : `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">Inactivo</span>`;

        const imgHtml = serv.imagen_url 
            ? `<span class="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800">${serv.imagen_url}</span>` 
            : `<span class="text-xs text-slate-600 italic">Sin imagen</span>`;

        const precioFormateado = Number(serv.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });

        tr.innerHTML = `
            <td class="py-4 px-6 font-mono text-slate-400 text-xs font-medium">#${serv.id}</td>
            <td class="py-4 px-6">${imgHtml}</td>
            <td class="py-4 px-6 font-medium text-slate-200">${serv.nombre}</td>
            <td class="py-4 px-6 text-emerald-400 font-semibold">$${precioFormateado}</td>
            <td class="py-4 px-6 text-slate-300">${serv.duracion} dias</td>
            <td class="py-4 px-6">${estadoBadge}</td>
            <td class="py-4 px-6 text-right whitespace-nowrap space-x-2">
                <button type="button" onclick="verDetalleServicio(${serv.id}, '${serv.nombre}', '${precioFormateado}', ${serv.duracion})" class="bg-slate-950 hover:bg-blue-600/20 text-blue-400 border border-slate-800 hover:border-blue-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Ver Detalles">
                    <i class="fa-solid fa-eye text-xs"></i>
                </button>
                <button type="button" onclick="prepararEditarServicio(${serv.id}, '${serv.nombre.replace(/'/g, "\\'")}', ${serv.precio}, ${serv.duracion})" class="bg-slate-950 hover:bg-amber-600/20 text-amber-400 border border-slate-800 hover:border-amber-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Editar Servicio">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button type="button" onclick="eliminarServicio(${serv.id})" class="bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Eliminar / Desactivar">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalElem = document.getElementById('total-servicios');
    if (totalElem) totalElem.innerText = `${servicios.length} servicios`;
}

function verDetalleServicio(id, nombre, precio, duracion) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: `Servicio #${id}`,
            html: `<b>Nombre:</b> ${nombre}<br><b>Precio:</b> $${precio}<br><b>Duración:</b> ${duracion} días`,
            background: '#0D111A', color: '#f3f4f6', confirmButtonColor: '#2563eb'
        });
    } else {
        alert(`Detalle del Servicio #${id}\n\nNombre: ${nombre}\nPrecio: $${precio}\nDuración: ${duracion} días`);
    }
}

window.prepararEditarServicio = function(id, nombre, precio, duracion) {
    const inputId = document.getElementById('servicioId');
    const inputNombre = document.getElementById('nuevoNombre');
    const inputPrecio = document.getElementById('nuevoPrecio');
    const inputDuracion = document.getElementById('nuevaDuracion');

    if (inputId) inputId.value = id;
    if (inputNombre) inputNombre.value = nombre;
    if (inputPrecio) inputPrecio.value = precio;
    if (inputDuracion) inputDuracion.value = duracion;
    
    const submitBtn = document.querySelector('#formNuevoServicio button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerText = 'Actualizar Servicio';
        submitBtn.className = "bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all";
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'info',
            title: 'Modo Edición Activado',
            text: `Editando el servicio: "${nombre}". Modifica los datos y guarda los cambios.`,
            confirmButtonColor: '#d97706',
            background: '#0D111A', color: '#f3f4f6', timer: 2500, timerProgressBar: true
        });
    }
};

async function eliminarServicio(id) {
    let confirmar = false;

    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '¿Estás seguro?', text: "Esta acción dará de baja el servicio seleccionado.",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', cancelButtonColor: '#475569',
            confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', background: '#0D111A', color: '#f3f4f6'
        });
        confirmar = result.isConfirmed;
    } else {
        confirmar = confirm('¿Estás seguro de que deseas desactivar este servicio?');
    }

    if (!confirmar) return;

    try {
        const response = await fetch(`/admin/servicios/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            if (typeof Swal !== 'undefined') {
                await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Servicio dado de baja con éxito.', timer: 1500, showConfirmButton: false, background: '#0D111A', color: '#f3f4f6' });
            } else {
                alert('Servicio dado de baja con éxito.');
            }
            cargarServiciosDesdeBD(); 
        } else {
            throw new Error('No se pudo eliminar el servicio.');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#0D111A', color: '#f3f4f6' });
        } else {
            alert('Error: ' + error.message);
        }
    }
}

function configurarFormularioServicio() {
    const form = document.getElementById('formNuevoServicio');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const servicioId = document.getElementById('servicioId').value;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = servicioId ? 'Actualizando...' : 'Guardando...';
            }

            const formData = new FormData();
            formData.append('nombre', document.getElementById('nuevoNombre').value);
            formData.append('precio', document.getElementById('nuevoPrecio').value);
            formData.append('duracion', document.getElementById('nuevaDuracion').value);
            
            const archivoInput = document.getElementById('imagenServicio');
            if (archivoInput && archivoInput.files[0]) {
                formData.append('imagen', archivoInput.files[0]);
            }

            const url = servicioId ? `/admin/servicios/${servicioId}` : '/admin/servicios';
            const method = servicioId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    form.reset();
                    document.getElementById('servicioId').value = '';
                    
                    if (submitBtn) {
                        submitBtn.innerText = 'Guardar Servicio';
                        submitBtn.className = "bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all";
                    }
                    
                    if (typeof Swal !== 'undefined') {
                        await Swal.fire({
                            icon: 'success', title: '¡Éxito!',
                            text: result.message || 'Servicio guardado correctamente.',
                            confirmButtonColor: '#2563eb', background: '#0D111A', color: '#f3f4f6', timer: 1500, showConfirmButton: false
                        });
                    } else {
                        alert('¡Éxito! Servicio guardado correctamente.');
                    }
                    
                    cargarServiciosDesdeBD();

                } else {
                    throw new Error(result.error || 'No se pudo guardar el servicio.');
                }
            } catch (error) {
                console.error('Error durante el guardado:', error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Atención', text: error.message, background: '#0D111A', color: '#f3f4f6' });
                } else {
                    alert('Error: ' + error.message);
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    if (!document.getElementById('servicioId').value) {
                        submitBtn.innerText = 'Guardar Servicio';
                    }
                }
            }
        });
    }
}