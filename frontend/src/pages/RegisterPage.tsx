import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserPlus, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await signUp({ username, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error in registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-dark">Registro</h1>
          <p className="text-gray-dark mt-2">Crea tu cuenta de LMS Elite</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-light/50 border border-blue-gray rounded-xl py-2 px-4 text-dark focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-light/50 border border-blue-gray rounded-xl py-2 px-4 text-dark focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-light/50 border border-blue-gray rounded-xl py-2 px-4 text-dark focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-[#c99a68] text-white py-3 px-4 rounded-xl font-bold text-lg shadow-lg shadow-secondary/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-dark text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-secondary font-bold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
