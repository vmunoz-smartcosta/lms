import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Trophy
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

interface Evaluacion {
  id: number;
  documentId: string;
  pregunta: string;
  respuesta: boolean;
}

interface CapacitacionDetail {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string;
  actualizacion: string;
  contenidos: Contenido[];
  empresas: any[];
  evaluacions: Evaluacion[];
}

export const CapacitacionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<CapacitacionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Contenido | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedEvaluations, setSelectedEvaluations] = useState<Evaluacion[]>([]);
  const [evaluationAnswers, setEvaluationAnswers] = useState<Record<number, boolean>>({});
  const [evaluationFinished, setEvaluationFinished] = useState(false);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/capacitacions/${id}?populate[contenidos][populate]=*&populate[empresas][populate]=*&populate[evaluacions][populate]=*`);
        const sortedData = response.data.data;
        if (sortedData.contenidos) {
          sortedData.contenidos.sort((a: Contenido, b: Contenido) => a.orden - b.orden);
        }
        setData(sortedData);

        // Prepare evaluations (random 10 if > 10)
        if (sortedData.evaluacions && sortedData.evaluacions.length > 0) {
          const shuffled = [...sortedData.evaluacions].sort(() => 0.5 - Math.random());
          setSelectedEvaluations(shuffled.slice(0, 10));
        }

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

  const handleNext = () => {
    console.log('[Capacitacion] handleNext triggered');
    if (!data || !activeChapter) {
      console.log('[Capacitacion] No data or activeChapter', { data: !!data, activeChapter: !!activeChapter });
      return;
    }
    
    const currentIndex = data.contenidos.findIndex(c => c.id === activeChapter.id);
    console.log('[Capacitacion] Current chapter index:', currentIndex, 'Total contents:', data.contenidos.length);
    
    if (currentIndex < data.contenidos.length - 1) {
      console.log('[Capacitacion] Moving to next chapter');
      setActiveChapter(data.contenidos[currentIndex + 1]);
    } else if (data.evaluacions?.length > 0) {
      console.log('[Capacitacion] Reached end, showing evaluation. Questions available:', data.evaluacions.length);
      setShowEvaluation(true);
      setActiveChapter(null);
    } else {
      console.log('[Capacitacion] Reached end but no evaluations found');
    }
  };

  const handlePrev = () => {
    if (!data || !activeChapter) {
      if (showEvaluation && data?.contenidos.length) {
        setShowEvaluation(false);
        setActiveChapter(data.contenidos[data.contenidos.length - 1]);
      }
      return;
    }
    const currentIndex = data.contenidos.findIndex(c => c.id === activeChapter.id);
    if (currentIndex > 0) {
      setActiveChapter(data.contenidos[currentIndex - 1]);
    }
  };

  const submitEvaluation = async () => {
    if (!data || !user || selectedEvaluations.length === 0) return;
    setSubmitting(true);

    let correctCount = 0;
    selectedEvaluations.forEach(q => {
      if (evaluationAnswers[q.id] === q.respuesta) {
        correctCount++;
      }
    });

    const score = correctCount / selectedEvaluations.length;
    const isApproved = score >= 0.75; // 75% threshold
    setApproved(isApproved);
    setEvaluationFinished(true);

    try {
      await api.post('/certificados', {
        data: {
          aprobado: isApproved,
          capacitacion: data.id,
          user: user.id
        }
      });
    } catch (error) {
      console.error('Error creating certificate:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
                  onClick={() => {
                    setActiveChapter(chapter);
                    setShowEvaluation(false);
                  }}
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
                </button>
              ))}

              {data.evaluacions?.length > 0 && (
                <button
                  onClick={() => {
                    setShowEvaluation(true);
                    setActiveChapter(null);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 border-2 ${showEvaluation
                    ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-light/30 border-transparent text-gray-dark hover:bg-light/50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${showEvaluation ? 'bg-primary text-white' : 'bg-blue-gray/20 text-gray-dark'
                    }`}>
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">Evaluación Final</p>
                    <p className="text-[10px] uppercase tracking-widest font-black mt-1 opacity-60">
                      Examen de aprobación
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

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
                  {activeChapter.contenido?.map((block, idx) => (
                    <div key={idx} className="mb-6">
                      {block.type === 'heading' && (
                        <h3 className={`font-black text-dark tracking-tight mt-8 mb-4 ${block.level === 1 ? 'text-3xl' : 'text-xl'}`}>
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
                          <img src={block.image.url} alt={block.image.alternativeText || ''} className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-light/30 border-t border-blue-gray/10 flex items-center justify-between">
                  <button onClick={handlePrev} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-dark hover:text-dark transition-colors">
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button onClick={handleNext} className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    {data.contenidos.findIndex(c => c.id === activeChapter.id) === data.contenidos.length - 1 ? 'Ir a Evaluación' : 'Siguiente Capítulo'} <ChevronRight size={16} />
                  </button>
                </div>
              </>
            ) : showEvaluation ? (
              <div className="p-12 flex-1 flex flex-col">
                {!evaluationFinished ? (
                  <>
                    <div className="mb-10 text-center">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardCheck size={40} />
                      </div>
                      <h2 className="text-3xl font-black text-dark tracking-tight mb-2">Evaluación Final</h2>
                      <p className="text-gray-dark font-medium">Responde correctamente al menos el 75% para obtener tu certificado.</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">
                        {selectedEvaluations.length} Preguntas Seleccionadas
                      </p>
                    </div>

                    <div className="space-y-8 flex-1">
                      {selectedEvaluations.map((evalItem, index) => (
                        <div key={evalItem.id} className="bg-light/30 p-8 rounded-[32px] border border-blue-gray/10">
                          <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Pregunta {index + 1}</p>
                          <h4 className="text-xl font-bold text-dark mb-6 leading-tight">{evalItem.pregunta}</h4>
                          <div className="flex gap-4">
                            <button
                              onClick={() => setEvaluationAnswers(prev => ({ ...prev, [evalItem.id]: true }))}
                              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${evaluationAnswers[evalItem.id] === true
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-white border-2 border-blue-gray/20 text-gray-dark hover:border-green-500/50'
                                }`}
                            >
                              Verdadero <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => setEvaluationAnswers(prev => ({ ...prev, [evalItem.id]: false }))}
                              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${evaluationAnswers[evalItem.id] === false
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'bg-white border-2 border-blue-gray/20 text-gray-dark hover:border-red-500/50'
                                }`}
                            >
                              Falso <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={Object.keys(evaluationAnswers).length < selectedEvaluations.length || submitting}
                      onClick={submitEvaluation}
                      className="w-full mt-10 bg-dark text-white p-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {submitting ? 'Enviando...' : 'Finalizar y Calificar'}
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    {approved ? (
                      <>
                        <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40 relative">
                          <Trophy size={64} />
                          <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping"></div>
                        </div>
                        <h2 className="text-5xl font-black text-dark tracking-tighter mb-4">¡FELICITACIONES!</h2>
                        <p className="text-xl text-gray-dark max-w-md mx-auto mb-10 leading-relaxed">
                          Has aprobado la capacitación <strong>{data.nombre}</strong> exitosamente. Tu certificado ha sido generado.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-32 h-32 bg-red-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-red-500/40">
                          <XCircle size={64} />
                        </div>
                        <h2 className="text-5xl font-black text-dark tracking-tighter mb-4">LO SENTIMOS</h2>
                        <p className="text-xl text-gray-dark max-w-md mx-auto mb-10 leading-relaxed">
                          No has logrado responder correctamente todas las preguntas. Puedes volver a intentarlo cuando estés listo.
                        </p>
                      </>
                    )}
                    <button
                      onClick={() => navigate('/capacitaciones')}
                      className="bg-light px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-dark hover:bg-blue-gray/20 transition-all"
                    >
                      Volver a Capacitaciones
                    </button>
                  </div>
                )}
              </div>
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
