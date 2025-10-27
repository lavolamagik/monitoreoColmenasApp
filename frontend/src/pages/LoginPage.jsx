import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; // Usamos .jsx como lo dejaste
import { loginUser, registerUser } from '../api/authService';

// Definición de estilos CSS modernos y responsive
const styles = {
    // Contenedor principal
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5', 
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
    },
    // Estilo de la tarjeta (Card)
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        borderRadius: '12px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        borderTop: '5px solid #F6AD55', // Línea superior naranja/miel
    },
    // Estilos de encabezado
    header: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'extrabold',
        color: '#D97706', // Color miel profundo
    },
    subtitle: {
        fontSize: '16px',
        color: '#718096',
    },
    // Estilos de Input Base (PARA CAMPOS REGULARES)
    input: {
        padding: '12px 16px',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        width: '100%',
        fontSize: '16px',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box', // Importante para que el padding no afecte el ancho total
    },
    inputFocus: {
        borderColor: '#F6AD55', 
        outline: 'none',
        boxShadow: '0 0 0 1px #F6AD55',
    },
    
    // Contenedor del campo de contraseña (sustituye el borde del input)
    passwordContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: 'white',
        width: '100%', // Asegura que tome el ancho completo
        boxSizing: 'border-box',
    },
    passwordContainerFocus: {
        borderColor: '#F6AD55', 
        boxShadow: '0 0 0 1px #F6AD55',
    },
    // Estilo del INPUT DENTRO del contenedor de la contraseña
    passwordInput: {
        padding: '12px 16px', // Mismo padding que el input normal
        border: 'none', // Sin borde aquí
        borderRadius: '8px 0 0 8px',
        flexGrow: 1, // **** CLAVE: Esto lo estira para ocupar el espacio restante ****
        fontSize: '16px',
        outline: 'none',
    },
    // Estilo para el botón del ojo (Mostrar/Ocultar)
    toggleButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#A0AEC0',
        padding: '10px 12px', // Ajustado el padding para igualar la altura visual
        display: 'flex', 
        alignItems: 'center',
        outline: 'none',
        height: '100%',
    },
    
    // Estilos de Botón de Acceso
    button: {
        padding: '14px',
        backgroundColor: '#F6AD55', // Naranja/Miel
        color: 'white',
        borderRadius: '8px',
        border: 'none',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        transition: 'background-color 0.2s, transform 0.1s',
        boxShadow: '0 4px #D97706', // Sombra para efecto 3D
        marginTop: '10px',
    },
    buttonHover: {
        backgroundColor: '#D97706',
        transform: 'translateY(2px)',
        boxShadow: '0 2px #D97706',
    },
    buttonDisabled: {
        backgroundColor: '#FBD38D', 
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
    // Estilo de Alerta de Error
    errorAlert: {
        backgroundColor: '#FEF2F2', 
        color: '#B91C1C', 
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #FEE2E2',
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
                // 1. USAMOS LA FUNCIÓN DE SERVICIO 'registerUser'
                await registerUser(name, email, password); 
                
                console.log('¡Cuenta creada con éxito! Por favor, inicia sesión.'); 
                setIsRegistering(false); 
                setName('');
                // Opcional: limpiar password también
                setPassword('');
            } else {
                // 2. USAMOS LA FUNCIÓN DE SERVICIO 'loginUser'
                data = await loginUser(email, password); 
                
                login({
                    token: data.token,
                    // Asegúrate de que el backend siempre devuelve 'rol' y no 'role' si ese es el caso
                    role: data.user.rol, 
                    email: email, 
                    name: data.user.name || 'Usuario', 
                });
                
                navigate(data.user.rol === 'superadmin' ? '/admin/dashboard' : '/app/dashboard');
            }
        } catch (error) {
            // 3. EL MENSAJE DE ERROR VIENE DIRECTAMENTE DE NUESTRO 'apiFetch'
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


    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <span role="img" aria-label="Abeja" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                        🍯
                    </span>
                    <h1 style={styles.title}>
                        {isRegistering ? 'Crear Nueva Cuenta' : 'Monitor de Colmenas'}
                    </h1>
                    <p style={styles.subtitle}>
                        {isRegistering ? 'Únete a nuestra comunidad de apicultores.' : 'Inicia sesión para gestionar tus datos.'}
                    </p>
                </div>

                {errorMessage && (
                    <div style={styles.errorAlert}>
                        {errorMessage}
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
                            // Usamos el nuevo estilo ajustado para el input de la contraseña
                            style={styles.passwordInput} 
                            placeholder="Contraseña"
                            // Cambiamos el type basado en el estado showPassword
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // Usamos onFocus/onBlur para aplicar el estilo de foco al div contenedor
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
                            tabIndex="-1" // Opcional: para que no interfiera en la navegación con teclado
                        >
                            <span role="img" aria-label="icono de ojo/candado" style={{fontSize: '1.2rem'}}>
                                {showPassword ? '👁️' : '🔒'}
                            </span>
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
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#718096' }}>
                    {isRegistering ? '¿Ya tienes una cuenta?' : '¿Eres nuevo aquí?'}
                    <span 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setErrorMessage(''); 
                            setEmail(''); 
                            setPassword(''); 
                        }}
                        style={{ color: '#D97706', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                    >
                        {isRegistering ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
