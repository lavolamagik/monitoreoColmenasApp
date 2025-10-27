// backend/config/sensorModel.js

// Lista maestra de sensores disponibles para personalizar una colmena
const SENSOR_MODELS = [
    { key: "temperatura_BMP280", name: "Temperatura Ambiente (BMP280)", unit: "°C" },
    { key: "humidity", name: "Humedad del Ambiente", unit: "%" },
    { key: "peso", name: "Peso de la Colmena", unit: "kg" },
    { key: "pressure", name: "Presión Atmosférica (BMP280)", unit: "hPa" },
    { key: "aX", name: "Aceleración Eje X", unit: "m/s²" },
    { key: "aY", name: "Aceleración Eje Y", unit: "m/s²" },
    { key: "aZ", name: "Aceleración Eje Z", unit: "m/s²" },
    { key: "aSqrt", name: "Aceleración Total", unit: "m/s²" },
    { key: "gY", name: "Giroscopio Eje Y", unit: "rad/s" },
    { key: "gZ", name: "Giroscopio Eje Z", unit: "rad/s" },
    { key: "gX", name: "Giroscopio Eje X", unit: "rad/s" },
    { key: "microfono", name: "Análisis de Sonido", unit: "dB" },
    { key: "con_varroa", name: "Detección de Varroa (Muestra A)", unit: "%" },
    { key: "sin_varroa", name: "Detección de Varroa (Muestra B)", unit: "%" },
];

module.exports = { SENSOR_MODELS };