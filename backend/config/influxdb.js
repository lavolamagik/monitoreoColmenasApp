// backend/config/influxdb.js (CÓDIGO MODIFICADO)
const { InfluxDB } = require('@influxdata/influxdb-client');
require('dotenv').config(); // Asegurar que dotenv esté cargado si este módulo se usa solo

const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

/**
 * Función para probar la conexión a InfluxDB ejecutando una consulta trivial.
 */
async function testInfluxConnection() {
    try {
        // Consulta FLUX simple: Obtener el primer punto de datos en el bucket
        const testQuery = `
            from(bucket: "${bucket}")
            |> range(start: 0)
            |> limit(n: 1)
        `;
        
        // Ejecutamos la consulta. Si no hay error, la conexión es exitosa.
        await new Promise((resolve, reject) => {
            queryApi.queryRows(testQuery, {
                next: () => {}, // No necesitamos los datos
                error: (error) => {
                    reject(error);
                },
                complete: () => {
                    resolve();
                },
            });
        });
        
        console.log(`Conexión a InfluxDB (URL: ${url}) establecida correctamente.`);
        
    } catch (error) {
        console.error('🚨 ERROR CRÍTICO: Fallo al conectar/consultar InfluxDB.');
        console.error(`URL: ${url}. Org: ${org}. Error: ${error.message}`);
        console.error('Revisa tu INFLUXDB_TOKEN, INFLUXDB_ORG y la URL en .env.');
        // Opcional: Si InfluxDB es crítico, podrías salir del proceso aquí:
        // process.exit(1); 
    }
}

// Llama a la función de prueba de conexión al exportar el módulo
testInfluxConnection(); 


/**
 * Función genérica para ejecutar una consulta FLUX y devolver los datos en un array de objetos.
 * ... (resto de la función queryInflux se mantiene igual)
 */
async function queryInflux(fluxQuery) {
    const results = [];
    
    return new Promise((resolve, reject) => {
        queryApi.queryRows(fluxQuery, {
            next: (row, tableMeta) => {
                const object = tableMeta.toObject(row);
                results.push(object);
            },
            error: (error) => {
                console.error('Error al consultar InfluxDB:', error);
                reject(error);
            },
            complete: () => {
                // console.log(`Consulta InfluxDB completada. Filas: ${results.length}`); // Puedes comentar esto para limpiar logs
                resolve(results);
            },
        });
    });
}

module.exports = {
    queryInflux,
    bucket, 
    org
};