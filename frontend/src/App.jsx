import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ApicultorDashboard from './pages/ApicultorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ColmenaDetailPage from './pages/ColmenaDetailPage'; 
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage'; 
import NotFoundPage from './pages/NotFoundPage';
//import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
//import ResetPasswordPage from './pages/ResetPasswordPage'; 

function App() {
  return (
    <div style={{ minHeight: '100vh' }}> 
      <Routes>

        {/* 1. RUTAS PÚBLICAS Y DE AUTENTICACIÓN */}
        <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect root to login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        
        {/* 2. RUTAS PROTEGIDAS (Apicultor y Admin) */}
        <Route element={<ProtectedRoute allowedRoles={['apicultor', 'superadmin']} />}>
          <Route path="/app/dashboard" element={<ApicultorDashboard />} />
          <Route path="/app/colmena/:hiveCode" element={<ColmenaDetailPage />} /> 
        
            {/* Rutas de Admin anidadas (Doble protección) */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* 3. RUTA 404 (Debe ir al final para que actúe como fallback) */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </div>
  );
}

export default App;