import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Eliminar tokens del almacenamiento
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id"); // opcional, si guardaste info de usuario
        navigate("/login");
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='text-gray-600'>Welcome to your dashboard!</p>

            {/* Botón de cerrar sesión */}
            <button
                onClick={handleLogout}
                className='mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
            >
                Cerrar sesión
            </button>
        </div>
    );
};

export default Dashboard;
