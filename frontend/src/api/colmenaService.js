// src/api/colmenaService.js
import { apiFetch } from './config'; 

/**
 * Llama al endpoint para obtener la lista maestra de sensores disponibles.
 * GET /api/colmenas/sensors
 */
export const getAvailableSensors = () => {
    return apiFetch('/colmenas/sensors', {
        method: 'GET',
    });
};

/**
 * Llama al endpoint para registrar una nueva colmena y sus sensores.
 * POST /api/colmenas
 */
export const createNewColmena = (hiveCode, description, selectedSensors) => {
    return apiFetch('/colmenas', {
        method: 'POST',
        body: JSON.stringify({
            hive_code: hiveCode,
            description: description,
            selectedSensors: selectedSensors 
        }),
    });
};

/**
 * Obtiene la lista de colmenas del usuario logueado.
 * GET /api/colmenas
 */
export const getColmenasByUserId = () => {
    return apiFetch('/colmenas', {
        method: 'GET',
    });
};

export const getSensorModel = () => {
    // Simplemente llamamos a la misma función de API, 
    // pero la exportamos con el nombre que espera ColmenaDetailPage
    return getAvailableSensors();
};