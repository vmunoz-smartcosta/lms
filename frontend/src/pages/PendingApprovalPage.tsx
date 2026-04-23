import { useAuth } from '../AuthContext';
import { Clock, LogOut } from 'lucide-react';

export const PendingApprovalPage = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    console.log('Button clicked');
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-200 text-center">
        <div className="w-20 h-20 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-brown animate-pulse" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-dark mb-4">Solicitud en Proceso</h1>
        
        <div className="bg-light/50 rounded-2xl p-6 mb-8 text-sm text-gray-dark leading-relaxed">
          <p className="mb-4">
            Hola <span className="font-bold text-dark">{user?.username || 'Usuario'}</span>,
          </p>
          <p>
            Tu solicitud está siendo revisada por nuestro equipo administrativo. 
            Debes esperar a que se asigne una empresa y se apruebe tu acceso para poder ver las capacitaciones.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-dark/20"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
