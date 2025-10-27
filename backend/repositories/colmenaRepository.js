// backend/repositories/colmenaRepository.js
const db = require('../config/db');
const { SENSOR_MODELS } = require('../config/sensorModel'); // Importa la lista maestra de sensores

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
        // Lanzamos un error que será capturado por la ruta y devuelto al frontend (status 400)
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
        
        // Obtenemos solo las keys de los sensores válidos para evitar inyección o datos incorrectos
        const validSensorKeys = SENSOR_MODELS.map(s => s.key);
        const sensorsToInsert = selectedSensors.filter(key => validSensorKeys.includes(key));
        
        // Usamos un bucle para insertar uno por uno (más simple para pg-node con un número dinámico de sensores)
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
    // 1. Obtener la colmena_id a partir del hive_code
    const hiveResult = await db.query(
        'SELECT id, user_id FROM colmenas WHERE hive_code = $1', 
        [hiveCode]
    );

    if (hiveResult.rows.length === 0) {
        throw new Error(`Colmena con código ${hiveCode} no encontrada en PostgreSQL.`);
    }

    const colmenaId = hiveResult.rows[0].id;

    // 2. Obtener las claves de los sensores activos
    const sensorsResult = await db.query(
        'SELECT sensor_key FROM colmena_sensores WHERE colmena_id = $1',
        [colmenaId]
    );

    // Mapear el resultado para devolver un array de strings (keys)
    return sensorsResult.rows.map(row => row.sensor_key);
};


// 🚨 EXPORTACIÓN FINAL
module.exports = {
    createColmena,
    getColmenasByUserId,
    getActiveSensorsByHiveCode,
    SENSOR_MODELS, // Exportamos para que la ruta de listado de sensores funcione
};