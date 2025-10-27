// src/pages/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// ... (Puedes importar los estilos y constantes de UnauthorizedPage si lo deseas)
const THEME_COLOR = '#D97706'; 
const ACCENT_COLOR = '#F6AD55';

const styles = {
    // ... (usa el mismo estilo container, card, etc. de UnauthorizedPage)
    container: { /* ... estilos ... */ },
    card: { /* ... estilos ... */ },
    icon: { fontSize: '4rem', marginBottom: '15px' },
    title: { color: THEME_COLOR, marginBottom: '10px' },
    message: { color: '#6B7280', marginBottom: '30px' },
    button: { /* ... estilos ... */ },
};

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>❓</div>
                <h1 style={styles.title}>Página No Encontrada (404)</h1>
                <p style={styles.message}>
                    Lo sentimos, la URL que solicitaste no existe.
                </p>
                <button 
                    style={styles.button}
                    onClick={() => navigate('/app/dashboard')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;