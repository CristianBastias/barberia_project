document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensajeError = document.getElementById('mensajeError');
    const alertaExito = document.getElementById('alertaExito');
    const btnSubmit = document.getElementById('btnSubmit');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuario = document.getElementById('usuario').value;
            const password = document.getElementById('password').value;

            // Ocultar errores previos
            if (mensajeError) {
                mensajeError.classList.add('hidden');
                mensajeError.textContent = '';
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    console.log('Login exitoso, mostrando alerta...');

                    // 1. Mostrar la alerta verde de éxito
                    if (alertaExito) {
                        alertaExito.classList.remove('hidden');
                    }

                    // 2. Deshabilitar el botón y cambiar texto
                    if (btnSubmit) {
                        btnSubmit.disabled = true;
                        btnSubmit.textContent = "Verificado...";
                    }

                    // 3. Esperar 1.5 segundos antes de redirigir para que se vea el cartel
                    setTimeout(() => {
                        window.location.href = data.redirectUrl || '/admin';
                    }, 1500);

                } else {
                    if (mensajeError) {
                        mensajeError.textContent = data.error || 'Credenciales inválidas.';
                        mensajeError.classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error('Error de red:', err);
                if (mensajeError) {
                    mensajeError.textContent = 'Error de conexión con el servidor.';
                    mensajeError.classList.remove('hidden');
                }
            }
        });
    }
});