import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ApicultorDashboard from './pages/ApicultorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ColmenaDetailPage from './pages/ColmenaDetailPage'; 
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage'; 

function App() {
  return (
    <div style={{ minHeight: '100vh' }}> 
      <Routes>
        {/* 1. RUTA PÚBLICA: Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* 2. RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={['apicultor', 'superadmin']} />}>
          <Route path="/app/dashboard" element={<ApicultorDashboard />} />
          <Route path="/app/colmena/:hiveCode" element={<ColmenaDetailPage />} /> 
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* 3. RUTA 404 */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </div>
  );
}

export default App;
