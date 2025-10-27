const express = require('express');
const router = express.Router();
// Asumimos que la conexión a PostgreSQL está en la ruta correcta
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para generar el Token Web JSON
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, rol: user.rol }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// =======================================================
// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario (Apicultor por defecto)
// =======================================================
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    // Asignamos 'apicultor' como rol por defecto al registrarse desde el frontend.
    const rol = 'apicultor'; 

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const userExistsQuery = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExistsQuery.rows.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado. Intenta iniciar sesión.' });
        }

        // 2. Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insertar el nuevo usuario en la tabla 'users' de PostgreSQL
        // NOTA: Asumimos que la tabla tiene las columnas: name, email, password_hash, y rol.
        const newUserQuery = `
            INSERT INTO users (name, email, password_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, rol;
        `;
        const result = await db.query(newUserQuery, [name, email, password_hash, rol]);
        const newUser = result.rows[0];

        // 4. Respuesta de éxito
        res.status(201).json({
            message: 'Registro exitoso. Ahora puedes iniciar sesión.',
            // Opcional: devolver datos del usuario, pero el frontend solo necesita el mensaje para cambiar de vista.
            user: {
                id: newUser.id,
                name: newUser.name,
                rol: newUser.rol,
            }
        });

    } catch (error) {
        console.error('Error al registrar usuario en PostgreSQL:', error);
        // Podrías devolver un error más genérico por seguridad
        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
});


// =======================================================
// @route   POST /api/auth/login
// @desc    Autenticar usuario y devolver token
// =======================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar el usuario por email
        const result = await db.query('SELECT id, name, email, password_hash, rol FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas: Email no encontrado.' });
        }

        // 2. Comparar la contraseña hasheada (Campo 'password_hash')
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            // Este es el error que estás viendo en la imagen: 401 Unauthorized
            return res.status(401).json({ message: 'Credenciales inválidas: Contraseña incorrecta.' });
        }

        // 3. Generar el Token JWT
        const token = generateToken(user);

        // 4. Devolver la respuesta exitosa al frontend
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                rol: user.rol,
            },
        });

    } catch (error) {
        console.error('Error al intentar login:', error);
        res.status(500).json({ message: 'Error del servidor al procesar el login.' });
    }
});

module.exports = router;