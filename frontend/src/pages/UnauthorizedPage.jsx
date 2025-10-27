// src/pages/UnauthorizedPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const THEME_COLOR = '#D97706';
const ACCENT_COLOR = '#F6AD55';

const styles = {
    container: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#FAFAFA', 
        padding: '20px' 
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        borderTop: `5px solid ${THEME_COLOR}`,
        maxWidth: '500px'
    },
    icon: { fontSize: '4rem', marginBottom: '15px' },
    title: { color: '#E74C3C', marginBottom: '10px' },
    message: { color: '#6B7280', marginBottom: '30px' },
    button: { 
        padding: '12px 25px', 
        backgroundColor: THEME_COLOR, 
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    }
};

function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>⛔</div>
                <h1 style={styles.title}>Acceso Denegado (403)</h1>
                <p style={styles.message}>
                    No tienes los permisos necesarios para ver esta página. 
                    Si crees que esto es un error, contacta al administrador del sistema.
                </p>
                <button 
                    style={styles.button}
                    onClick={() => navigate('/app/dashboard')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                >
                    Ir al Dashboard Principal
                </button>
            </div>
        </div>
    );
}

export default UnauthorizedPage;