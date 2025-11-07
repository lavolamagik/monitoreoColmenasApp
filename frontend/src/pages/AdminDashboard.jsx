// src/pages/AdminDashboard.jsx (CÓDIGO COMPLETO Y FINAL CON BÚSQUEDA PROFESIONAL)
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 
import { getAdminDashboardData } from '../api/adminService'; 
import EditUserModal from '../components/EditUserModal'; 

// 🐝 ICONOGRAFÍA PROFESIONAL (Requiere: npm install lucide-react)
import { Users, User, Box, List, Menu, ChevronUp, ChevronDown, Repeat2, Search } from 'lucide-react'; // 🚨 Search AÑADIDO
// Si Lucide no está instalado, se usan estos como fallback:
import { FaUsers, FaUserTie, FaBoxOpen } from 'react-icons/fa'; 

// --- Constantes de Diseño y Paleta Extendida ---
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const LIGHT_HONEY = '#FFF7ED';       
const BACKGROUND_LIGHT = '#FAFAFA';  
const TEXT_DARK = '#374151';         
const TEXT_MUTED = '#6B7280';        
const BORDER_LIGHT = '#E5E7EB';      
const STATUS_SUCCESS = '#059669';     
const STATUS_INFO = '#3B82F6';       
const STATUS_DANGER = '#EF4444';     
const SIDEBAR_WIDTH = 240; 
const CONTENT_MARGIN = 30; 
const MOBILE_BREAKPOINT = 768; 
const ITEMS_PER_PAGE = 10; 

// --- Estilos Centrales ---
const dashboardStyles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BACKGROUND_LIGHT, fontFamily: 'Inter, sans-serif' },
    mainContent: { flexGrow: 1, padding: '30px', overflowY: 'auto', transition: 'margin-left 0.3s ease', },
    title: { fontSize: '2.5rem', color: TEXT_DARK, marginBottom: '10px', fontWeight: 'extrabold' },
    subtitle: { fontSize: '1rem', color: TEXT_MUTED, marginBottom: '30px', },
    cardContainer: { marginTop: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}`, }, 
    sectionTitle: { fontSize: '1.5rem', color: TEXT_DARK, marginBottom: '20px', fontWeight: 'bold' }, 
    tableHeader: { fontSize: '1.4rem', padding: '20px 25px', borderBottom: `1px solid ${BORDER_LIGHT}`, color: PRIMARY_HONEY, backgroundColor: LIGHT_HONEY, },
    tableHeadRow: { backgroundColor: PRIMARY_HONEY, color: 'white', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em', }, 
    tableCell: { padding: '15px 25px', borderBottom: `1px solid ${BORDER_LIGHT}`, color: TEXT_DARK }, 
    toggleButton: { position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }, 
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }, 
    kpiCard: { padding: '25px', borderRadius: '12px', borderLeft: `6px solid ${PRIMARY_HONEY}`, backgroundColor: 'white', boxShadow: '0 6px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' },
    kpiValue: { fontSize: '2.5rem', fontWeight: 'extrabold', color: TEXT_DARK, marginTop: '5px' }, 
    // 🚨 ESTILOS DE BÚSQUEDA MEJORADOS
    searchWrapper: { 
        position: 'relative', 
        marginBottom: '20px' 
    },
    searchInput: { 
        padding: '12px 18px 12px 45px', // 🚨 AUMENTAR PADDING IZQUIERDO para el icono
        borderRadius: '8px', border: `1px solid ${BORDER_LIGHT}`,
        width: '100%', boxSizing: 'border-box', color: TEXT_DARK,
        fontSize: '1rem', 
        transition: 'border-color 0.2s',
        ':focus': { borderColor: PRIMARY_HONEY, outline: 'none' } 
    },
    searchIcon: {
        position: 'absolute',
        top: '12px',
        left: '15px',
        color: TEXT_MUTED, // Icono de color gris tenue
    },
    // FIN ESTILOS DE BÚSQUEDA MEJORADOS
    paginationButton: (active) => ({
        padding: '10px 20px', margin: '0 5px',
        backgroundColor: active ? PRIMARY_HONEY : BORDER_LIGHT,
        color: active ? 'white' : TEXT_DARK,
        border: 'none', borderRadius: '8px', cursor: active ? 'default' : 'pointer',
        fontWeight: '600', transition: 'background-color 0.2s, box-shadow 0.2s',
        boxShadow: active ? '0 2px 5px rgba(217, 119, 6, 0.3)' : 'none', 
    }),
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }, // Añadido padding
    formContent: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', position: 'relative', maxWidth: '550px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden',margin: '0 auto', }, 
    closeButton: { position: 'absolute', top: '15px', right: '15px', fontSize: '28px', cursor: 'pointer', border: 'none', background: 'none', color: TEXT_MUTED, transition: 'color 0.2s' },
};


// 🚨 HOOK DE LÓGICA REUTILIZABLE PARA ORDENAMIENTO (NIVEL SUPERIOR)
const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);
    const sortedItems = useMemo(() => {
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


// ----------------------------------------------------------------
// COMPONENTES Y DEFINICIONES AUXILIARES
// ----------------------------------------------------------------
const KPICard = ({ title, value, icon: IconComponent, color }) => (
    <div 
        style={{
            ...dashboardStyles.kpiCard, 
            borderLeft: `6px solid ${color || PRIMARY_HONEY}`, 
            cursor: 'default',
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'} 
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = dashboardStyles.kpiCard.boxShadow}
    >
        <div style={{ marginBottom: '10px', color: color || PRIMARY_HONEY }}>
            <IconComponent size={28} />
        </div> 
        <p style={{ fontSize: '0.9rem', color: TEXT_MUTED, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>{title}</p>
        <div style={dashboardStyles.kpiValue}>{value}</div>
    </div>
);


const DataTable = ({ data, columns, title, isLoading, error, onSearch, searchText, currentPage, setCurrentPage, onEditUser }) => {
    const { items: sortedData, requestSort: tableRequestSort, sortConfig: tableSortConfig } = useSortableData(data, null);
    
    const getSortIcon = (key) => {
        if (!tableSortConfig || tableSortConfig.key !== key) return <Repeat2 size={14} color={LIGHT_HONEY} style={{ opacity: 0.7 }} />; 
        if (tableSortConfig.direction === 'ascending') return <ChevronUp size={14} />;
        return <ChevronDown size={14} />;
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
            <h3 style={dashboardStyles.tableHeader}>{title} (<span style={{ fontWeight: 'normal' }}>{totalItems} Registros</span>)</h3>
        
            {/* FILTRO DE BÚSQUEDA (CON ICONO) */}
            <div style={{ padding: '20px 25px 0' }}>
                <div style={dashboardStyles.searchWrapper}>
                    <Search size={20} style={dashboardStyles.searchIcon} />
                    <input
                        type="text"
                        placeholder={`Buscar registros (nombre, email, ID)...`}
                        value={searchText}
                        onChange={(e) => onSearch(e.target.value)}
                        style={dashboardStyles.searchInput}
                    />
                </div>
            </div>
            {/* FIN FILTRO DE BÚSQUEDA */}
        
            {error && <p style={{ color: STATUS_DANGER, padding: '15px' }}>🚨 **Error al cargar la tabla:** {error}</p>}
            {isLoading ? (
                <p style={{ color: TEXT_MUTED, padding: '15px' }}>Cargando datos...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={dashboardStyles.tableHeadRow}>
                                {columns.map(col => (
                                    <th 
                                        key={col.key} 
                                        style={{...dashboardStyles.tableCell, cursor: col.sortable ? 'pointer' : 'default', color: 'white'}} 
                                        onClick={() => col.sortable && tableRequestSort(col.key)} 
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            {col.header}
                                            {col.sortable && getSortIcon(col.key)} 
                                        </div>
                                    </th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData?.length === 0 ? (
                                <tr><td colSpan={columns.length} style={{...dashboardStyles.tableCell, textAlign: 'center', color: TEXT_MUTED}}>No hay registros que coincidan con los filtros.</td></tr>
                            ) : (
                                paginatedData?.map((item, index) => (
                                    <tr 
                                            key={item.id || index} 
                                            style={{ borderBottom: `1px solid ${BORDER_LIGHT}`, backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = LIGHT_HONEY}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#fcfcfc'}
                                        >
                                        {columns.map(col => (
                                            <td key={col.key} style={{...dashboardStyles.tableCell, color: TEXT_DARK}}>
                                                    {col.key === 'actions' && onEditUser ? col.render(item, onEditUser) : (col.render ? col.render(item) : item[col.key])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* CONTROLES DE PAGINACIÓN */}
                {totalPages > 1 && (
                    <div style={{ padding: '20px 25px', borderTop: `1px solid ${BORDER_LIGHT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: TEXT_MUTED, fontSize: '0.9rem' }}>
                                Mostrando **{startIndex + 1}** a **{Math.min(endIndex, totalItems)}** de **{totalItems}** registros
                            </span>
                        </div>
                        <div>
                            <button 
                                style={dashboardStyles.paginationButton(currentPage === 1)} 
                                onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}
                            >
                                ← Anterior
                            </button>
                            
                            <span style={{ margin: '0 10px', color: PRIMARY_HONEY, fontWeight: 'bold' }}>
                                {currentPage} / {totalPages}
                            </span>

                            <button 
                                style={dashboardStyles.paginationButton(currentPage === totalPages)} 
                                onClick={() => handlePageChange(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
    );
};

// --- Funciones de Lógica de Columnas ---
const userColumns = (handleEditUserClick) => ([
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'rol', header: 'Rol', sortable: true, render: (u) => (
        <span style={{ 
            padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', 
            backgroundColor: u.rol === 'superadmin' ? ACCENT_ORANGE : BORDER_LIGHT, 
            color: u.rol === 'superadmin' ? TEXT_DARK : TEXT_MUTED, 
        }}>
            {u.rol === 'superadmin' ? 'ADMINISTRADOR' : 'APICULTOR'}
        </span>
    )},
    { key: 'total_hives', header: 'Colmenas', sortable: true, render: (u) => u.total_hives || 0 },
    { key: 'created_at', header: 'Registro', sortable: true, render: (u) => new Date(u.created_at).toLocaleDateString() },
    { key: 'actions', header: 'Acciones', sortable: false, render: (userItem) => (
        <button 
            onClick={() => handleEditUserClick(userItem)} 
            style={{ 
                padding: '8px 18px', backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s, box-shadow 0.2s'
            }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = ACCENT_ORANGE; e.currentTarget.style.boxShadow = '0 2px 4px rgba(217, 119, 6, 0.4)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HONEY; e.currentTarget.style.boxShadow = 'none'; }}
        >Editar</button>
    )},
]);

const hiveColumns = (navigate) => ([
    { key: 'hive_code', header: 'ID Monitor', sortable: true },
    { key: 'description', header: 'Descripción', sortable: true },
    { key: 'apicultor_name', header: 'Asignado a', sortable: true },
    { key: 'created_at', header: 'Fecha de Registro', sortable: true, render: (h) => new Date(h.created_at).toLocaleDateString() },
    { key: 'actions', header: 'Acciones', sortable: false, render: (hive) => (
        <button 
            onClick={() => navigate(`/app/colmena/${hive.hive_code}`)} 
            style={{ 
                padding: '8px 18px', backgroundColor: ACCENT_ORANGE, color: TEXT_DARK, 
                border: `1px solid ${ACCENT_ORANGE}`, borderRadius: '6px', cursor: 'pointer', 
                fontWeight: '600', transition: 'background-color 0.2s, border-color 0.2s, color 0.2s'
            }}
            onMouseOver={(e) => {e.currentTarget.style.backgroundColor = PRIMARY_HONEY; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = PRIMARY_HONEY}}
            onMouseOut={(e) => {e.currentTarget.style.backgroundColor = ACCENT_ORANGE; e.currentTarget.style.color = TEXT_DARK; e.currentTarget.style.borderColor = ACCENT_ORANGE}}
        >Ver Data</button>
    )},
]);


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
    const [userToEdit, setUserToEdit] = useState(null); 
    
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
    const filteredUsers = (dashboardData.users || []).filter(user => {
        const query = searchText.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) || 
            user.email?.toLowerCase().includes(query) ||
            user.rol?.toLowerCase().includes(query) ||
            user.total_hives?.toString().includes(query)
        );
    });

    const filteredHives = (dashboardData.hives || []).filter(hive => {
        const query = searchText.toLowerCase();
        return (
            hive.hive_code.toLowerCase().includes(query) ||
            hive.description?.toLowerCase().includes(query) || 
            hive.apicultor_name.toLowerCase().includes(query)
        );
    });
    
    // Función para manejar el clic en Editar (se pasa a DataTable)
    const handleEditUserClick = useCallback((userItem) => {
        setUserToEdit(userItem); // Lanza el modal
    }, []);

    // --- Estilos dinámicos y Columnas ---
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN, 
    };
    
    const ToggleIconComponent = Menu; 

    // Renderizado de Columnas (se pasa el handler)
    const userColumnsRendered = userColumns(handleEditUserClick);
    const hiveColumnsRendered = hiveColumns(navigate);


    const renderContent = () => {
        if (selectedTab === 'users') {
            return <DataTable 
                    data={filteredUsers} 
                    columns={userColumnsRendered} 
                    title={`Usuarios Registrados `} 
                    isLoading={isLoading} 
                    error={dataError} 
                    onSearch={setSearchText} 
                    searchText={searchText} 
                    currentPage={userCurrentPage} 
                    setCurrentPage={setUserCurrentPage} 
                    onEditUser={handleEditUserClick} 
                />;
        }
        if (selectedTab === 'hives') {
            return <DataTable 
                    data={filteredHives} 
                    columns={hiveColumnsRendered} 
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
        padding: '12px 25px', marginRight: '5px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
        fontWeight: selectedTab === tabName ? '600' : 'normal',
        backgroundColor: selectedTab === tabName ? 'white' : LIGHT_HONEY, 
        // Solución al warning "Duplicate key 'border'": Usar propiedades detalladas
        borderTop: selectedTab === tabName ? `1px solid ${BORDER_LIGHT}` : `1px solid transparent`,
        borderLeft: selectedTab === tabName ? `1px solid ${BORDER_LIGHT}` : `1px solid transparent`,
        borderRight: selectedTab === tabName ? `1px solid ${BORDER_LIGHT}` : `1px solid transparent`,
        borderBottom: selectedTab === tabName ? 'none' : `1px solid ${BORDER_LIGHT}`, 
        color: selectedTab === tabName ? PRIMARY_HONEY : TEXT_MUTED,
        transition: 'all 0.2s', fontSize: '1rem',
    });


    return (
        <div style={dashboardStyles.mainContainer}> 
            
            {/* 🚨 BOTÓN DE APERTURA FIJO: Se muestra solo si el Sidebar está cerrado */}
            {!isSidebarOpen && (
                 <button
                    style={dashboardStyles.toggleButton} 
                    onClick={toggleSidebar}
                    title={'Mostrar menú'}
                  >
                    <ToggleIconComponent size={24} /> 
                  </button>
            )}

            <Sidebar 
                isVisible={isSidebarOpen} 
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
                toggleSidebar={toggleSidebar} 
            />

            <main style={dynamicMainContentStyle}>
                <h1 style={dashboardStyles.title}>
                    Panel de Administración Central
                </h1>
                
                <p style={dashboardStyles.subtitle}>
                    Bienvenido, 
                    <span style={{ color: PRIMARY_HONEY, fontWeight: 'bold', margin: '0 4px' }}>
                        {user?.name || 'Administrador'}
                    </span>
                    . Monitorea y gestiona el ecosistema de la aplicación.
                </p>
                
                {/* -------------------------------------------------------- */}
                {/* CUADROS DE INFORMACIÓN RÁPIDA (KPIs) */}
                {/* -------------------------------------------------------- */}
                <h2 style={dashboardStyles.sectionTitle}>Métricas del Sistema</h2>
                <div style={dashboardStyles.kpiGrid}>
                    <KPICard 
                        title="Usuarios Totales" 
                        value={isLoading ? '...' : dashboardData.kpis.totalUsers} 
                        icon={Users || FaUsers} 
                        color={STATUS_INFO} 
                    />
                    <KPICard 
                        title="Apicultores" 
                        value={isLoading ? '...' : dashboardData.kpis.totalApicultores} 
                        icon={User || FaUserTie} 
                        color={STATUS_SUCCESS} 
                    />
                    <KPICard 
                        title="Colmenas Monitoreadas" 
                        value={isLoading ? '...' : dashboardData.kpis.totalHives} 
                        icon={Box || FaBoxOpen} 
                        color={PRIMARY_HONEY} 
                    />
                </div>

                {/* -------------------------------------------------------- */}
                {/* NAVEGACIÓN POR PESTAÑAS Y TABLAS */}
                {/* -------------------------------------------------------- */}
                <div style={{ borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                    <button onClick={() => setSelectedTab('users')} style={tabButtonStyle('users')}>Usuarios</button>
                    <button onClick={() => setSelectedTab('hives')} style={tabButtonStyle('hives')}>Colmenas</button>
                </div>

                {renderContent()}
            </main>

            {/* MODAL DE EDICIÓN DE USUARIO */}
            {userToEdit && (
                <div style={dashboardStyles.formModal}>
                    <div style={dashboardStyles.formContent}>
                        <button 
                            style={dashboardStyles.closeButton} 
                            onClick={() => setUserToEdit(null)} 
                            onMouseOver={(e) => e.currentTarget.style.color = PRIMARY_HONEY}
                            onMouseOut={(e) => e.currentTarget.style.color = TEXT_MUTED}
                        >
                            &times;
                        </button>
                        <EditUserModal 
                            user={userToEdit} 
                            onClose={() => setUserToEdit(null)}
                            onUserUpdated={fetchDashboardData} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;