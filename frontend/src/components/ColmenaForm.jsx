// src/components/ColmenaForm.jsx (Código Refactorizado)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableSensors, createNewColmena } from '../api/colmenaService'; 

// --- Constantes de Diseño ---
const THEME_COLOR = '#D97706'; // Miel Oscura
const ACCENT_COLOR = '#F6AD55'; // Naranja/Miel

const styles = {
    // Contenedor principal del formulario
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        padding: '10px 0',
        fontFamily: 'Inter, sans-serif'
    },
    // Estilos para agrupar campos de texto
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: { 
        fontWeight: 'bold', 
        marginBottom: '5px', 
        color: '#4A5568' // Color de texto oscuro
    },
    input: { 
        padding: '10px 12px', 
        borderRadius: '6px', 
        border: '1px solid #E2E8F0', 
        width: '100%',
        boxSizing: 'border-box', // Crucial para que padding no agrande el ancho
        fontSize: '15px'
    },
    // Corrección: Altura máxima para la descripción
    textarea: {
        height: '80px', // Altura fija y limpia
        resize: 'none', // Evitar que el usuario lo redimensione
    },
    
    // Contenedor de Checkboxes
    checkboxContainer: {
        border: '1px solid #CBD5E0',
        borderRadius: '6px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    // Estilo para cada item checkbox
    checkboxItem: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        fontSize: '15px',
    },
    checkboxInput: {
        width: '18px', 
        height: '18px',
        cursor: 'pointer',
        accentColor: ACCENT_COLOR, // Pinta el checkbox con el color de acento
    },
    // Estilo para el botón
    button: { 
        padding: '12px', 
        backgroundColor: ACCENT_COLOR, 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        marginTop: '10px',
        transition: 'background-color 0.2s',
    },
    buttonDisabled: {
        backgroundColor: '#FBD38D', // Color más claro para deshabilitado
        cursor: 'not-allowed',
    },
    error: { 
        color: 'red', 
        backgroundColor: '#FEF2F2', 
        padding: '10px', 
        borderRadius: '6px', 
        border: '1px solid #FEE2E2',
        marginBottom: '10px' 
    },
    success: {
        color: 'green', 
        backgroundColor: '#ECFDF5', 
        padding: '10px', 
        borderRadius: '6px',
        border: '1px solid #D1FAE5',
        marginBottom: '10px'
    }
};

function ColmenaForm({ onColmenaRegistered }) {
    const [sensors, setSensors] = useState([]);
    const [hiveCode, setHiveCode] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSensors, setSelectedSensors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Cargar la lista de sensores disponibles
    useEffect(() => {
        const loadSensors = async () => {
            try {
                const availableSensors = await getAvailableSensors();
                setSensors(availableSensors);
            } catch (err) {
                setError('Error al cargar la lista de sensores disponibles.');
                console.error(err);
            }
        };
        loadSensors();
    }, []);

    // --- NUEVA LÓGICA: SELECCIONAR/DESELECCIONAR TODOS ---
    const allSensorsSelected = selectedSensors.length === sensors.length && sensors.length > 0;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Seleccionar todos: Crea un array con todas las keys
            setSelectedSensors(sensors.map(s => s.key));
        } else {
            // Deseleccionar todos
            setSelectedSensors([]);
        }
    };

    // Manejar la selección/deselección de un sensor
    const handleSensorChange = (sensorKey) => {
        if (selectedSensors.includes(sensorKey)) {
            setSelectedSensors(selectedSensors.filter(key => key !== sensorKey));
        } else {
            setSelectedSensors([...selectedSensors, sensorKey]);
        }
    };
    // ----------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (!hiveCode || selectedSensors.length === 0) {
            setError('El Código de Monitor y al menos un sensor son obligatorios.');
            return;
        }

        setIsLoading(true);
        
        try {
            await createNewColmena(hiveCode, description, selectedSensors);

            setSuccessMessage(`Colmena ${hiveCode} registrada con éxito.`);
            if (onColmenaRegistered) {
                onColmenaRegistered();
            }

            // Limpiar formulario después del éxito
            setHiveCode('');
            setDescription('');
            setSelectedSensors([]);

        } catch (err) {
            setError(err.message || 'Error desconocido al registrar la colmena.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Estilo dinámico del botón
    const submitButtonStyle = {
        ...styles.button,
        ...(isLoading || selectedSensors.length === 0 ? styles.buttonDisabled : {}),
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', color: THEME_COLOR, marginBottom: '20px' }}>
                Registrar Nuevo Monitor de Colmena
            </h2>
            
            {error && <p style={styles.error}>🚨 {error}</p>}
            {successMessage && <p style={styles.success}>✅ {successMessage}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* CAMPO: CÓDIGO ÚNICO */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Código Único del Monitor (ID de Arduino):
                    </label>
                    <input 
                        type="text" 
                        value={hiveCode} 
                        onChange={(e) => setHiveCode(e.target.value.toUpperCase())} 
                        required 
                        style={styles.input} 
                        placeholder="Ej: ABC-123"
                    />
                </div>

                {/* CAMPO: DESCRIPCIÓN */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Descripción (opcional):
                    </label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        style={{...styles.input, ...styles.textarea}} 
                        placeholder="Ubicación, tipo de colmena, notas..."
                    />
                </div>

                {/* SECCIÓN DE SENSORES */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Sensores Incluidos en tu Monitor:
                    </label>
                    <div style={styles.checkboxContainer}>
                        {/* LÓGICA SELECCIONAR TODOS */}
                        <div style={{ ...styles.checkboxItem, borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={allSensorsSelected}
                                onChange={handleSelectAll}
                                style={styles.checkboxInput}
                            />
                            <label htmlFor="selectAll" style={{ fontWeight: 'bold', color: THEME_COLOR, cursor: 'pointer' }}>
                                Seleccionar Todos
                            </label>
                        </div>
                        
                        {/* LISTA DE SENSORES */}
                        {isLoading ? <p>Cargando lista de sensores...</p> : sensors.map((sensor) => (
                            <div key={sensor.key} style={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    id={sensor.key}
                                    checked={selectedSensors.includes(sensor.key)}
                                    onChange={() => handleSensorChange(sensor.key)}
                                    style={styles.checkboxInput}
                                />
                                <label htmlFor={sensor.key} style={{ fontWeight: 'normal' }}>
                                    {sensor.name} 
                                    <span style={{ color: '#718096', fontSize: '0.9em' }}> ({sensor.unit})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOTÓN DE REGISTRO */}
                <button 
                    type="submit" 
                    disabled={isLoading || selectedSensors.length === 0}
                    style={submitButtonStyle}
                >
                    {isLoading ? 'Registrando...' : 'Registrar Colmena'}
                </button>
            </form>
        </div>
    );
}

export default ColmenaForm;