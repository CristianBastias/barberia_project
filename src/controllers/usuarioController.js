// Obtener lista de usuarios
async function obtenerUsuarios(req, res) {
    try {
        const [rows] = await db.execute('SELECT id, nombre, usuario, rol FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
}

// Actualizar usuario (Rol, Nombre, Credenciales)
async function actualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const { nombre, usuario, rol, password } = req.body;

        if (password && password.trim() !== '') {
            // Si incluye contraseña nueva (recuerda aplicar hash si usas bcrypt)
            await db.execute(
                'UPDATE usuarios SET nombre = ?, usuario = ?, rol = ?, password = ? WHERE id = ?',
                [nombre, usuario, rol, password, id]
            );
        } else {
            // Si no modifica la contraseña, actualizamos solo los demás campos
            await db.execute(
                'UPDATE usuarios SET nombre = ?, usuario = ?, rol = ? WHERE id = ?',
                [nombre, usuario, rol, id]
            );
        }

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
}