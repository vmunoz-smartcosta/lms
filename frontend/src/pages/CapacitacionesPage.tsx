import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { GraduationCap, Calendar, ChevronRight, BookOpen, Search, Filter, Building2 } from 'lucide-react';

interface Capacitacion {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string;
  actualizacion: string;
}

export const CapacitacionesPage = () => {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCapacitaciones = async () => {
      try {
        setLoading(true);
        let url = '/capacitacions';
        
        // Si el usuario pertenece a una empresa y NO es administrador, filtramos por ella
        const isAdmin = user?.rol?.nombre?.toLowerCase() === 'administrador';
        
        if (user?.empresa?.id && !isAdmin) {
          url += `?filters[empresas][id][$eq]=${user.empresa.id}`;
          console.log('[Capacitaciones] Filtrando por empresa ID:', user.empresa.id);
        } else if (isAdmin) {
          console.log('[Capacitaciones] Administrador detectado: Ver todas');
        }

        const response = await api.get(url);
        setCapacitaciones(response.data.data);
      } catch (error) {
        console.error('Error fetching capacitaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchCapacitaciones();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-blue-gray/20 shadow-xl shadow-blue-gray/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-1">
            <Building2 size={14} />
            {user?.empresa?.nombre || 'General'}
          </div>
          <h1 className="text-4xl font-black text-dark tracking-tight leading-none">CAPACITACIONES</h1>
          <p className="text-gray-dark mt-2">Explora los programas de formación vinculados a tu organización.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-dark" size={18} />
            <input 
              type="text" 
              placeholder="Buscar capacitación..." 
              className="bg-light/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-12 pr-6 text-sm w-full md:w-64 outline-none transition-all shadow-inner"
            />
          </div>
          <button className="p-3 bg-light rounded-2xl text-gray-dark hover:text-primary transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {capacitaciones.map((cap) => (
          <div 
            key={cap.id}
            onClick={() => navigate(`/capacitaciones/${cap.documentId}`)}
            className="group bg-white rounded-[40px] p-8 border border-blue-gray/20 shadow-xl shadow-blue-gray/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary transition-all duration-500 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <GraduationCap className="text-primary" size={28} />
              </div>

              <h3 className="text-2xl font-black text-dark mb-3 group-hover:text-primary transition-colors leading-tight">
                {cap.nombre}
              </h3>
              
              <p className="text-gray-dark text-sm leading-relaxed mb-6 line-clamp-2">
                {cap.descripcion}
              </p>

              <div className="pt-6 border-t border-blue-gray/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-dark uppercase tracking-widest">
                  <Calendar size={14} className="text-primary" />
                  <span>{cap.actualizacion}</span>
                </div>
                
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  Entrar
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {capacitaciones.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-blue-gray/20 flex flex-col items-center">
            <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-blue-gray" size={32} />
            </div>
            <h3 className="text-2xl font-black text-dark tracking-tight">Sin capacitaciones</h3>
            <p className="text-gray-dark mt-2 max-w-xs mx-auto">No hay programas de formación asignados a tu empresa actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
