// src/pages/UnauthorizedPage.jsx (CÓDIGO PROFESIONAL)
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🐝 ICONOGRAFÍA (Requiere: npm install lucide-react)
import { ShieldOff, ArrowRight } from 'lucide-react'; 

const THEME_COLOR = '#D97706'; // Miel Principal
const ACCENT_COLOR = '#F6AD55'; // Naranja Acento
const STATUS_DANGER_TEXT = '#B91C1C'; // Rojo oscuro para el título
const TEXT_DARK = '#374151';

const styles = {
    container: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#F5F5F5', // Fondo ligeramente más gris
        padding: '20px',
        fontFamily: 'Inter, sans-serif'
    },
    card: {
        backgroundColor: 'white',
        padding: '50px 40px', // Mayor padding vertical
        borderRadius: '16px', // Bordes más redondeados
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)', // Sombra más profunda
        textAlign: 'center',
        borderTop: `6px solid ${THEME_COLOR}`, // Borde más grueso
        maxWidth: '500px'
    },
    // 🚨 REEMPLAZO DEL ICONO EMOJI
    icon: { 
        fontSize: '4rem', 
        marginBottom: '20px',
        color: STATUS_DANGER_TEXT, // Usamos el color de alerta para el icono
    }, 
    title: { 
        color: TEXT_DARK, // Título principal más oscuro
        fontSize: '2rem', 
        fontWeight: 'extrabold',
        marginBottom: '10px' 
    },
    errorCode: {
        fontSize: '1.2rem',
        color: STATUS_DANGER_TEXT,
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '15px'
    },
    message: { 
        color: '#6B7280', 
        fontSize: '1.1rem',
        lineHeight: '1.5',
        marginBottom: '30px' 
    },
    button: { 
        padding: '14px 30px', // Botón más grande
        backgroundColor: THEME_COLOR, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', // Bordes más suaves
        cursor: 'pointer', 
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.1s',
        display: 'inline-flex', // Para centrar el icono y texto
        alignItems: 'center',
        gap: '8px'
    }
};

function UnauthorizedPage() {
    const navigate = useNavigate();

    const Icon = ShieldOff;
    const ButtonIcon = ArrowRight;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* 🚨 Icono de Lucide */}
                <div style={styles.icon}>
                    <Icon size={64} style={{color: STATUS_DANGER_TEXT}} />
                </div>
                
                <h1 style={styles.title}>Acceso Restringido</h1>
                <span style={styles.errorCode}>(Error 403: Prohibido)</span>

                <p style={styles.message}>
                    No tienes los **permisos** necesarios para ver este recurso. 
                    Si crees que esto es un error, por favor, contacta al administrador del sistema.
                </p>
                
                <button 
                    style={styles.button}
                    onClick={() => navigate('/app/dashboard')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = ACCENT_COLOR;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = THEME_COLOR;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Ir al Dashboard Principal
                    <ButtonIcon size={20} />
                </button>
            </div>
        </div>
    );
}

export default UnauthorizedPage;