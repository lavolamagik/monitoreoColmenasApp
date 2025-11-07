// frontend/src/components/EditUserModal.jsx (CÓDIGO FINAL CORREGIDO SIN WIDTH: 100%)
import React, { useState } from 'react';
import { updateUserData } from '../api/adminService'; 

// 🐝 PALETA DE COLORES
const PRIMARY_HONEY = '#D97706'; // Miel Principal
const ACCENT_ORANGE = '#F6AD55'; // Naranja para hover
const TEXT_DARK = '#374151';     // Gris Oscuro para texto
const BORDER_LIGHT = '#E5E7EB';  // Borde sutil
const TEXT_MUTED = '#6B7280';    // Gris para cancelación/info
const STATUS_DANGER = '#EF4444'; // Rojo para errores

const styles = {
    // Contenedor principal (asume que ya está dentro del backdrop del dashboard)
    container: { 
        padding: '30px', 
        backgroundColor: 'white', 
        borderRadius: '12px', // Bordes más suaves
        // 🚨 CORRECCIÓN: Eliminamos width: '100%'
    },
    title: { 
        color: TEXT_DARK, 
        marginBottom: '20px', 
        fontSize: '1.8rem',
        fontWeight: 'bold',
        borderBottom: `1px solid ${BORDER_LIGHT}`,
        paddingBottom: '8px' // Ajuste para margen superior
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' }, 
    input: { 
        padding: '12px', 
        borderRadius: '8px', 
        border: `1px solid ${BORDER_LIGHT}`,
        transition: 'border-color 0.2s',
        fontSize: '1rem',
        color: TEXT_DARK,
        // Hover/Focus para profesionalismo
        ':focus': { 
            borderColor: PRIMARY_HONEY, 
            outline: 'none',
            boxShadow: `0 0 0 1px ${PRIMARY_HONEY}`
        }
    },
    select: { 
        padding: '12px', 
        borderRadius: '8px', 
        border: `1px solid ${BORDER_LIGHT}`,
        backgroundColor: '#fff',
        appearance: 'menulist', 
        backgroundImage: 'none',
        fontSize: '1rem',
        color: TEXT_DARK,
        cursor: 'pointer'
    },
    fieldContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: TEXT_MUTED,
        textTransform: 'uppercase'
    },
    error: { 
        color: STATUS_DANGER, 
        backgroundColor: '#FEE2E2', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        fontWeight: '500',
        borderLeft: `5px solid ${STATUS_DANGER}`
    },
    buttonBase: { 
        padding: '12px 20px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: '600',
        transition: 'background-color 0.2s, transform 0.1s',
        fontSize: '1rem'
    },
    submitButton: {
        backgroundColor: PRIMARY_HONEY, 
        color: 'white',
        flexGrow: 1
    },
    cancelButton: {
        backgroundColor: BORDER_LIGHT,
        color: TEXT_MUTED
    }
};

// Componente para editar usuarios
function EditUserModal({ user, onClose, onUserUpdated }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        rol: user.rol,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Llamada al servicio con el ID del usuario
            await updateUserData(user.id, formData); 
            
            onUserUpdated(); 
            onClose(); 
        } catch (err) {
            setError(err.message || 'Error desconocido al actualizar el usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hover effect helpers for buttons
    const handleButtonHover = (e, isSubmit, isEnter) => {
        if (isSubmit) {
            e.currentTarget.style.backgroundColor = isEnter ? ACCENT_ORANGE : PRIMARY_HONEY;
        } else {
            e.currentTarget.style.backgroundColor = isEnter ? TEXT_MUTED : BORDER_LIGHT;
            e.currentTarget.style.color = isEnter ? 'white' : TEXT_MUTED;
        }
        e.currentTarget.style.transform = isEnter && !isLoading ? 'translateY(-1px)' : 'translateY(0)';
    };

    // Hover effect for inputs
    const handleInputHover = (e, isEnter) => {
        e.currentTarget.style.borderColor = isEnter ? PRIMARY_HONEY : BORDER_LIGHT;
    };
    

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>
                Editar Usuario: <span style={{color: PRIMARY_HONEY}}>{user.name}</span>
            </h2>
            
            {error && <p style={styles.error}>🚨 **Error:** {error}</p>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <div style={styles.fieldContainer}>
                    <label style={styles.label} htmlFor="name">Nombre Completo</label>
                    <input 
                        type="text" name="name" id="name" value={formData.name} 
                        onChange={handleChange} placeholder="Escribe el nombre completo" required 
                        style={styles.input} 
                        onMouseEnter={(e) => handleInputHover(e, true)}
                        onMouseLeave={(e) => handleInputHover(e, false)}
                    />
                </div>
                
                <div style={styles.fieldContainer}>
                    <label style={styles.label} htmlFor="email">Email</label>
                    <input 
                        type="email" name="email" id="email" value={formData.email} 
                        onChange={handleChange} placeholder="ejemplo@dominio.com" required 
                        style={styles.input} 
                        onMouseEnter={(e) => handleInputHover(e, true)}
                        onMouseLeave={(e) => handleInputHover(e, false)}
                    />
                </div>
                
                <div style={styles.fieldContainer}>
                    <label style={styles.label} htmlFor="rol">Rol del Usuario</label>
                    <select 
                        name="rol" id="rol" value={formData.rol} 
                        onChange={handleChange} 
                        style={styles.select}
                    >
                        <option value="apicultor">APICULTOR</option>
                        <option value="superadmin">ADMINISTRADOR</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={{...styles.buttonBase, ...styles.cancelButton}}
                        onMouseEnter={(e) => handleButtonHover(e, false, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false, false)}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{...styles.buttonBase, ...styles.submitButton}}
                        onMouseEnter={(e) => handleButtonHover(e, true, true)}
                        onMouseLeave={(e) => handleButtonHover(e, true, false)}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUserModal;