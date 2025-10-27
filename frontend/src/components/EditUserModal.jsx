// frontend/src/components/EditUserModal.jsx
import React, { useState } from 'react';
import { updateUserData } from '../api/adminService'; 

const THEME_COLOR = '#D97706';
const ACCENT_COLOR = '#F6AD55';

const styles = {
    // Contenedor principal
    container: { 
        padding: '25px', 
        backgroundColor: 'white', 
        borderRadius: '8px'
    },
    title: { color: THEME_COLOR, marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    select: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '12px', backgroundColor: THEME_COLOR, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    error: { color: 'red', backgroundColor: '#FEF2F2', padding: '10px', borderRadius: '4px', marginBottom: '15px' }
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
            
            onUserUpdated(); // Disparar recarga de datos en el Dashboard
            onClose(); // Cerrar el modal
        } catch (err) {
            setError(err.message || 'Error desconocido al actualizar el usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Editar Usuario: {user.name}</h2>
            
            {error && <p style={styles.error}>🚨 {error}</p>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required style={styles.input} />
                
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={styles.input} />
                
                <select name="rol" value={formData.rol} onChange={handleChange} style={styles.select}>
                    <option value="apicultor">APICULTOR</option>
                    <option value="superadmin">ADMINISTRADOR</option>
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: '#6B7280'}}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} style={{...styles.button, flexGrow: 1}}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUserModal;