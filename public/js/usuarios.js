document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    const formUsuario = document.getElementById('formUsuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', registrarUsuario);
    }
});

async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        const tbody = document.getElementById('tablaUsuariosCuerpo');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">No hay usuarios registrados.</td></tr>`;
            return;
        }

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-4 px-4 font-mono text-xs text-slate-300">#${u.id}</td>
                <td class="py-4 px-4 text-white font-medium">${u.nombre || u.email}</td>
                <td class="py-4 px-4 text-slate-300">${u.rol || 'empleado'}</td>
                <td class="py-4 px-4 text-slate-400 text-xs">${u.email}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function registrarUsuario(e) {
    e.preventDefault();
    const nuevoUsuario = {
        nombre: document.getElementById('nombreUsuario').value,
        email: document.getElementById('emailUsuario').value,
        password: document.getElementById('passwordUsuario').value,
        rol: document.getElementById('rolUsuario').value
    };

    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        if (!response.ok) throw new Error('No se pudo registrar el usuario');

        this.reset();
        cargarUsuarios();
        alert('¡Usuario registrado con éxito!');
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrar el usuario.');
    }
}