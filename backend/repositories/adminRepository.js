// backend/repositories/adminRepository.js
const db = require('../config/db');

/**
 * @exports getAllUsersWithHiveCount
 * Obtiene todos los usuarios y el número de colmenas que tiene cada uno.
 */
const getAllUsersWithHiveCount = async () => {
    // Consulta SQL que usa LEFT JOIN para contar las colmenas de cada usuario
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.rol, 
            u.created_at,
            COALESCE(COUNT(c.id), 0) AS total_hives
        FROM users u
        LEFT JOIN colmenas c ON u.id = c.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * @exports getAllManagedHives
 * Obtiene todas las colmenas registradas y a quién están asignadas.
 */
const getAllManagedHives = async () => {
    const query = `
        SELECT 
            c.id,
            c.hive_code,
            c.description,
            c.created_at,
            u.name AS apicultor_name,
            u.email AS apicultor_email
        FROM colmenas c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

const updateUser = async (userId, name, email, rol) => {
    // Nota: No incluimos password en esta función por seguridad.
    const query = `
        UPDATE users 
        SET name = $1, email = $2, rol = $3
        WHERE id = $4
        RETURNING id;
    `;
    const result = await db.query(query, [name, email, rol, userId]);
    if (result.rowCount === 0) {
        throw new Error("Usuario no encontrado.");
    }
    return result.rows[0];
};

module.exports = {
    getAllUsersWithHiveCount,
    getAllManagedHives,
    updateUser,
};