// backend/repositories/sensorRepository.js (CÓDIGO FINAL CON FALLBACK)
const { queryInflux, bucket } = require('../config/influxdb'); 

const FLUX_HIVE_CODE_TAG = 'hive_code'; 

const buildMeasurementFilters = (activeSensors) => {
    if (!activeSensors || activeSensors.length === 0) return 'false'; 

    return activeSensors
        .map(m => `r._measurement == "${m}"`)
        .join(" or ");
};


/**
 * @exports getHiveSensorHistory
 * Agrega el parámetro isPrototype para el fallback de datos sin ID.
 */
const getHiveSensorHistory = async (hiveCode, activeSensors, isPrototype, range = '-365d') => {
    const filters = buildMeasurementFilters(activeSensors);
    
    // LÓGICA DE FALLBACK: Si es prototipo, no incluimos el filtro de ID.
    const hiveCodeFilter = isPrototype 
        ? '' // Vacío, no filtra por ID
        : `|> filter(fn: (r) => r.${FLUX_HIVE_CODE_TAG} == "${hiveCode}")`;

    const fluxQuery = `
        from(bucket: "${bucket}")
            |> range(start: ${range})
            ${hiveCodeFilter}  
            |> filter(fn: (r) => ${filters}) 
            |> filter(fn: (r) => r._field == "value") 
            |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
            |> yield(name: "history_data")
    `;
    
    return queryInflux(fluxQuery); 
};


/**
 * @exports getLatestHiveData
 * Agrega el parámetro isPrototype para el fallback de datos sin ID.
 */
const getLatestHiveData = async (hiveCode, activeSensors, isPrototype) => {
    const filters = buildMeasurementFilters(activeSensors);
    
    // LÓGICA DE FALLBACK: Si es prototipo, no incluimos el filtro de ID.
    const hiveCodeFilter = isPrototype 
        ? '' // Vacío, no filtra por ID
        : `|> filter(fn: (r) => r.${FLUX_HIVE_CODE_TAG} == "${hiveCode}")`;

    const fluxQuery = `
        from(bucket: "${bucket}")
            |> range(start: -30d) 
            ${hiveCodeFilter} 
            |> filter(fn: (r) => ${filters})
            |> filter(fn: (r) => r._field == "value") 
            |> last()
            |> yield(name: "latest_data")
    `;

    const results = await queryInflux(fluxQuery);
    
    const latest = {};
    results.forEach(row => {
        const key = row._measurement; 
        if (key) {
            latest[key] = {
                value: row._value,
                time: row._time
            };
        }
    });

    return latest;
};


// 🚨 EXPORTACIÓN FINAL
module.exports = {
    getHiveSensorHistory,
    getLatestHiveData,
};