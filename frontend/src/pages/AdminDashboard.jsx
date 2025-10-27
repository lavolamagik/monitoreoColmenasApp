// src/pages/AdminDashboard.jsx (CÓDIGO FINAL COMPLETO)
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 
import { getAdminDashboardData } from '../api/adminService'; 
import EditUserModal from '../components/EditUserModal'; // <-- Componente de Edición

// --- Constantes de Diseño y Espaciado ---
const SIDEBAR_WIDTH = 240; 
const CONTENT_MARGIN = 30; 
const MOBILE_BREAKPOINT = 768; 
const THEME_COLOR = '#D97706'; 
const ACCENT_COLOR = '#F6AD55'; 
const BG_COLOR = '#FAFAFA'; 
const ITEMS_PER_PAGE = 10; // 10 filas por página

// --- Estilos Centrales ---
const dashboardStyles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BG_COLOR, fontFamily: 'Inter, sans-serif' },
    mainContent: { flexGrow: 1, padding: '30px', overflowY: 'auto', transition: 'margin-left 0.3s ease', },
    title: { fontSize: '2.5rem', color: THEME_COLOR, marginBottom: '10px', fontWeight: 'extrabold' },
    subtitle: { fontSize: '1rem', color: '#6B7280', marginBottom: '30px', },
    cardContainer: { marginTop: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid #eee`, },
    tableHeader: { fontSize: '1.4rem', padding: '20px 25px', borderBottom: '1px solid #f0f0f0', color: THEME_COLOR, fontWeight: 'bold', backgroundColor: '#FEFCE8', },
    tableHeadRow: { backgroundColor: ACCENT_COLOR, color: 'white', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', },
    tableCell: { padding: '15px 25px', borderBottom: '1px solid #f0f0f0' },
    toggleButton: { position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: THEME_COLOR, color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
    kpiCard: { padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${THEME_COLOR}`, backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' },
    kpiValue: { fontSize: '2.2rem', fontWeight: 'extrabold', color: THEME_COLOR, marginTop: '5px' },
    searchInput: { 
        padding: '10px 15px', 
        borderRadius: '6px', 
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '20px',
    },
    paginationButton: (active) => ({
        padding: '8px 15px',
        margin: '0 5px',
        backgroundColor: active ? THEME_COLOR : '#E0E0E0',
        color: active ? 'white' : '#333',
        border: 'none',
        borderRadius: '6px',
        cursor: active ? 'default' : 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    }),
    // Estilos para el Modal de Edición
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    formContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', position: 'relative', maxWidth: '500px', width: '90%' },
    closeButton: { position: 'absolute', top: '10px', right: '15px', fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none' },
};

// --- Lógica Reutilizable para Ordenamiento (Hook personalizado) ---
const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = React.useMemo(() => {
        if (!items) return [];
        let sortableItems = [...items];
        
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (sortConfig.key === 'created_at') {
                    const dateA = new Date(aValue).getTime();
                    const dateB = new Date(bValue).getTime();
                    if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};


// --- Componente DataTable ---
const DataTable = ({ data, columns, title, isLoading, error, onSearch, searchText, currentPage, setCurrentPage }) => {
    const { items: sortedData, requestSort: tableRequestSort, sortConfig: tableSortConfig } = useSortableData(data, null);
    
    const getSortIcon = (key) => {
        if (!tableSortConfig || tableSortConfig.key !== key) return '↕️';
        if (tableSortConfig.direction === 'ascending') return '⬆️';
        return '⬇️';
    };
    
    // LÓGICA DE PAGINACIÓN 
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div style={dashboardStyles.cardContainer}>
            <h3 style={dashboardStyles.tableHeader}>{title} ({totalItems})</h3>
        
            {/* FILTRO DE BÚSQUEDA */}
            <div style={{ padding: '20px 25px 0' }}>
                <input
                    type="text"
                    placeholder={`Buscar por nombre, email, o ID...`}
                    value={searchText}
                    onChange={(e) => onSearch(e.target.value)}
                    style={dashboardStyles.searchInput}
                />
            </div>
            {/* FIN FILTRO DE BÚSQUEDA */}
        
            {error && <p style={{ color: 'red', padding: '15px' }}>🚨 Error al cargar la tabla: {error}</p>}
            {isLoading ? (
                <p style={{ padding: '15px' }}>Cargando datos...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={dashboardStyles.tableHeadRow}>
                                {columns.map(col => (
                                    <th 
                                        key={col.key} 
                                        style={{...dashboardStyles.tableCell, cursor: col.sortable ? 'pointer' : 'default'}}
                                        onClick={() => col.sortable && tableRequestSort(col.key)} 
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            {col.header}
                                            {col.sortable && <span style={{fontSize: '0.9em'}}>{getSortIcon(col.key)}</span>}
                                        </div>
                                    </th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData?.length === 0 ? (
                                <tr><td colSpan={columns.length} style={{...dashboardStyles.tableCell, textAlign: 'center'}}>No hay registros que coincidan con los filtros.</td></tr>
                            ) : (
                                paginatedData?.map((item, index) => (
                                    <tr key={item.id || index} style={{ borderBottom: '1px solid #f7f7f7', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                                        {columns.map(col => (
                                            <td key={col.key} style={dashboardStyles.tableCell}>
                                                {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* CONTROLES DE PAGINACIÓN */}
                {totalPages > 1 && (
                    <div style={{ padding: '15px 25px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                        <button 
                            style={dashboardStyles.paginationButton(currentPage === 1)} 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </button>
                        
                        <span style={{ margin: '0 10px', color: THEME_COLOR, fontWeight: 'bold' }}>
                            Página {currentPage} de {totalPages}
                        </span>

                        <button 
                            style={dashboardStyles.paginationButton(currentPage === totalPages)} 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
                
            </div>
        )}
    </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <div style={{...dashboardStyles.kpiCard, borderLeft: `5px solid ${color || THEME_COLOR}`}}>
        <div style={{ fontSize: '2rem', marginBottom: '5px', color: color || THEME_COLOR }}>{icon}</div>
        <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>{title}</p>
        <div style={dashboardStyles.kpiValue}>{value}</div>
      </div>
);

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    
    // --- ESTADOS DE DATOS ---
    const [dashboardData, setDashboardData] = useState({ users: [], hives: [], kpis: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    // --- ESTADOS DE UI ---
    const [selectedMenu, setSelectedMenu] = useState('admin-main'); 
    const [selectedTab, setSelectedTab] = useState('users'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    // ESTADO DE FILTRO
    const [searchText, setSearchText] = useState(''); 

    // ESTADOS DE PAGINACIÓN POR TABLA
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [hiveCurrentPage, setHiveCurrentPage] = useState(1);

    // ESTADO DE EDICIÓN
    const [userToEdit, setUserToEdit] = useState(null); // <-- Almacena el usuario para el modal
    
    // Resetea la página a 1 cuando el filtro o la pestaña cambian
    useEffect(() => {
        setUserCurrentPage(1);
        setHiveCurrentPage(1);
    }, [searchText, selectedTab]);

    
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Lógica para manejar el cambio de tamaño de la ventana (Responsividad)
    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(isCurrentlyMobile);
            if (!isCurrentlyMobile && !isSidebarOpen) { setIsSidebarOpen(true); } 
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]); 
    
    // --- LÓGICA DE CARGA DE DATOS ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setDataError(null);
        try {
            const data = await getAdminDashboardData();
            setDashboardData(data);
        } catch (error) {
            setDataError(error.message || 'Fallo al cargar datos de administración.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // --- LÓGICA DE FILTRADO ---
    const filteredUsers = dashboardData.users.filter(user => {
        const query = searchText.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.rol.toLowerCase().includes(query) ||
            user.total_hives.toString().includes(query)
        );
    });

    const filteredHives = dashboardData.hives.filter(hive => {
        const query = searchText.toLowerCase();
        return (
            hive.hive_code.toLowerCase().includes(query) ||
            hive.description?.toLowerCase().includes(query) || // <- Añadir safe navigation
            hive.apicultor_name.toLowerCase().includes(query)
        );
    });

    // --- Estilos dinámicos y Columnas ---
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) 
            ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` 
            : '0', 
        paddingLeft: (isSidebarOpen || !isMobile) ? '30px' : '60px', 
    };
    
    const toggleIcon = '☰'; 

    const userColumns = [
        { key: 'name', header: 'Nombre', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'rol', header: 'Rol', sortable: true, render: (u) => (
            <span style={{ 
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                backgroundColor: u.rol === 'superadmin' ? '#FEFCE8' : '#F7FAFC',
                color: u.rol === 'superadmin' ? THEME_COLOR : '#4A5568', 
            }}>
                {u.rol === 'superadmin' ? 'ADMIN' : 'APICULTOR'}
            </span>
        )},
        { key: 'total_hives', header: 'Colmenas', sortable: true, render: (u) => u.total_hives || 0 },
        { key: 'created_at', header: 'Registro', sortable: true, render: (u) => new Date(u.created_at).toLocaleDateString() },
        { key: 'actions', header: 'Acciones', sortable: false, render: (userItem) => (
            <button 
                onClick={() => setUserToEdit(userItem)} // <-- Lanza el modal
                style={{ padding: '8px 15px', backgroundColor: THEME_COLOR, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s'}}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
            >Editar</button>
        )},
    ];

    const hiveColumns = [
        { key: 'hive_code', header: 'ID Monitor', sortable: true },
        { key: 'description', header: 'Descripción', sortable: true },
        { key: 'apicultor_name', header: 'Asignado a', sortable: true },
        { key: 'created_at', header: 'Fecha de Registro', sortable: true, render: (h) => new Date(h.created_at).toLocaleDateString() },
        { key: 'actions', header: 'Acciones', sortable: false, render: (hive) => (
            <button 
                onClick={() => navigate(`/app/colmena/${hive.hive_code}`)} 
                style={{ padding: '8px 15px', backgroundColor: ACCENT_COLOR, color: THEME_COLOR, border: '1px solid ' + THEME_COLOR, borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s'}}
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = THEME_COLOR; e.currentTarget.style.color = 'white'}}
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = ACCENT_COLOR; e.currentTarget.style.color = THEME_COLOR}}
            >Ver Data</button>
        )},
    ];
    
    const renderContent = () => {
        if (selectedTab === 'users') {
            return <DataTable 
                    data={filteredUsers} 
                    columns={userColumns} 
                    title={`Usuarios Registrados`} 
                    isLoading={isLoading} 
                    error={dataError} 
                    onSearch={setSearchText} 
                    searchText={searchText} 
                    currentPage={userCurrentPage} 
                    setCurrentPage={setUserCurrentPage} 
                />;
        }
        if (selectedTab === 'hives') {
            return <DataTable 
                    data={filteredHives} 
                    columns={hiveColumns} 
                    title={`Colmenas en el Sistema`} 
                    isLoading={isLoading} 
                    error={dataError} 
                    onSearch={setSearchText} 
                    searchText={searchText} 
                    currentPage={hiveCurrentPage} 
                    setCurrentPage={setHiveCurrentPage} 
                />;
        }
        return null;
    };

    const tabButtonStyle = (tabName) => ({
        padding: '10px 20px', marginRight: '10px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
        fontWeight: selectedTab === tabName ? 'bold' : 'normal',
        backgroundColor: selectedTab === tabName ? 'white' : BG_COLOR,
        borderBottom: selectedTab === tabName ? `3px solid ${THEME_COLOR}` : '3px solid transparent',
        color: selectedTab === tabName ? THEME_COLOR : '#718096',
        transition: 'all 0.3s', fontSize: '16px',
    });


    return (
        <div style={dashboardStyles.mainContainer}> 
            
            <button style={dashboardStyles.toggleButton} onClick={toggleSidebar} title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}>
                {toggleIcon}
            </button>

            <Sidebar 
                isVisible={isSidebarOpen} 
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
            />

            <main style={dynamicMainContentStyle}>
                <h1 style={dashboardStyles.title}>
                    Panel de Administración Central
                </h1>
                
                <p style={dashboardStyles.subtitle}>
                    Bienvenido, 
                    <span style={{ color: THEME_COLOR, fontWeight: 'bold', margin: '0 4px' }}>
                        {user?.name || 'Administrador'}
                    </span>
                    . Monitorea y gestiona el ecosistema de la aplicación.
                </p>
                
                {/* -------------------------------------------------------- */}
                {/* CUADROS DE INFORMACIÓN RÁPIDA (KPIs) */}
                {/* -------------------------------------------------------- */}
                <div style={dashboardStyles.kpiGrid}>
                    <KPICard 
                        title="Usuarios Totales" 
                        value={isLoading ? '...' : dashboardData.kpis.totalUsers} 
                        icon="👥" 
                        color="#3498DB" 
                    />
                    <KPICard 
                        title="Apicultores" 
                        value={isLoading ? '...' : dashboardData.kpis.totalApicultores} 
                        icon="👩‍🌾" 
                        color="#2ECC71" 
                    />
                    <KPICard 
                        title="Colmenas Monitoreadas" 
                        value={isLoading ? '...' : dashboardData.kpis.totalHives} 
                        icon="🐝" 
                        color={ACCENT_COLOR} 
                    />
                </div>

                {/* -------------------------------------------------------- */}
                {/* NAVEGACIÓN POR PESTAÑAS Y TABLAS */}
                {/* -------------------------------------------------------- */}
                <div style={{ borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => setSelectedTab('users')} style={tabButtonStyle('users')}>Usuarios</button>
                    <button onClick={() => setSelectedTab('hives')} style={tabButtonStyle('hives')}>Colmenas</button>
                </div>

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

            {/* MODAL DE EDICIÓN DE USUARIO */}
            {userToEdit && (
                <div style={dashboardStyles.formModal}>
                    <div style={dashboardStyles.formContent}>
                        <button 
                            style={dashboardStyles.closeButton} 
                            onClick={() => setUserToEdit(null)} // Cierra el modal
                        >
                            &times;
                        </button>
                        <EditUserModal 
                            user={userToEdit} 
                            onClose={() => setUserToEdit(null)}
                            onUserUpdated={fetchDashboardData} // Recarga los datos
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;