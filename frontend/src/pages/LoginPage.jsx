import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; 
import { loginUser, registerUser } from '../api/authService';

// 🐝 ICONOGRAFÍA (Requiere: npm install lucide-react)
import { Eye, EyeOff, Settings } from 'lucide-react'; 

// --- Constantes de Diseño y Paleta ---
const PRIMARY_HONEY = '#D97706'; // Miel profundo
const ACCENT_ORANGE = '#F6AD55'; // Naranja/Miel claro
const BG_LIGHT = '#F5F5F5'; 
const TEXT_MUTED = '#6B7280'; // Gris Medio
const BORDER_LIGHT = '#E2E8F0';
const STATUS_DANGER_BG = '#FEF2F2';
const STATUS_DANGER_TEXT = '#B91C1C'; 

// Definición de estilos CSS modernos y responsive
const styles = {
    // Contenedor principal
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: BG_LIGHT, 
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
    },
    // Estilo de la tarjeta (Card)
    card: {
        width: '100%',
        maxWidth: '450px', // Ligeramente más ancho
        padding: '40px',
        borderRadius: '12px', 
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)', // Sombra más profunda
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        borderTop: `6px solid ${ACCENT_ORANGE}`, // Línea superior naranja/miel más gruesa
    },
    // Estilos de encabezado
    header: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'extrabold',
        color: PRIMARY_HONEY, 
    },
    subtitle: {
        fontSize: '16px',
        color: TEXT_MUTED,
    },
    // Estilos de Input Base (PARA CAMPOS REGULARES)
    input: {
        padding: '12px 16px',
        border: `1px solid ${BORDER_LIGHT}`,
        borderRadius: '8px',
        width: '100%',
        fontSize: '16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box', 
    },
    inputFocus: {
        borderColor: ACCENT_ORANGE, 
        outline: 'none',
        boxShadow: `0 0 0 2px ${ACCENT_ORANGE}40`, // Sombra sutil en focus
    },
    
    // Contenedor del campo de contraseña (sustituye el borde del input)
    passwordContainer: {
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${BORDER_LIGHT}`,
        borderRadius: '8px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: 'white',
        width: '100%', 
        boxSizing: 'border-box',
    },
    passwordContainerFocus: {
        borderColor: ACCENT_ORANGE, 
        boxShadow: `0 0 0 2px ${ACCENT_ORANGE}40`,
    },
    // Estilo del INPUT DENTRO del contenedor de la contraseña
    passwordInput: {
        padding: '12px 16px', 
        border: 'none', 
        borderRadius: '8px 0 0 8px',
        flexGrow: 1, 
        fontSize: '16px',
        outline: 'none',
    },
    // Estilo para el botón del ojo (Mostrar/Ocultar)
    toggleButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: TEXT_MUTED, // Color de icono por defecto
        padding: '0 12px', // Ajustado el padding para el icono
        display: 'flex', 
        alignItems: 'center',
        height: '100%',
        transition: 'color 0.2s',
    },
    
    // Estilos de Botón de Acceso
    button: {
        padding: '14px',
        backgroundColor: ACCENT_ORANGE, 
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s, transform 0.1s',
        boxShadow: `0 4px ${PRIMARY_HONEY}`, 
        marginTop: '10px',
    },
    buttonHover: {
        backgroundColor: PRIMARY_HONEY,
        transform: 'translateY(2px)',
        boxShadow: `0 2px ${PRIMARY_HONEY}`,
    },
    buttonDisabled: {
        backgroundColor: '#FBD38D', 
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
    // Estilo de Alerta de Error
    errorAlert: {
        backgroundColor: STATUS_DANGER_BG, 
        color: STATUS_DANGER_TEXT, 
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
        border: `1px solid ${STATUS_DANGER_BG}`,
    }
};

function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Estado para alternar la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            let data;
            
            if (isRegistering) {
                await registerUser(name, email, password); 
                
                console.log('¡Cuenta creada con éxito! Por favor, inicia sesión.'); 
                setIsRegistering(false); 
                setName('');
                setPassword('');
            } else {
                data = await loginUser(email, password); 
                
                login({
                    token: data.token,
                    role: data.user.rol, 
                    email: email, 
                    name: data.user.name || 'Usuario', 
                });
                
                navigate(data.user.rol === 'superadmin' ? '/admin/dashboard' : '/app/dashboard');
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            setErrorMessage(error.message || 'Error de Conexión. Asegúrate de que el backend esté encendido.');
        } finally {
            setIsLoading(false);
        }
    };

    // Estados para hover y focus
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [nameFocus, setNameFocus] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    // Estado de enfoque para el contenedor completo de la contraseña
    const [passwordContainerFocus, setPasswordContainerFocus] = useState(false); 

    // Estilos dinámicos
    const submitButtonStyle = {
        ...styles.button,
        ...(isLoading ? styles.buttonDisabled : isButtonHovered ? styles.buttonHover : {}),
    };
    const nameInputStyle = { ...styles.input, ...(nameFocus ? styles.inputFocus : {}) };
    const emailInputStyle = { ...styles.input, ...(emailFocus ? styles.inputFocus : {}) };
    
    // Estilo dinámico para el contenedor de la contraseña
    const passwordBoxStyle = { 
        ...styles.passwordContainer, 
        // Aplicamos el estilo de foco al contenedor padre
        ...(passwordContainerFocus ? styles.passwordContainerFocus : {}) 
    };

    // Función para alternar la visibilidad
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Determinamos el componente del icono a mostrar
    const VisibilityIcon = showPassword ? EyeOff : Eye;
    const SettingsLogo = Settings;


    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    {/* 🚨 REEMPLAZO DEL EMOJI 🍯 por un logo de engranaje profesional */}
                    <SettingsLogo 
                        size={36} 
                        color={PRIMARY_HONEY} 
                        style={{ display: 'block', margin: '0 auto 8px auto' }} 
                    />
                    <h1 style={styles.title}>
                        {isRegistering ? 'Crear Nueva Cuenta' : 'BeeHive Central'}
                    </h1>
                    <p style={styles.subtitle}>
                        {isRegistering ? 'Únete a nuestra comunidad de apicultores.' : 'Inicia sesión para gestionar tus datos.'}
                    </p>
                </div>

                {errorMessage && (
                    <div style={styles.errorAlert}>
                        🚨 {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* CAMPO DE NOMBRE (Registro) */}
                    {isRegistering && (
                        <input
                            style={nameInputStyle}
                            placeholder="Tu Nombre Completo"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setNameFocus(true)}
                            onBlur={() => setNameFocus(false)}
                            required
                        />
                    )}

                    {/* CAMPO DE CORREO */}
                    <input
                        style={emailInputStyle}
                        placeholder="Correo electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                        required
                    />

                    {/* INICIO: CONTENEDOR DEL CAMPO DE CONTRASEÑA con el botón */}
                    <div style={passwordBoxStyle}>
                        <input
                            style={styles.passwordInput} 
                            placeholder="Contraseña"
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordContainerFocus(true)}
                            onBlur={() => setPasswordContainerFocus(false)}
                            required
                        />
                        {/* Botón para alternar visibilidad */}
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={styles.toggleButton}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {/* 🚨 REEMPLAZO DEL EMOJI POR ICONOS DE LUCIDE */}
                            <VisibilityIcon size={20} color={TEXT_MUTED} />
                        </button>
                    </div>
                    {/* FIN: CONTENEDOR DEL CAMPO DE CONTRASEÑA */}

                    <button
                        style={submitButtonStyle}
                        type="submit"
                        disabled={isLoading}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                    >
                        {isLoading 
                            ? (isRegistering ? 'Registrando...' : 'Cargando...') 
                            : (isRegistering ? 'Registrar Cuenta' : 'Iniciar sesión')
                        }
                    </button>
                </form>

                {/* Enlace para alternar entre Login y Registro */}
                <p style={{ textAlign: 'center', fontSize: '14px', color: TEXT_MUTED }}>
                    {isRegistering ? '¿Ya tienes una cuenta?' : '¿Eres nuevo aquí?'}
                    <span 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setErrorMessage(''); 
                            setEmail(''); 
                            setPassword(''); 
                        }}
                        style={{ color: PRIMARY_HONEY, fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                    >
                        {isRegistering ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;