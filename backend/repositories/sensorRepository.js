// backend/repositories/sensorRepository.js (SOLUCIÓN TEMPORAL: MUESTRA TODOS LOS DATOS)
const { queryInflux, bucket } = require('../config/influxdb'); 

// Ya no usamos FLUX_HIVE_CODE_TAG en esta solución temporal
// const FLUX_HIVE_CODE_TAG = 'id'; 

const buildMeasurementFilters = (activeSensors) => {
    if (!activeSensors || activeSensors.length === 0) return 'false'; 

    return activeSensors
        .map(m => `r._measurement == "${m}"`)
        .join(" or ");
};


/**
 * @exports getHiveSensorHistory
 * Muestra datos históricos de TODO EL BUCKET, filtrados solo por RANGO y MEDICIÓN.
 */
const getHiveSensorHistory = async (hiveCode, activeSensors, isPrototype, rangeValue = '365d') => {
    const filters = buildMeasurementFilters(activeSensors);
    
    const fluxRangeStart = `-${rangeValue}`; 

    // 🚨 CAMBIO CLAVE: Eliminamos el filtro por hiveCode/id
    // const hiveCodeFilterLine = ''; 

    // El prototipo ya no es necesario si quitamos el filtro de colmena
    const fluxQuery = `
from(bucket: "${bucket}")
|> range(start: ${fluxRangeStart})
// El filtro por hiveCode/id ha sido OMITIDO TEMPORALMENTE
|> filter(fn: (r) => ${filters})
|> filter(fn: (r) => r._field == "value") 
|> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
|> yield(name: "history_data")
`;
    
    return queryInflux(fluxQuery); 
};


/**
 * @exports getLatestHiveData
 * Obtiene el valor más reciente de CADA SENSOR en todo el bucket.
 */
const getLatestHiveData = async (hiveCode, activeSensors, isPrototype) => {
    const filters = buildMeasurementFilters(activeSensors);
    
    // 🚨 CAMBIO CLAVE: Eliminamos el filtro por hiveCode/id
    const fluxQuery = `
from(bucket: "${bucket}")
|> range(start: -30d) 
// El filtro por hiveCode/id ha sido OMITIDO TEMPORALMENTE
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