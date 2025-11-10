// backend/repositories/colmenaRepository.js
const db = require('../config/db'); 
const { SENSOR_MODELS } = require('../config/sensorModel'); 

// =======================================================
// EXPORTS DE LECTURA Y CREACIÓN (Originales)
// =======================================================

/**
 * @exports createColmena
 * Registra una nueva colmena con el código de monitor y sus sensores seleccionados.
 */
const createColmena = async (hiveCode, description, selectedSensors, userId) => {
    // 1. Verificar si el hive_code ya está en uso (columna UNIQUE)
    const existingHive = await db.query(
        'SELECT id FROM colmenas WHERE hive_code = $1', 
        [hiveCode]
    );

    if (existingHive.rows.length > 0) {
        throw new Error(`El código de monitor ${hiveCode} ya está registrado por otro apicultor.`);
    }

    // 2. Insertar la nueva colmena en la tabla 'colmenas'
    const newHiveQuery = `
        INSERT INTO colmenas (hive_code, description, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, hive_code;
    `;
    const result = await db.query(newHiveQuery, [hiveCode, description || null, userId]);
    const newColmena = result.rows[0];
    const colmenaId = newColmena.id;

    // 3. Insertar los sensores seleccionados en la tabla 'colmena_sensores'
    if (selectedSensors && selectedSensors.length > 0) {
        const validSensorKeys = SENSOR_MODELS.map(s => s.key);
        const sensorsToInsert = selectedSensors.filter(key => validSensorKeys.includes(key));
        
        for (const key of sensorsToInsert) {
             await db.query(
                 'INSERT INTO colmena_sensores (colmena_id, sensor_key) VALUES ($1, $2)', 
                 [colmenaId, key]
             );
        }
    }
    
    return { id: colmenaId, hive_code: newColmena.hive_code };
};


/**
 * @exports getColmenasByUserId
 * Obtiene todas las colmenas registradas por un apicultor.
 */
const getColmenasByUserId = async (userId) => {
    const query = `
        SELECT id, hive_code, description, created_at
        FROM colmenas
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * @exports getActiveSensorsByHiveCode
 * Obtiene las claves de los sensores activos para una colmena específica.
 * Usado por dataRoutes.js para filtrar la consulta a InfluxDB.
 */
const getActiveSensorsByHiveCode = async (hiveCode) => {
    // 1. Obtener la colmena_id
    const hiveResult = await db.query(
        'SELECT id, user_id FROM colmenas WHERE hive_code = $1', 
        [hiveCode]
    );

    if (hiveResult.rows.length === 0) {
        throw new Error(`Colmena con código ${hiveCode} no encontrada en PostgreSQL.`);
    }

    const hive = hiveResult.rows[0];
    const colmenaIdInterna = hive.id; 

    // 2. Obtener las claves de los sensores activos
    const sensorsResult = await db.query(
        'SELECT sensor_key FROM colmena_sensores WHERE colmena_id = $1',
        [colmenaIdInterna]
    );

    // Mapear el resultado para devolver un array de strings (keys)
    return sensorsResult.rows.map(row => row.sensor_key);
};


// =======================================================
// 🚨 FUNCIONES DE EDICIÓN Y ELIMINACIÓN (CRÍTICAS PARA EL MODAL)
// =======================================================

/**
 * @exports getHiveDetailsByCode
 * Obtiene los detalles de una colmena por su hiveCode, incluyendo sus sensores activos.
 * Esta función resuelve el problema de la desincronización de datos para el modal de edición.
 */
const getHiveDetailsByCode = async (hiveCode) => {
    // 1. Obtener la información base
    const hiveResult = await db.query(
        'SELECT id, hive_code, description, user_id FROM colmenas WHERE hive_code = $1', 
        [hiveCode]
    );

    if (hiveResult.rows.length === 0) {
        return null;
    }

    const hive = hiveResult.rows[0];
    const colmenaIdInterna = hive.id;
    
    // 2. Obtener los sensores activos
    const sensorsResult = await db.query(
        'SELECT sensor_key FROM colmena_sensores WHERE colmena_id = $1',
        [colmenaIdInterna]
    );

    // 3. Agregar los sensores al objeto de colmena bajo el nombre esperado por el frontend
    hive.selectedSensors = sensorsResult.rows.map(row => row.sensor_key);
    
    // Devolvemos el objeto completo
    return hive;
};


/**
 * @exports updateColmena
 * Actualiza la descripción y los sensores de una colmena existente.
 * Utiliza una transacción atómica.
 */
const updateColmena = async (hiveCode, description, selectedSensors) => {
    // Nota: Asumimos que db.pool.connect() existe en tu configuración de db.js
    const client = await db.pool.connect(); 
    try {
        await client.query('BEGIN');

        // 1. Obtener la ID interna
        const idResult = await client.query('SELECT id FROM colmenas WHERE hive_code = $1', [hiveCode]);
        if (idResult.rowCount === 0) throw new Error(`Colmena ${hiveCode} no encontrada.`);
        const colmenaId = idResult.rows[0].id;
        
        // 2. Actualizar la descripción
        const updateDescriptionQuery = `
            UPDATE colmenas 
            SET description = $1
            WHERE id = $2
            RETURNING id;
        `;
        const result = await client.query(updateDescriptionQuery, [description, colmenaId]);
        
        // 3. Eliminar sensores antiguos
        await client.query('DELETE FROM colmena_sensores WHERE colmena_id = $1', [colmenaId]);
        
        // 4. Insertar nuevos sensores
        const validSensorKeys = SENSOR_MODELS.map(s => s.key);
        const sensorsToInsert = selectedSensors.filter(key => validSensorKeys.includes(key));
        
        for (const key of sensorsToInsert) {
             await client.query(
                 'INSERT INTO colmena_sensores (colmena_id, sensor_key) VALUES ($1, $2)', 
                 [colmenaId, key]
             );
        }

        await client.query('COMMIT');
        return { id: colmenaId, hive_code: hiveCode };

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Transacción fallida al editar colmena:", e);
        throw e;
    } finally {
        client.release(); // Liberar el cliente de la pool
    }
};

/**
 * @exports deleteColmena
 * Elimina la colmena (usada en la ruta DELETE).
 */
const deleteColmena = async (hiveCode) => {
    // Usamos DELETE FROM colmenas, y CASCADE se encarga de colmena_sensores.
    const result = await db.query('DELETE FROM colmenas WHERE hive_code = $1', [hiveCode]);
    
    if (result.rowCount === 0) {
        throw new Error(`Colmena ${hiveCode} no encontrada para eliminación.`);
    }
    return true;
};


// =======================================================
// EXPORTACIÓN FINAL
// =======================================================
module.exports = {
    createColmena,
    getColmenasByUserId,
    getActiveSensorsByHiveCode,
    getHiveDetailsByCode,
    updateColmena, 
    deleteColmena, 
    SENSOR_MODELS, 
};