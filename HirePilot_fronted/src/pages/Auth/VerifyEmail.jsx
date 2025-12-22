import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance'; // Tu instancia de axios configurada
import { toast } from 'react-hot-toast'; // O tu librería de notificaciones favorita

const VerifyEmail = () => {
    const { uid, token } = useParams(); // Captura los valores de la URL
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                // Hacemos la petición POST al backend
                await api.post('/verify-email/', { uid, token });
                
                setStatus('success');
                toast.success('¡Cuenta verificada! Ahora puedes iniciar sesión.');
                
                // Redirigir al login después de 3 segundos
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setStatus('error');
                toast.error('El enlace de verificación es inválido o ha expirado.');
            }
        };

        verifyAccount();
    }, [uid, token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4">Verificación de Cuenta</h2>
                
                {status === 'verifying' && <p>Verificando tu correo, por favor espera...</p>}
                
                {status === 'success' && (
                    <div className="text-green-600">
                        <p>¡Éxito! Tu correo ha sido confirmado.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Ir al Login
                        </button>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="text-red-600">
                        <p>Hubo un problema verificando tu cuenta.</p>
                        <p className="text-sm mt-2">El enlace puede haber expirado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;