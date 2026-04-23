import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-dark">Bienvenido</h1>
          <p className="text-gray-dark mt-2">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100 animate-pulse">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Usuario o Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-light/50 border border-blue-gray rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-light/50 border border-blue-gray rounded-xl py-3 px-4 text-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-[#5399b8] text-white py-3 px-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-dark text-sm">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
