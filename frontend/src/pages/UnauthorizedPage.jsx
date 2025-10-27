import { Link } from 'react-router-dom';

function UnauthorizedPage() {
    return (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <h2 style={{ fontSize: "24px", marginTop: "24px", marginBottom: "8px" }}>
                Acceso Denegado
            </h2>
            <p style={{ color: 'gray.500' }}>
                No tienes permiso para acceder a esta página.
            </p>
            <p style={{ marginTop: "16px" }}>
                <Link to="/">Volver al Login</Link>
            </p>
        </div>
    );
}
export default UnauthorizedPage;