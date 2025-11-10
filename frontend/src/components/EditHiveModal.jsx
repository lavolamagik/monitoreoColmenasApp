// src/components/EditHiveModal.jsx (CÓDIGO FINAL CORREGIDO)
import React, { useState, useEffect } from 'react';
import { updateHiveDetails, deleteColmena, getAvailableSensors } from '../api/colmenaService'; 
// Asumimos que tienes estilos y consts disponibles o las importamos aquí si fuera necesario
// const PRIMARY_HONEY = ...

// --- Constantes de Paleta (Asumimos que están disponibles globalmente) ---
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const STATUS_DANGER = '#EF4444'; 
const TEXT_MUTED = '#6B7280';
const BORDER_LIGHT = '#E5E7EB';

const styles = {
    container: { padding: '0 0 20px' },
    title: { color: PRIMARY_HONEY, marginBottom: '10px' },
    subtitle: { color: TEXT_MUTED, marginBottom: '20px', fontSize: '0.9rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px 12px', borderRadius: '6px', border: `1px solid ${BORDER_LIGHT}`, width: '100%', boxSizing: 'border-box' },
    label: { fontWeight: 'bold', color: TEXT_MUTED },
    checkboxContainer: { border: `1px solid ${BORDER_LIGHT}`, borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' },
    checkboxItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' },
    actionGroup: { display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'space-between' },
    saveButton: { padding: '12px 20px', backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' },
    deleteButton: { padding: '10px', backgroundColor: STATUS_DANGER, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' },
    error: { color: STATUS_DANGER, backgroundColor: '#FEF2F2', padding: '10px', borderRadius: '6px', marginBottom: '15px' }
};


function EditHiveModal({ colmena, onClose, onHiveUpdated }) {
    // 🚨 CORRECCIÓN CRÍTICA: Inicializar selectedSensors usando la propiedad correcta que viene de la API
    const [formData, setFormData] = useState({
        description: colmena.description || '',
        selectedSensors: colmena.selectedSensors || [], // 🚨 DEBE SER colmena.selectedSensors
    });
    const [allSensors, setAllSensors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Cargar la lista maestra de sensores (para los checkboxes)
    useEffect(() => {
        const loadSensors = async () => {
            try {
                const availableSensors = await getAvailableSensors();
                setAllSensors(availableSensors);
            } catch (err) {
                setError('Error al cargar la lista de sensores disponibles.');
            }
        };
        loadSensors();
    }, []);

    const handleSensorChange = (sensorKey) => {
        const currentSensors = formData.selectedSensors;
        const updatedSensors = currentSensors.includes(sensorKey)
            ? currentSensors.filter(key => key !== sensorKey)
            : [...currentSensors, sensorKey];
        
        setFormData({ ...formData, selectedSensors: updatedSensors });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Aseguramos que solo pasamos los datos necesarios para la edición
            const updateData = {
                description: formData.description,
                selectedSensors: formData.selectedSensors
            };
            await updateHiveDetails(colmena.hive_code, updateData);
            
            onHiveUpdated(); // Recargar la lista en la página MisColmenas
            onClose();

        } catch (err) {
            setError(err.message || 'Error al guardar los cambios.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await deleteColmena(colmena.hive_code);
            onHiveUpdated(); // Recargar la lista (la colmena ya no estará)
            onClose();

        } catch (err) {
            setError(err.message || 'Error al eliminar la colmena.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Editar Monitor: {colmena.hive_code}</h2>
            <p style={styles.subtitle}>Solo puedes editar la descripción y los sensores activos. El ID del monitor es fijo.</p>
            
            {error && <p style={styles.error}>{error}</p>}
            
            <form onSubmit={handleSave} style={styles.form}>
                
                <div style={{color: TEXT_MUTED}}>
                    <label style={styles.label}>ID de Monitor (Fijo):</label>
                    <input type="text" value={colmena.hive_code} disabled style={{...styles.input, backgroundColor: '#f0f0f0'}} />
                </div>
                
                <div>
                    <label style={styles.label}>Descripción:</label>
                    <textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        style={{...styles.input, height: '80px', resize: 'none'}} 
                    />
                </div>

                <div>
                    <label style={styles.label}>Sensores Activos:</label>
                    <div style={styles.checkboxContainer}>
                        {allSensors.length === 0 ? <p>Cargando sensores...</p> : allSensors.map((sensor) => (
                            <div key={sensor.key} style={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    id={`sensor-${sensor.key}`}
                                    checked={formData.selectedSensors?.includes(sensor.key)} // 🚨 Agregamos safe navigation
                                    onChange={() => handleSensorChange(sensor.key)}
                                />
                                <label htmlFor={`sensor-${sensor.key}`} style={{ fontWeight: 'normal' }}>
                                    {sensor.name} <span style={{ color: TEXT_MUTED }}>({sensor.unit})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.actionGroup}>
                    {/* Botón de ELIMINAR */}
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        disabled={isLoading}
                        style={{...styles.deleteButton, width: isConfirmingDelete ? 'auto' : '120px'}}
                        onMouseLeave={() => setTimeout(() => setIsConfirmingDelete(false), 2000)} // Resetear tras 2s
                    >
                        {isConfirmingDelete ? '¿CONFIRMAR ELIMINAR?' : 'Eliminar Colmena'}
                    </button>
                    
                    {/* Botón de GUARDAR */}
                    <button type="submit" disabled={isLoading} style={{...styles.saveButton, flexGrow: 1}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_ORANGE}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HONEY}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditHiveModal;