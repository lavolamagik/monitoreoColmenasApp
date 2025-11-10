// src/components/ColmenaForm.jsx (CÓDIGO PROFESIONAL Y FINAL)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableSensors, createNewColmena } from '../api/colmenaService'; 

// 🐝 ICONOGRAFÍA (Requiere: npm install lucide-react)
import { PlusCircle, Loader } from 'lucide-react'; 

// --- Constantes de Diseño ---
const PRIMARY_HONEY = '#D97706'; 
const ACCENT_COLOR = '#F6AD55'; 
const TEXT_DARK = '#374151';     
const TEXT_MUTED = '#6B7280';    
const BORDER_LIGHT = '#E5E7EB';  
const STATUS_DANGER = '#EF4444'; 
const STATUS_SUCCESS = '#059669'; // Verde oscuro para éxito

const styles = {
    // Contenedor principal del formulario
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '25px', // Espacio aumentado
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
        fontWeight: '600', // Semibold
        marginBottom: '5px', 
        color: TEXT_MUTED, // Gris tenue para labels
        textTransform: 'uppercase',
        fontSize: '0.9rem'
    },
    // 🚨 ESTILO DE INPUT BASE (usado para input y textarea)
    inputBase: { 
        padding: '12px', 
        borderRadius: '8px', // Bordes más suaves
        border: `1px solid ${BORDER_LIGHT}`, 
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '1rem',
        color: TEXT_DARK,
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    textarea: {
        height: '90px', 
        resize: 'none', 
    },
    
    // Contenedor de Checkboxes
    checkboxContainer: {
        border: `1px solid ${BORDER_LIGHT}`,
        borderRadius: '8px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backgroundColor: '#fff'
    },
    // Estilo para cada item checkbox
    checkboxItem: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        fontSize: '1rem',
    },
    checkboxInput: {
        width: '18px', 
        height: '18px',
        cursor: 'pointer',
        accentColor: PRIMARY_HONEY, // Usar color primario para el check
    },
    // Estilo para el botón
    button: { 
        padding: '15px', 
        backgroundColor: PRIMARY_HONEY, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    buttonDisabled: {
        backgroundColor: BORDER_LIGHT, // Gris suave
        color: TEXT_MUTED,
        cursor: 'not-allowed',
    },
    error: { 
        color: STATUS_DANGER, 
        backgroundColor: '#FEE2E2', 
        padding: '12px', 
        borderRadius: '8px', 
        borderLeft: `5px solid ${STATUS_DANGER}`,
        marginBottom: '15px',
        fontWeight: '500'
    },
    success: {
        color: STATUS_SUCCESS, 
        backgroundColor: '#ECFDF5', 
        padding: '12px', 
        borderRadius: '8px',
        borderLeft: `5px solid ${STATUS_SUCCESS}`,
        marginBottom: '15px',
        fontWeight: '500'
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
    
    // --- ESTADOS PARA FOCUS/HOVER ---
    const [hoverButton, setHoverButton] = useState(false);
    const [focusInput, setFocusInput] = useState(null); 
    
    const handleInputFocus = (name, isFocus) => {
        setFocusInput(isFocus ? name : null);
    };

    const inputStyle = (name) => ({
        ...styles.inputBase,
        borderColor: focusInput === name ? PRIMARY_HONEY : BORDER_LIGHT,
        boxShadow: focusInput === name ? `0 0 0 1px ${ACCENT_COLOR}` : 'none',
    });
    
    // Cargar la lista de sensores disponibles
    useEffect(() => {
        const loadSensors = async () => {
            setIsLoading(true);
            try {
                const availableSensors = await getAvailableSensors();
                setSensors(availableSensors);
            } catch (err) {
                setError('Error al cargar la lista de sensores disponibles.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadSensors();
    }, []);

    // --- LÓGICA: SELECCIONAR/DESELECCIONAR TODOS ---
    const allSensorsSelected = selectedSensors.length === sensors.length && sensors.length > 0;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSensors(sensors.map(s => s.key));
        } else {
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

            setSuccessMessage(`Colmena ${hiveCode} registrada con éxito. ¡Refrescando lista!`);
            if (onColmenaRegistered) {
                // Pequeño retraso para que el usuario vea el mensaje de éxito
                setTimeout(() => onColmenaRegistered(), 1500);
            }
        } catch (err) {
            setError(err.message || 'Error desconocido al registrar la colmena.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Estilo dinámico del botón
    const isButtonDisabled = isLoading || selectedSensors.length === 0;
    const submitButtonStyle = {
        ...styles.button,
        ...(isButtonDisabled ? styles.buttonDisabled : {}),
        backgroundColor: hoverButton && !isButtonDisabled ? ACCENT_COLOR : (isButtonDisabled ? styles.buttonDisabled.backgroundColor : PRIMARY_HONEY),
        color: isButtonDisabled ? styles.buttonDisabled.color : 'white',
        transform: hoverButton && !isButtonDisabled ? 'translateY(-2px)' : 'translateY(0)',
    };

    return (
        <div>
            <h2 style={{ color: TEXT_DARK, marginBottom: '20px', fontSize: '1.8rem', fontWeight: 'bold' }}>
                Registrar Nuevo Monitor
            </h2>
            
            {error && <p style={styles.error}>🚨 **Error:** {error}</p>}
            {successMessage && <p style={styles.success}>✅ {successMessage}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* CAMPO: CÓDIGO ÚNICO */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Código Único del Monitor (ID):
                    </label>
                    <input 
                        type="text" 
                        value={hiveCode} 
                        onChange={(e) => setHiveCode(e.target.value.toUpperCase())} 
                        onFocus={() => handleInputFocus('code', true)}
                        onBlur={() => handleInputFocus('code', false)}
                        required 
                        style={inputStyle('code')} 
                        placeholder="Ej: ABC-123 (Obligatorio)"
                    />
                </div>

                {/* CAMPO: DESCRIPCIÓN */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Descripción (Opcional):
                    </label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        onFocus={() => handleInputFocus('desc', true)}
                        onBlur={() => handleInputFocus('desc', false)}
                        style={{...inputStyle('desc'), ...styles.textarea}} 
                        placeholder="Ubicación, tipo de colmena, notas..."
                    />
                </div>

                {/* SECCIÓN DE SENSORES */}
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                        Configuración de Sensores:
                    </label>
                    <div style={styles.checkboxContainer}>
                        {isLoading ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: TEXT_MUTED}}>
                                <Loader size={20} className="animate-spin" />
                                Cargando lista de sensores...
                            </div>
                        ) : (
                            <>
                                {/* LÓGICA SELECCIONAR TODOS */}
                                <div style={{ ...styles.checkboxItem, borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: '10px', marginBottom: '5px' }}>
                                    <input
                                        type="checkbox"
                                        id="selectAll"
                                        checked={allSensorsSelected}
                                        onChange={handleSelectAll}
                                        style={styles.checkboxInput}
                                    />
                                    <label htmlFor="selectAll" style={{ fontWeight: 'bold', color: PRIMARY_HONEY, cursor: 'pointer' }}>
                                        Seleccionar Todos
                                    </label>
                                </div>
                        
                                {/* LISTA DE SENSORES */}
                                {sensors.map((sensor) => (
                                    <div key={sensor.key} style={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            id={sensor.key}
                                            checked={selectedSensors.includes(sensor.key)}
                                            onChange={() => handleSensorChange(sensor.key)}
                                            style={styles.checkboxInput}
                                        />
                                        <label htmlFor={sensor.key} style={{ fontWeight: 'normal', color: TEXT_DARK }}>
                                            {sensor.name} 
                                            <span style={{ color: TEXT_MUTED, fontSize: '0.9em' }}> ({sensor.unit})</span>
                                        </label>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* BOTÓN DE REGISTRO */}
                <button 
                    type="submit" 
                    disabled={isButtonDisabled}
                    style={submitButtonStyle}
                    onMouseEnter={() => setHoverButton(true)}
                    onMouseLeave={() => setHoverButton(false)}
                >
                    {isLoading ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Loader size={20} color="white" className="animate-spin" />
                            Registrando...
                        </div>
                    ) : (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            Registrar Colmena
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
}

export default ColmenaForm;