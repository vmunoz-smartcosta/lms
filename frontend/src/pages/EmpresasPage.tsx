import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import { Building2, Users, GraduationCap, AlertCircle } from 'lucide-react';

interface Empresa {
  id: number;
  documentId: string;
  nombre: string;
  descripcion?: string;
  users?: { id: number }[];
  capacitacions?: { id: number }[];
}

export const EmpresasPage = () => {
  const { empresaScopeId, hasGlobalScope } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        setError(null);

        // Con una empresa asignada solo se ve esa; el alcance global las lista todas.
        let url = '/empresas?populate[users][populate]=*&populate[capacitacions][populate]=*';
        if (empresaScopeId) {
          url += `&filters[documentId][$eq]=${empresaScopeId}`;
        }

        const { data } = await api.get(url);
        const recibidas: Empresa[] = data.data || [];

        // Red de seguridad ante un filtro no aplicado en el servidor.
        setEmpresas(empresaScopeId
          ? recibidas.filter(e => e.documentId === empresaScopeId)
          : recibidas);
      } catch (err: any) {
        console.error('Error fetching empresas:', err);
        setError(err.response?.data?.error?.message || 'No se pudieron cargar las empresas.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [empresaScopeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-[40px] border border-blue-gray/20 shadow-xl shadow-blue-gray/5">
        <h2 className="text-2xl font-black text-dark flex items-center gap-3">
          <Building2 className="text-primary" size={28} />
          Gestión de Empresas
        </h2>
        <p className="text-gray-dark text-sm mt-1">
          {hasGlobalScope
            ? 'Todas las empresas de la plataforma.'
            : 'La empresa a la que estás asignado.'}
        </p>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {empresas.map((empresa) => (
          <div
            key={empresa.id}
            className="group bg-white rounded-[40px] p-8 border border-blue-gray/20 shadow-xl shadow-blue-gray/5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Building2 className="text-primary" size={28} />
              </div>

              <h3 className="text-2xl font-black text-dark mb-3 group-hover:text-primary transition-colors leading-tight">
                {empresa.nombre}
              </h3>

              <p className="text-gray-dark text-sm leading-relaxed mb-6 line-clamp-2">
                {empresa.descripcion || 'Sin descripción'}
              </p>

              <div className="pt-6 border-t border-blue-gray/10 flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-dark uppercase tracking-widest">
                  <Users size={14} className="text-primary" />
                  {empresa.users?.length ?? 0} usuarios
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-dark uppercase tracking-widest">
                  <GraduationCap size={14} className="text-primary" />
                  {empresa.capacitacions?.length ?? 0} capacitaciones
                </div>
              </div>
            </div>
          </div>
        ))}

        {!error && empresas.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-blue-gray/20 flex flex-col items-center">
            <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center mb-6">
              <Building2 className="text-blue-gray" size={32} />
            </div>
            <h3 className="text-2xl font-black text-dark tracking-tight">Sin empresas</h3>
            <p className="text-gray-dark mt-2 max-w-xs mx-auto">No hay empresas que mostrar con tu alcance actual.</p>
          </div>
        )}
      </div>
    </div>
  );
};
