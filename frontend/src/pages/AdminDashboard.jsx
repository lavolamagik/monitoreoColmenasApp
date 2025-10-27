import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

const SIDEBAR_WIDTH = 240; // REDUCIDO DE 250 A 240 para compensar el nuevo margen
const CONTENT_MARGIN = 30; // Nuevo margen adicional para separar el contenido
const MOBILE_BREAKPOINT = 768; 
const THEME_COLOR = '#D97706'; 
const ACCENT_COLOR = '#F6AD55'; 
const BG_COLOR = '#FAFAFA'; // Fondo muy claro

// Estilos centrales (Actualizados para responsividad)
const dashboardStyles = {
    mainContainer: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: BG_COLOR, 
        fontFamily: 'Inter, sans-serif'
    },
    // Estilos de contenido principal originales, serán sobrescritos dinámicamente
    mainContent: { 
        flexGrow: 1, 
        padding: '30px', 
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease', 
        // Eliminamos maxWidth aquí para permitir el margen dinámico
    },
    title: { 
        fontSize: '2.5rem', 
        color: THEME_COLOR, 
        marginBottom: '10px', 
        fontWeight: 'extrabold' 
    },
    subtitle: { // Subtítulo para la bienvenida
        fontSize: '1rem',
        color: '#6B7280',
        marginBottom: '30px',
    },
    cardContainer: { 
        marginTop: '20px', 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 8px 15px rgba(0,0,0,0.05)', 
        overflow: 'hidden',
        border: `1px solid #eee`,
    },
    tableHeader: {
        fontSize: '1.4rem', 
        padding: '20px 25px', 
        borderBottom: '1px solid #f0f0f0', 
        color: THEME_COLOR, 
        fontWeight: 'bold',
        backgroundColor: '#FEFCE8', 
    },
    tableHeadRow: { 
        backgroundColor: ACCENT_COLOR, 
        color: 'white',
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        letterSpacing: '0.05em',
    },
    tableCell: { 
        padding: '15px 25px', 
        borderBottom: '1px solid #f0f0f0' 
    },
    toggleButton: { // Botón de Toggling (Menú Hamburguesa)
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001, 
        backgroundColor: THEME_COLOR,
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
};

// Datos simulados de gestión (sin cambios)
const mockUsers = [
];

const mockManagedHives = [
];

function AdminDashboard() {
    const navigate = useNavigate();
    // 3. Usamos useContext para acceder al objeto user (se espera que tenga la propiedad 'name')
    const { user } = useContext(AuthContext); 
    
    // Lógica para el Sidebar y Responsividad
    const [selectedMenu, setSelectedMenu] = useState('admin-main'); 
    const [selectedTab, setSelectedTab] = useState('users'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Lógica para manejar el cambio de tamaño de la ventana (Responsividad)
    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(isCurrentlyMobile);
            
            // Si pasa de móvil a escritorio, abre el sidebar automáticamente
            if (!isCurrentlyMobile && !isSidebarOpen) {
                setIsSidebarOpen(true);
            } 
            // Si está en móvil, oculta el sidebar por defecto
            else if (isCurrentlyMobile && isSidebarOpen) {
                 // Opción: No cambiar el estado al cambiar de tamaño si ya estaba abierto en móvil
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]); 
    
    // 4. Estilos dinámicos para el contenido principal
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        // Aplica margen igual al ancho del sidebar MÁS el margen extra (CONTENT_MARGIN)
        // solo si el sidebar está abierto Y NO estamos en móvil.
        marginLeft: (isSidebarOpen && !isMobile) 
            ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` 
            : '0', 
        // Ajustamos padding para dar espacio al botón de toggle en móvil, si el sidebar está cerrado
        paddingLeft: (isSidebarOpen || !isMobile) ? '30px' : '60px', 
    };
    
    const toggleIcon = '☰'; 

    // Componente de tabla reutilizable (sin cambios)
    const DataTable = ({ data, columns, title }) => (
        <div style={dashboardStyles.cardContainer}>
            <h3 style={dashboardStyles.tableHeader}>{title} ({data.length})</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={dashboardStyles.tableHeadRow}>
                            {columns.map(col => (
                                <th key={col.key} style={dashboardStyles.tableCell}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id || index} style={{ borderBottom: '1px solid #f7f7f7' }}>
                                {columns.map(col => (
                                    <td key={col.key} style={dashboardStyles.tableCell}>
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Definición de columnas para la tabla de Usuarios (sin cambios)
    const userColumns = [
        { key: 'name', header: 'Nombre' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Rol' },
        { key: 'active', header: 'Estado', render: (user) => (
            <span style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: user.active ? '#ECFDF5' : '#FEF2F2',
                color: user.active ? '#065F46' : '#991B1B', 
                fontWeight: 'bold',
                fontSize: '0.85rem'
            }}>
                {user.active ? 'Activo' : 'Inactivo'}
            </span>
        )},
        { key: 'actions', header: 'Acciones', render: () => (
            <button style={{ 
                padding: '8px 15px', 
                backgroundColor: THEME_COLOR, 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
            >
                Editar
            </button>
        )}
    ];

    // Definición de columnas para la tabla de Colmenas (sin cambios)
    const hiveColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { key: 'location', header: 'Ubicación' },
        { key: 'apicultor', header: 'Asignado a' },
        { key: 'actions', header: 'Acciones', render: (hive) => (
            <button 
                onClick={() => navigate(`/app/colmena/${hive.id}`)} 
                style={{ 
                    padding: '8px 15px', 
                    backgroundColor: ACCENT_COLOR, 
                    color: THEME_COLOR, 
                    border: '1px solid ' + THEME_COLOR, 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = THEME_COLOR; e.currentTarget.style.color = 'white'}}
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = ACCENT_COLOR; e.currentTarget.style.color = THEME_COLOR}}
            >
                Ver Data
            </button>
        )}
    ];
    
    // Renderizado del contenido basado en la pestaña seleccionada (sin cambios)
    const renderContent = () => {
        if (selectedTab === 'users') {
            return <DataTable data={mockUsers} columns={userColumns} title="Gestión de Usuarios del Sistema" />;
        }
        if (selectedTab === 'hives') {
            return <DataTable data={mockManagedHives} columns={hiveColumns} title="Gestión de Colmenas Asignadas" />;
        }
        return null;
    };

    // Estilo para los botones de pestaña (sin cambios)
    const tabButtonStyle = (tabName) => ({
        padding: '10px 20px',
        marginRight: '10px',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        fontWeight: selectedTab === tabName ? 'bold' : 'normal',
        backgroundColor: selectedTab === tabName ? 'white' : BG_COLOR,
        borderBottom: selectedTab === tabName ? `3px solid ${THEME_COLOR}` : '3px solid transparent',
        color: selectedTab === tabName ? THEME_COLOR : '#718096',
        transition: 'all 0.3s',
        fontSize: '16px',
    });

    return (
        <div style={dashboardStyles.mainContainer}> 
            
            {/* 5. Botón de Toggling siempre visible y fijo */}
            <button
                style={dashboardStyles.toggleButton}
                onClick={toggleSidebar}
                title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            >
                {toggleIcon}
            </button>

            {/* Sidebar pasa su visibilidad controlada por el estado */}
            <Sidebar 
                isVisible={isSidebarOpen} 
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
            />

            <main style={dynamicMainContentStyle}>
                <h1 style={dashboardStyles.title}>
                    Panel de Administración Central
                </h1>
                
                {/* 6. Párrafo de bienvenida usando user?.name */}
                <p style={dashboardStyles.subtitle}>
                    Bienvenido, 
                    <span style={{ 
                        color: THEME_COLOR, 
                        fontWeight: 'bold', 
                        margin: '0 4px' 
                    }}>
                        {/* Muestra el nombre si existe, si no, usa "Administrador" */}
                        {user?.name || 'Administrador'}
                    </span>
                    . Utiliza las pestañas para gestionar usuarios y colmenas.
                </p>

                {/* Navegación por Pestañas */}
                <div style={{ marginBottom: '0', borderBottom: '1px solid #ddd' }}>
                    <button 
                        onClick={() => setSelectedTab('users')}
                        style={tabButtonStyle('users')}
                    >
                        Usuarios
                    </button>
                    <button 
                        onClick={() => setSelectedTab('hives')}
                        style={tabButtonStyle('hives')}
                    >
                        Colmenas
                    </button>
                </div>

                {/* Renderizado de la Pestaña Activa */}
                {renderContent()}

                <button 
                    onClick={() => navigate('/app/dashboard')}
                    style={{ 
                        marginTop: '30px', 
                        padding: '12px 20px', 
                        backgroundColor: '#6B7280', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        fontWeight: '600'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4B5563'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6B7280'}
                >
                    Volver al Dashboard de Apicultor
                </button>
            </main>
        </div>
    );
}

export default AdminDashboard;