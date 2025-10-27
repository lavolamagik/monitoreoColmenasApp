// frontend/src/api/config.js
// Asumo que el token está en localStorage
const getToken = () => localStorage.getItem('authToken');

// URL base de tu backend (debe coincidir con lo que configuraste en server.js)
const BASE_URL = 'http://localhost:3001/api'; 

// Función para manejar peticiones y errores de forma centralizada
export async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Headers por defecto: JSON y Token JWT si está disponible
    const headers = {
        'Content-Type': 'application/json',
        ...(getToken() && { 'Authorization': `Bearer ${getToken()}` }), // Incluir token si existe
        ...options.headers, 
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Intenta leer el cuerpo de error
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
            
            // Lanza un error para ser capturado en el componente
            throw new Error(errorData.message || `Error HTTP ${response.status}`);
        }

        if (response.status === 204) {
             return null;
        }

        return response.json();
    } catch (error) {
        // Errores de red o de sintaxis
        console.error('API Error:', error.message);
        throw error;
    }
}