// src/api/dataService.js (VERSIÓN CON FILTRO DE RANGO DE TIEMPO)
import { apiFetch } from './config';

/**
 * Obtiene el detalle de datos (latest y history) de una colmena específica.
 * La solicitud incluye el rango de tiempo como un parámetro de consulta (query parameter).
 * GET /api/data/colmena/:hiveCode?range=7d
 * * @param {string} hiveCode El código único de la colmena (ID del monitor).
 * @param {string} range El rango de tiempo (ej: '6h', '1d', '7d'). Por defecto, '7d'.
 */
export const getColmenaData = (hiveCode, range = '7d') => {
    // 1. Construimos el endpoint con el query parameter 'range'
    const endpoint = `/data/colmena/${hiveCode}?range=${range}`;

    // 2. Usamos apiFetch para realizar la solicitud
    return apiFetch(endpoint, {
        method: 'GET',
    });
};
