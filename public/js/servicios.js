document.addEventListener("DOMContentLoaded", function () {
    cargarServiciosDesdeBD();

    const formNuevoServicio = document.getElementById('formNuevoServicio');
    if (formNuevoServicio) {
        formNuevoServicio.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('btnSubmitServicio');
            const id = document.getElementById('servicioId').value;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = id ? 'Actualizando...' : 'Guardando...';
            }

            const formData = new FormData();
            formData.append('nombre', document.getElementById('nuevoNombre').value.trim());
            formData.append('precio', document.getElementById('nuevoPrecio').value);
            formData.append('duracion', document.getElementById('nuevaDuracion').value);
            
            const archivoInput = document.getElementById('imagenServicio');
            if (archivoInput && archivoInput.files[0]) {
                formData.append('imagen', archivoInput.files[0]);
            }

            try {
                let response;
                if (id) {
                    response = await fetch(`/admin/servicios/${id}`, {
                        method: 'PUT',
                        body: formData
                    });
                } else {
                    response = await fetch('/admin/servicios', {
                        method: 'POST',
                        body: formData
                    });
                }

                const result = await response.json().catch(() => ({}));

                if (response.ok) {
                    alert(id ? '¡Servicio actualizado con éxito!' : '¡Servicio registrado con éxito!');
                    resetearFormularioServicio();
                    cargarServiciosDesdeBD();
                } else {
                    alert(result.error || 'Error al procesar la solicitud.');
                }
            } catch (error) {
                console.error("Error:", error);
                alert('Error de conexión con el servidor.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = id ? 'Actualizar Servicio' : 'Guardar Servicio';
                }
            }
        });
    }
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
    const contador = document.getElementById('total-servicios');
    if (!tbody) return;
    
    tbody.innerHTML = ''; 

    if (!servicios || servicios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500 italic">No hay servicios registrados en la base de datos.</td></tr>`;
        if (contador) contador.innerText = `0 servicios`;
        return;
    }

    servicios.forEach(serv => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800/50 text-sm text-slate-300 hover:bg-slate-800/30 transition-all duration-150";
        
        const imgHtml = serv.imagen_url 
            ? `<span class="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800">${serv.imagen_url}</span>` 
            : `<span class="text-xs text-slate-600 italic">Sin imagen</span>`;

        const precioFormateado = Number(serv.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });

        // --- LÓGICA DE CUENTA REGRESIVA PARA LA DURACIÓN ---
        const fechaCreacion = new Date(serv.created_at || Date.now());
        const diasDuracion = Number(serv.duracion) || 0;
        
        const fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + diasDuracion);
        
        const hoy = new Date();
        const diferenciaTiempo = fechaVencimiento - hoy;
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

        let estiloDuracion = "text-slate-300";
        let badgeAlerta = "";

        if (diasRestantes <= 0) {
            estiloDuracion = "text-rose-500 font-bold";
            badgeAlerta = `<span class="ml-1.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">Vencido</span>`;
        } else if (diasRestantes <= 3) {
            estiloDuracion = "text-rose-400 font-bold"; // Alerta Roja (3 días o menos)
            badgeAlerta = `<span class="ml-1.5 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">¡Crítico!</span>`;
        } else if (diasRestantes <= 5) {
            estiloDuracion = "text-amber-400 font-semibold"; // Alerta Naranja (5 días o menos)
            badgeAlerta = `<span class="ml-1.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">¡Atención!</span>`;
        }

        const duracionHtml = `<span class="${estiloDuracion}">${diasRestantes > 0 ? diasRestantes + ' días restantes' : 'Finalizado'}</span> ${badgeAlerta}`;
        // ----------------------------------------------------

        tr.innerHTML = `
            <td class="py-4 px-6 font-mono text-slate-400 text-xs font-medium">#${serv.id}</td>
            <td class="py-4 px-6">${imgHtml}</td>
            <td class="py-4 px-6 font-medium text-slate-200">${serv.nombre}</td>
            <td class="py-4 px-6 text-emerald-400 font-semibold">$${precioFormateado}</td>
            <td class="py-4 px-6">${duracionHtml}</td>
            <td class="py-4 px-6 text-right whitespace-nowrap space-x-2">
                <button type="button" onclick="prepararEditarServicio(${serv.id}, '${serv.nombre.replace(/'/g, "\\'")}', ${serv.precio}, ${serv.duracion})" class="bg-slate-950 hover:bg-amber-600/20 text-amber-400 border border-slate-800 hover:border-amber-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Editar Servicio">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button type="button" onclick="eliminarServicio(${serv.id})" class="bg-slate-950 hover:bg-rose-600/20 text-rose-400 border border-slate-800 hover:border-rose-500/30 p-2 rounded-xl transition-all shadow-sm cursor-pointer" title="Eliminar Servicio">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (contador) contador.innerText = `${servicios.length} servicios`;
}

function prepararEditarServicio(id, nombre, precio, duracion) {
    document.getElementById('servicioId').value = id;
    document.getElementById('nuevoNombre').value = nombre;
    document.getElementById('nuevoPrecio').value = precio;
    document.getElementById('nuevaDuracion').value = duracion;
    
    const cardForm = document.getElementById('formNuevoServicio').closest('div');
    if (cardForm) {
        cardForm.classList.remove('border-slate-800/80');
        cardForm.classList.add('border-amber-500/50', 'bg-amber-950/10');
    }

    const btnSubmit = document.getElementById('btnSubmitServicio');
    if (btnSubmit) {
        btnSubmit.innerText = 'Actualizar Servicio';
        btnSubmit.className = "bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer";
    }

    const titulo = document.getElementById('formTituloSeccion');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Servicio #${id} (Modo Edición Activo)`;
    }
    
    const btnCancelar = document.getElementById('btnCancelarEdicionServicio');
    if (btnCancelar) btnCancelar.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormularioServicio() {
    document.getElementById('formNuevoServicio').reset();
    document.getElementById('servicioId').value = '';
    
    const cardForm = document.getElementById('formNuevoServicio').closest('div');
    if (cardForm) {
        cardForm.classList.add('border-slate-800/80');
        cardForm.classList.remove('border-amber-500/50', 'bg-amber-950/10');
    }

    const btnSubmit = document.getElementById('btnSubmitServicio');
    if (btnSubmit) {
        btnSubmit.innerText = 'Guardar Servicio';
        btnSubmit.className = "bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer";
    }

    const titulo = document.getElementById('formTituloSeccion');
    if (titulo) {
        titulo.className = "text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2";
        titulo.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Registrar Nuevo Servicio`;
    }
    
    const btnCancelar = document.getElementById('btnCancelarEdicionServicio');
    if (btnCancelar) btnCancelar.classList.add('hidden');
}

async function eliminarServicio(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    try {
        const response = await fetch(`/admin/servicios/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert('Servicio eliminado correctamente.');
            // ESTA LÍNEA ES LA QUE REFRESCA LA TABLA:
            await cargarServiciosDesdeBD(); 
        } else {
            const data = await response.json().catch(() => ({}));
            alert(data.error || 'No se pudo eliminar el servicio.');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert('Error de conexión al intentar eliminar.');
    }
}