import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Building2,
  Clock
} from 'lucide-react';

interface Contenido {
  id: number;
  documentId: string;
  Titulo: string;
  orden: number;
  contenido: any[];
  minutos: number | null;
  actividad: string | null;
}

interface CapacitacionDetail {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string;
  actualizacion: string;
  contenidos: Contenido[];
  empresas: any[];
}

export const CapacitacionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CapacitacionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Contenido | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/capacitacions/${id}?populate[contenidos][populate]=*&populate[empresas][populate]=*`);
        const sortedData = response.data.data;
        // Sort contents by 'orden'
        if (sortedData.contenidos) {
          sortedData.contenidos.sort((a: Contenido, b: Contenido) => a.orden - b.orden);
        }
        setData(sortedData);
        if (sortedData.contenidos?.length > 0) {
          setActiveChapter(sortedData.contenidos[0]);
        }
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div>Capacitación no encontrada</div>;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/capacitaciones')}
          className="p-3 bg-white border border-blue-gray/30 rounded-2xl text-gray-dark hover:text-primary hover:border-primary transition-all shadow-sm group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">
            <BookOpen size={14} />
            Programa de Capacitación
          </div>
          <h1 className="text-3xl font-black text-dark tracking-tight leading-none">{data.nombre}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Chapters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-blue-gray/20 shadow-xl shadow-blue-gray/5">
            <h3 className="text-sm font-black text-dark uppercase tracking-widest mb-6 flex items-center gap-2">
              Contenido del Curso
              <span className="ml-auto bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px]">
                {data.contenidos?.length || 0} Clases
              </span>
            </h3>

            <div className="space-y-3">
              {data.contenidos?.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapter(chapter)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 border-2 ${activeChapter?.id === chapter.id
                    ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-light/30 border-transparent text-gray-dark hover:bg-light/50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${activeChapter?.id === chapter.id ? 'bg-primary text-white' : 'bg-blue-gray/20 text-gray-dark'
                    }`}>
                    {chapter.orden}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">{chapter.Titulo}</p>
                    <p className="text-[10px] uppercase tracking-widest font-black mt-1 opacity-60">
                      Actividad {chapter.orden}
                    </p>
                  </div>
                  {activeChapter?.id === chapter.id && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Building2 size={14} />
              Empresas Autorizadas
            </h4>
            <div className="flex flex-wrap gap-2 relative z-10">
              {data.empresas?.map((emp) => (
                <span key={emp.id} className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                  {emp.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] border border-blue-gray/20 shadow-2xl shadow-blue-gray/10 overflow-hidden min-h-[600px] flex flex-col">
            {activeChapter ? (
              <>
                <div className="p-10 border-b border-blue-gray/10 bg-light/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Actividad {activeChapter.orden}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-dark font-bold uppercase tracking-widest">
                      <Clock size={14} />
                      {activeChapter.minutos || 0} min {activeChapter.actividad || 'Lectura'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-dark tracking-tight mb-2">{activeChapter.Titulo}</h2>
                </div>

                <div className="p-12 prose prose-slate max-w-none flex-1">
                  {/* Simplistic rendering of blocks content */}
                  {activeChapter.contenido?.map((block, idx) => (
                    <div key={idx} className="mb-6">
                      {block.type === 'heading' && (
                        <h3 className={`font-black text-dark tracking-tight mt-8 mb-4 ${block.level === 1 ? 'text-3xl' : 'text-xl'
                          }`}>
                          {block.children?.[0]?.text}
                        </h3>
                      )}
                      {block.type === 'paragraph' && (
                        <p className="text-gray-dark leading-relaxed text-lg mb-4">
                          {block.children?.[0]?.text}
                        </p>
                      )}
                      {block.type === 'image' && block.image && (
                        <div className="my-10 rounded-[32px] overflow-hidden shadow-2xl border-8 border-light/30">
                          <img
                            src={block.image.url}
                            alt={block.image.alternativeText || 'Content image'}
                            className="w-full h-auto"
                          />
                          {block.image.caption && (
                            <div className="bg-light/30 p-4 text-center text-xs font-bold text-gray-dark uppercase tracking-widest">
                              {block.image.caption}
                            </div>
                          )}
                        </div>
                      )}
                      {block.type === 'list' && (
                        <ul className="space-y-3 my-6">
                          {block.children?.map((item: any, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-dark leading-relaxed">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {item.children?.[0]?.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-light/30 border-t border-blue-gray/10 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-dark hover:text-dark transition-colors">
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    Siguiente Capítulo <ChevronRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="text-blue-gray" size={32} />
                </div>
                <h3 className="text-xl font-bold text-dark">Selecciona un capítulo</h3>
                <p className="text-gray-dark mt-2">Explora el contenido de esta capacitación seleccionando un capítulo a la izquierda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
