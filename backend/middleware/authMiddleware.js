const jwt = require('jsonwebtoken');

/**
 * @desc Verifica la validez del Token JWT.
 * @exports protect
 */
exports.protect = (req, res, next) => {
    let token;

    // 1. Verificar si el token está en el encabezado (Authorization: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraer el token (eliminar "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar y decodificar el token con el secreto
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Adjuntar la información del usuario (id y rol) a la solicitud
            req.user = decoded; // { id: user.id, rol: user.rol }
            
            next(); // El token es válido, continuar a la siguiente función de la ruta
        } catch (error) {
            // Error: Token inválido, expirado o alterado
            console.error('Error de autenticación JWT:', error.message);
            return res.status(401).json({ message: 'No autorizado, token inválido o expirado.' });
        }
    } else {
        // Error: No se envió ningún token
        return res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

/**
 * @desc Restringe el acceso a la ruta según el rol del usuario.
 * @exports roleMiddleware
 */
exports.roleMiddleware = (roles) => (req, res, next) => {
    // Si la función protect fue exitosa, req.user está adjunto.
    if (!req.user || !roles.includes(req.user.rol)) {
        // 403 Forbidden
        return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes para este recurso.' });
    }
    next();
};