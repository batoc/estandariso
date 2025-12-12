'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  ArrowLeft,
  FileText,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  ShieldAlert,
  Lightbulb,
  Box,
  Truck,
  ClipboardList,
  Loader2,
  Search,
  Target,
  Calendar,
  Info,
  CheckSquare,
  Trash2
} from 'lucide-react';

export default function NuevaRevisionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'revision' | 'salidas'>('revision');

  // Datos de los módulos (9.3.2)
  const [compromisosPrevios, setCompromisosPrevios] = useState<any[]>([]);
  const [cambios, setCambios] = useState<any[]>([]);
  const [encuestas, setEncuestas] = useState<any[]>([]);
  const [quejas, setQuejas] = useState<any[]>([]);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [noConformidades, setNoConformidades] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [auditorias, setAuditorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [riesgos, setRiesgos] = useState<any[]>([]);
  const [mejoras, setMejoras] = useState<any[]>([]);

  // Nuevos Compromisos (Salidas)
  const [nuevosCompromisos, setNuevosCompromisos] = useState<any[]>([]);
  const [nuevoCompromiso, setNuevoCompromiso] = useState({
    descripcion: '',
    responsable: '',
    fecha_limite: '',
    prioridad: 'media'
  });

  // Formulario
  const [formData, setFormData] = useState({
    // Datos generales
    codigo_revision: '',
    titulo: '',
    fecha_revision: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '12:00',
    lugar: '',
    responsable: '',
    cargo_responsable: '',
    participantes: '',
    
    // 9.3.3.a - ANÁLISIS (campos editables)
    analisis_acciones_previas: '',
    analisis_cambios_externos: '',
    analisis_satisfaccion_cliente: '',
    analisis_objetivos_calidad: '',
    analisis_conformidad_productos: '', // Procesos e Inspecciones
    analisis_no_conformidades: '',
    analisis_indicadores: '',
    analisis_auditorias: '',
    analisis_proveedores: '',
    analisis_recursos: '',
    analisis_riesgos: '', // Riesgos y Oportunidades
    analisis_mejoras: '', // Oportunidades de Mejora
    
    // Conclusiones
    conclusiones_generales: '',
    conveniencia_sgc: 'Conveniente',
    adecuacion_sgc: 'Adecuado',
    eficacia_sgc: 'Eficaz',
    
    // 9.3.3 - SALIDAS
    decisiones_mejora: '',
    decisiones_cambios_sgc: '',
    decisiones_recursos: '',
    fecha_proxima_revision: ''
  });

  useEffect(() => {
    cargarDatosModulos();
  }, []);

  async function cargarDatosModulos() {
    try {
      const [
        resCompromisos, resCambios, resEncuestas, resQuejas, 
        resObjetivos, resInspecciones, resNC, resIndicadores,
        resAuditorias, resProveedores, resRecursos, resRiesgos, resMejoras
      ] = await Promise.all([
        supabase.from('compromisos').select('*').eq('estado', 'pendiente'),
        supabase.from('gestion_cambios').select('*').order('fecha_identificacion', { ascending: false }).limit(6),
        supabase.from('encuestas_satisfaccion').select('*').order('fecha_encuesta', { ascending: false }).limit(6),
        supabase.from('quejas_reclamos').select('*').order('fecha_recepcion', { ascending: false }).limit(6),
        supabase.from('objetivos_calidad').select('*'),
        supabase.from('inspecciones_verificacion').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('no_conformidades').select('*').order('fecha_deteccion', { ascending: false }).limit(6),
        supabase.from('indicadores').select('*'),
        supabase.from('auditorias').select('*').order('fecha_auditoria', { ascending: false }).limit(6),
        supabase.from('proveedores').select('*').order('fecha_evaluacion', { ascending: false }).limit(6),
        supabase.from('recursos').select('*').order('fecha_evaluacion', { ascending: false }).limit(6),
        supabase.from('riesgos_oportunidades').select('*').order('nivel_riesgo', { ascending: false }).limit(6),
        supabase.from('oportunidades_mejora').select('*').order('fecha_identificacion', { ascending: false }).limit(6)
      ]);

      setCompromisosPrevios(resCompromisos.data || []);
      setCambios(resCambios.data || []);
      setEncuestas(resEncuestas.data || []);
      setQuejas(resQuejas.data || []);
      setObjetivos(resObjetivos.data || []);
      setInspecciones(resInspecciones.data || []);
      setNoConformidades(resNC.data || []);
      setIndicadores(resIndicadores.data || []);
      setAuditorias(resAuditorias.data || []);
      setProveedores(resProveedores.data || []);
      setRecursos(resRecursos.data || []);
      setRiesgos(resRiesgos.data || []);
      setMejoras(resMejoras.data || []);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Guardar la Revisión
      const { data: revision, error: revisionError } = await supabase
        .from('revisiones')
        .insert([{
          titulo: formData.titulo,
          fecha_revision: formData.fecha_revision,
          responsable: formData.responsable,
          participantes: formData.participantes ? formData.participantes.split(',').map(p => p.trim()) : [],
          estado: 'abierta',
          
          // Entradas
          analisis_acciones_previas: formData.analisis_acciones_previas,
          analisis_cambios_externos: formData.analisis_cambios_externos,
          analisis_clientes: formData.analisis_satisfaccion_cliente,
          analisis_objetivos_calidad: formData.analisis_objetivos_calidad,
          analisis_procesos: `${formData.analisis_conformidad_productos}\n\nAnálisis NC: ${formData.analisis_no_conformidades}`,
          analisis_auditorias: formData.analisis_auditorias,
          analisis_proveedores: formData.analisis_proveedores,
          analisis_recursos: formData.analisis_recursos,
          analisis_riesgos: formData.analisis_riesgos,
          analisis_oportunidades: formData.analisis_mejoras,
          
          // Salidas
          conclusiones_generales: formData.conclusiones_generales,
          decisiones_sgc: formData.decisiones_cambios_sgc,
          decisiones_productos: formData.decisiones_mejora,
          necesidades_recursos: formData.decisiones_recursos
        }])
        .select()
        .single();

      if (revisionError) throw revisionError;

      // 2. Guardar Compromisos
      if (nuevosCompromisos.length > 0 && revision) {
        const compromisosToInsert = nuevosCompromisos.map(c => ({
          revision_id: revision.id,
          descripcion: c.descripcion,
          responsable: c.responsable,
          fecha_compromiso: new Date().toISOString().split('T')[0],
          fecha_limite: c.fecha_limite || null,
          estado: 'pendiente'
        }));

        const { error: compromisosError } = await supabase
          .from('compromisos')
          .insert(compromisosToInsert);

        if (compromisosError) {
          console.error('Error guardando compromisos:', compromisosError);
          // No lanzamos error fatal para no perder la revisión, pero avisamos
          alert('Revisión guardada, pero hubo error al guardar los compromisos.');
        }
      }

      alert('Revisión guardada correctamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la revisión');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium">Recopilando información del SGC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Nueva Revisión por la Dirección</h1>
          </div>
          <p className="text-slate-500 ml-7">Evaluación estratégica del Sistema de Gestión de Calidad (ISO 9001:2015)</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Revisión
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('revision')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'revision' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          1. Revisión y Análisis de Entradas
        </button>
        <button
          onClick={() => setActiveTab('salidas')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'salidas' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          2. Decisiones y Cierre
        </button>
      </div>

      <div className="space-y-8">
        {/* Datos Generales - Siempre visible en Tab 1 */}
        {activeTab === 'revision' && (
          <>
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Datos Generales de la Revisión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo_revision}
                    onChange={(e) => setFormData({...formData, codigo_revision: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. REV-2024-01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Revisión Anual 2024"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha_revision}
                    onChange={(e) => setFormData({...formData, fecha_revision: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lugar</label>
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(e) => setFormData({...formData, lugar: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Participantes</label>
                  <input
                    type="text"
                    value={formData.participantes}
                    onChange={(e) => setFormData({...formData, participantes: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nombres separados por coma"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: Acciones Previas */}
            <div className="card p-6 border-l-4 border-l-amber-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                1. Estado de acciones de revisiones previas
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-100">
                <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Info size={16} />
                  Compromisos Pendientes (Detalle para Análisis)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {compromisosPrevios.length > 0 ? (
                    compromisosPrevios.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-800 text-sm line-clamp-2">{c.descripcion}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border shrink-0 ml-2 uppercase ${
                            c.estado === 'completado' ? 'bg-green-100 text-green-700 border-green-200' :
                            c.estado === 'vencido' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {c.estado}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-2 mt-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-medium block text-slate-500">Responsable:</span> {c.responsable}</p>
                            <p><span className="font-medium block text-slate-500">Vence:</span> {c.fecha_limite}</p>
                          </div>
                          {c.observaciones && (
                            <p className="bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-500">
                              "{c.observaciones}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-amber-700 italic col-span-full">No hay compromisos pendientes de revisiones anteriores.</p>
                  )}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.a - Estado de acciones previas):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_acciones_previas}
                  onChange={(e) => setFormData({...formData, analisis_acciones_previas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Evaluar la eficacia de las acciones tomadas en revisiones anteriores..."
                />
              </div>
            </div>

            {/* SECCIÓN 2: Cambios Contexto */}
            <div className="card p-6 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                2. Cambios en cuestiones externas e internas
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Info size={16} />
                  Cambios Recientes (Detalle para Análisis)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {cambios.length > 0 ? (
                    cambios.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-800 text-sm line-clamp-2">{c.descripcion_cambio}</span>
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 capitalize shrink-0 ml-2">
                            {c.tipo_cambio}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-2 mt-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-medium block text-slate-500">Fecha:</span> {c.fecha_identificacion}</p>
                            <p><span className="font-medium block text-slate-500">Impacto:</span> {c.impacto_sgc || 'No definido'}</p>
                          </div>
                          {c.categoria && <p><span className="font-medium text-slate-500">Categoría:</span> {c.categoria}</p>}
                          {c.procesos_afectados && <p><span className="font-medium text-slate-500">Procesos:</span> {Array.isArray(c.procesos_afectados) ? c.procesos_afectados.join(', ') : c.procesos_afectados}</p>}
                          {c.analisis_impacto && (
                            <p className="bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-500">
                              {c.analisis_impacto}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-blue-700 italic col-span-full">No se han registrado cambios significativos recientes.</p>
                  )}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.b - Cambios en cuestiones externas e internas):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_cambios_externos}
                  onChange={(e) => setFormData({...formData, analisis_cambios_externos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Analizar cómo los cambios afectan al SGC..."
                />
              </div>
            </div>

            {/* SECCIÓN 3: Satisfacción Cliente */}
            <div className="card p-6 border-l-4 border-l-emerald-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                3. Satisfacción del cliente y retroalimentación
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex justify-between items-center">
                    <span>Últimas Encuestas</span>
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-xs">{encuestas.length}</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {encuestas.map(e => (
                      <div key={e.id} className="bg-white p-3 rounded border border-emerald-200 text-xs shadow-sm">
                        <div className="flex justify-between font-medium text-slate-700 mb-1">
                          <span>{e.cliente || 'Anónimo'}</span>
                          <span className={`px-2 rounded-full font-bold ${
                            (e.satisfaccion_general || 0) >= 4 ? 'bg-green-100 text-green-700' :
                            (e.satisfaccion_general || 0) >= 3 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>{e.satisfaccion_general}/5</span>
                        </div>
                        {/* Visual Rating Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1 mb-2">
                          <div 
                            className={`h-1 rounded-full ${
                              (e.satisfaccion_general || 0) >= 4 ? 'bg-green-500' :
                              (e.satisfaccion_general || 0) >= 3 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${((e.satisfaccion_general || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-slate-500 mb-1"><span className="font-medium">Tipo:</span> {e.tipo_cliente || 'N/A'}</p>
                        {e.comentarios && <p className="text-slate-600 italic bg-slate-50 p-2 rounded">"{e.comentarios}"</p>}
                        {e.areas_mejora_identificadas && <p className="mt-1 text-red-500"><span className="font-medium">Mejora:</span> {e.areas_mejora_identificadas}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3 flex justify-between items-center">
                    <span>Quejas Recientes</span>
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-xs">{quejas.length}</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {quejas.map(q => (
                      <div key={q.id} className="bg-white p-3 rounded border border-emerald-200 text-xs shadow-sm">
                        <div className="flex justify-between font-medium text-slate-700 mb-1">
                          <span className="truncate w-2/3 font-bold">{q.tipo?.toUpperCase()}: {q.descripcion}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${q.estado === 'cerrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {q.estado}
                          </span>
                        </div>
                        <p className="text-slate-500 mb-1"><span className="font-medium">Cliente:</span> {q.cliente}</p>
                        <p className="text-slate-500 mb-1"><span className="font-medium">Fecha:</span> {q.fecha_recepcion}</p>
                        {q.acciones_tomadas && <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded"><span className="font-medium">Acción:</span> {q.acciones_tomadas}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.1 - Satisfacción del cliente y retroalimentación):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_satisfaccion_cliente}
                  onChange={(e) => setFormData({...formData, analisis_satisfaccion_cliente: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Analizar tendencias de satisfacción y quejas..."
                />
              </div>
            </div>

            {/* SECCIÓN 4: Objetivos */}
            <div className="card p-6 border-l-4 border-l-purple-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={20} className="text-purple-500" />
                4. Grado de logro de los objetivos de calidad
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
                <h4 className="text-sm font-bold text-purple-800 mb-3">Estado de Objetivos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {objetivos.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-slate-800 text-sm">{o.objetivo}</h5>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ml-2 ${
                          o.estado === 'alcanzado' ? 'bg-green-100 text-green-700' : 
                          o.estado === 'en_progreso' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {o.estado}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                          <span className="block text-slate-400 text-[10px] uppercase">Meta</span>
                          <span className="font-bold text-slate-700 text-sm">{o.valor_meta} {o.unidad_medida}</span>
                        </div>
                        <div className={`p-2 rounded text-center border ${
                          o.estado === 'alcanzado' ? 'bg-green-50 border-green-100' : 
                          o.estado === 'en_progreso' ? 'bg-yellow-50 border-yellow-100' : 
                          'bg-red-50 border-red-100'
                        }`}>
                          <span className={`block text-[10px] uppercase ${
                            o.estado === 'alcanzado' ? 'text-green-600' : 
                            o.estado === 'en_progreso' ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>Actual</span>
                          <span className={`font-bold text-sm ${
                            o.estado === 'alcanzado' ? 'text-green-700' : 
                            o.estado === 'en_progreso' ? 'text-yellow-700' : 
                            'text-red-700'
                          }`}>{o.valor_actual || '-'}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 mt-auto">
                        <p><span className="font-medium">Responsable:</span> {o.responsable}</p>
                        <p><span className="font-medium">Fecha Meta:</span> {o.fecha_meta}</p>
                        {o.tendencia && <p><span className="font-medium">Tendencia:</span> {o.tendencia}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.2 - Grado de logro de los objetivos de calidad):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_objetivos_calidad}
                  onChange={(e) => setFormData({...formData, analisis_objetivos_calidad: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Evaluar el cumplimiento de metas y objetivos..."
                />
              </div>
            </div>

            {/* SECCIÓN 5: Procesos y Conformidad */}
            <div className="card p-6 border-l-4 border-l-indigo-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search size={20} className="text-indigo-500" />
                5. Desempeño de procesos y conformidad de productos
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-800 mb-3">Últimas Inspecciones</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {inspecciones.map(i => (
                        <div key={i.id} className="bg-white p-3 rounded border border-indigo-200 text-xs shadow-sm">
                          <div className="flex justify-between font-medium text-slate-700 mb-1">
                            <span className="font-bold">{i.tipo_inspeccion}</span>
                            <span className={`px-2 py-0.5 rounded uppercase text-[10px] ${
                              i.estado_seguimiento === 'cerrado' ? 'bg-green-100 text-green-700' : 
                              i.estado_seguimiento === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {i.estado_seguimiento?.replace('_', ' ') || 'PENDIENTE'}
                            </span>
                          </div>
                          <p className="text-slate-500"><span className="font-medium">Fecha:</span> {i.fecha_inspeccion}</p>
                          <p className="text-slate-500"><span className="font-medium">Inspector:</span> {i.inspector}</p>
                          {i.hallazgos && <p className="mt-1 bg-slate-50 p-2 rounded text-slate-600 italic">"{i.hallazgos}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-800 mb-3">Indicadores Clave</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {indicadores.map(ind => (
                        <div key={ind.id} className="bg-white p-3 rounded border border-indigo-200 text-xs shadow-sm">
                          <p className="font-bold text-slate-800 mb-2">{ind.nombre_indicador}</p>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="text-center bg-slate-50 p-1 rounded">
                              <span className="block text-[10px] text-slate-400">Meta</span>
                              <span className="font-medium text-slate-700">{ind.valor_meta}</span>
                            </div>
                            <div className="text-center bg-slate-50 p-1 rounded">
                              <span className="block text-[10px] text-slate-400">Actual</span>
                              <span className="font-medium text-slate-700">{ind.valor_actual}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-slate-500">Cumplimiento</span>
                              <span className={`font-bold ${
                                (ind.cumplimiento || 0) >= 100 ? 'text-green-600' : 
                                (ind.cumplimiento || 0) >= 80 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>{ind.cumplimiento ? `${ind.cumplimiento}%` : '0%'}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  (ind.cumplimiento || 0) >= 100 ? 'bg-green-500' : 
                                  (ind.cumplimiento || 0) >= 80 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${Math.min(ind.cumplimiento || 0, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] mt-1 text-slate-400">
                              <span>Tendencia: {ind.tendencia || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.3/4 - Procesos y conformidad de productos):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_conformidad_productos}
                  onChange={(e) => setFormData({...formData, analisis_conformidad_productos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Analizar resultados de inspecciones e indicadores de proceso..."
                />
              </div>
            </div>

            {/* SECCIÓN 6: No Conformidades */}
            <div className="card p-6 border-l-4 border-l-red-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                6. No conformidades y acciones correctivas
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                <h4 className="text-sm font-bold text-red-800 mb-3">No Conformidades Recientes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {noConformidades.map(nc => (
                    <div key={nc.id} className="bg-white p-4 rounded-lg border border-red-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{nc.codigo_nc || 'S/C'}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                          nc.estado === 'cerrada' ? 'bg-green-100 text-green-700 border-green-200' : 
                          ['en_analisis', 'en_implementacion', 'en_verificacion'].includes(nc.estado) ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {nc.estado?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {nc.es_recurrente && (
                        <div className="mb-2">
                          <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase flex items-center w-fit gap-1">
                            <AlertTriangle size={10} /> Recurrente
                          </span>
                        </div>
                      )}

                      <p className="text-xs font-medium text-slate-800 mb-2 line-clamp-2">{nc.descripcion}</p>
                      
                      <div className="text-xs text-slate-600 space-y-2 mt-auto">
                        <p><span className="font-medium">Fecha:</span> {nc.fecha_deteccion}</p>
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                          <p className="font-medium text-red-800 mb-1">Causa Raíz:</p>
                          <p className="italic">{nc.causa_raiz || 'Pendiente de análisis'}</p>
                        </div>
                        {nc.accion_correctiva && (
                          <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <p className="font-medium text-slate-700 mb-1">Acción Correctiva:</p>
                            <p>{nc.accion_correctiva}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.4 - No conformidades y acciones correctivas):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_no_conformidades}
                  onChange={(e) => setFormData({...formData, analisis_no_conformidades: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Analizar tendencias de fallos y eficacia de correcciones..."
                />
              </div>
            </div>

            {/* SECCIÓN 7: Auditorías */}
            <div className="card p-6 border-l-4 border-l-teal-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardList size={20} className="text-teal-500" />
                7. Resultados de auditorías
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-teal-50 rounded-lg p-4 mb-4 border border-teal-100">
                <h4 className="text-sm font-bold text-teal-800 mb-3">Historial de Auditorías:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {auditorias.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-lg border border-teal-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-800 text-sm">{a.tipo}</p>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded border border-teal-200 uppercase">
                          {a.estado_general}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-2 mt-auto">
                        <p><span className="font-medium">Fecha:</span> {a.fecha_auditoria}</p>
                        <p><span className="font-medium">Auditor Líder:</span> {a.auditor_lider}</p>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded">
                          <div className="text-center">
                            <span className="block text-[10px] text-slate-400">Hallazgos</span>
                            <span className={`font-bold ${
                              (a.hallazgos_totales || 0) > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>{a.hallazgos_totales || 0}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[10px] text-slate-400">Estado</span>
                            <span className={`font-bold text-[10px] uppercase ${
                              a.estado_general === 'satisfactorio' ? 'text-green-600' : 
                              a.estado_general === 'critico' ? 'text-red-600' : 
                              'text-amber-600'
                            }`}>{a.estado_general || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.6 - Resultados de auditorías):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_auditorias}
                  onChange={(e) => setFormData({...formData, analisis_auditorias: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Resumen de hallazgos de auditorías internas y externas..."
                />
              </div>
            </div>

            {/* SECCIÓN 8: Proveedores */}
            <div className="card p-6 border-l-4 border-l-orange-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Truck size={20} className="text-orange-500" />
                8. Desempeño de proveedores externos
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4 border border-orange-100">
                <h4 className="text-sm font-bold text-orange-800 mb-3">Evaluación de Proveedores:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {proveedores.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{p.nombre_proveedor}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                          p.estado === 'aprobado' ? 'bg-green-100 text-green-700 border-green-200' : 
                          p.estado === 'condicional' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-2 mt-auto">
                        <p><span className="font-medium">Categoría:</span> {p.categoria}</p>
                        <p><span className="font-medium">Última Eval:</span> {p.fecha_evaluacion}</p>
                        <div className="bg-slate-50 p-2 rounded flex justify-between items-center">
                          <span className="font-medium">Calificación:</span>
                          <span className={`font-bold ${
                            (p.calificacion_actual || 0) >= 80 ? 'text-green-600' :
                            (p.calificacion_actual || 0) >= 60 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>{p.calificacion_actual || '-'}</span>
                        </div>
                        {/* Visual Bar for Score */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              (p.calificacion_actual || 0) >= 80 ? 'bg-green-500' :
                              (p.calificacion_actual || 0) >= 60 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(p.calificacion_actual || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.c.7 - Desempeño de proveedores externos):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_proveedores}
                  onChange={(e) => setFormData({...formData, analisis_proveedores: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Evaluar calidad y cumplimiento de proveedores..."
                />
              </div>
            </div>

            {/* SECCIÓN 9: Recursos */}
            <div className="card p-6 border-l-4 border-l-lime-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Box size={20} className="text-lime-600" />
                9. Adecuación de los recursos
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-lime-50 rounded-lg p-4 mb-4 border border-lime-100">
                <h4 className="text-sm font-bold text-lime-800 mb-3">Estado de Recursos:</h4>
                {recursos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {recursos.map(r => (
                      <div key={r.id} className="bg-white p-4 rounded-lg border border-lime-200 shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800 text-sm">{r.tipo_recurso}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                            ['adecuado', 'disponible'].includes(r.estado_actual) ? 'bg-green-100 text-green-700 border-green-200' :
                            r.estado_actual === 'requiere_actualizacion' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {r.estado_actual}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mb-2">{r.nombre_recurso}</p>
                        <div className="text-xs text-slate-600 space-y-2 mt-auto">
                          {r.descripcion_necesidad ? (
                            <div className="bg-lime-50 p-2 rounded border border-lime-100">
                              <p className="font-medium text-lime-800 mb-1">Necesidad:</p>
                              <p>{r.descripcion_necesidad}</p>
                            </div>
                          ) : (
                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                              <p className="font-medium text-slate-600">Uso: {r.porcentaje_uso ? `${r.porcentaje_uso}%` : 'N/A'}</p>
                            </div>
                          )}
                          {r.impacto_no_disponibilidad && <p><span className="font-medium">Impacto:</span> {r.impacto_no_disponibilidad}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-lime-700 italic">No hay información de recursos disponible.</p>
                )}
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.d - Adecuación de los recursos):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_recursos}
                  onChange={(e) => setFormData({...formData, analisis_recursos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Evaluar si los recursos (humanos, infraestructura) son suficientes..."
                />
              </div>
            </div>

            {/* SECCIÓN 10: Riesgos y Oportunidades */}
            <div className="card p-6 border-l-4 border-l-fuchsia-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-fuchsia-500" />
                10. Eficacia de acciones para abordar riesgos
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-fuchsia-50 rounded-lg p-4 mb-4 border border-fuchsia-100">
                <h4 className="text-sm font-bold text-fuchsia-800 mb-3">Matriz de Riesgos (Top 5):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {riesgos.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-lg border border-fuchsia-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm line-clamp-2">{r.descripcion}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border shrink-0 ml-2 ${
                          r.nivel_riesgo >= 15 ? 'bg-red-100 text-red-700 border-red-200' : 
                          r.nivel_riesgo >= 8 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          Nivel: {r.nivel_riesgo}
                        </span>
                      </div>
                      
                      {/* Visual Risk Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                        <div 
                          className={`h-1.5 rounded-full ${
                            r.nivel_riesgo >= 15 ? 'bg-red-500' : 
                            r.nivel_riesgo >= 8 ? 'bg-amber-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((r.nivel_riesgo / 25) * 100, 100)}%` }}
                        ></div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-2 mt-auto">
                        <div className="flex justify-between">
                          <span className="font-medium">Estado:</span> 
                          <span className={`font-bold uppercase ${
                            r.estado === 'cerrado' ? 'text-green-600' : 
                            r.estado === 'mitigado' ? 'text-blue-600' :
                            'text-amber-600'
                          }`}>{r.estado}</span>
                        </div>
                        <div className="bg-fuchsia-50 p-2 rounded border border-fuchsia-100">
                          <p className="font-medium text-fuchsia-800 mb-1">Acciones Planificadas:</p>
                          <p className="italic">{r.acciones_planificadas || r.acciones_mitigacion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.e - Eficacia de acciones para abordar riesgos):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_riesgos}
                  onChange={(e) => setFormData({...formData, analisis_riesgos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Evaluar si las acciones para mitigar riesgos han sido efectivas..."
                />
              </div>
            </div>

            {/* SECCIÓN 11: Mejoras */}
            <div className="card p-6 border-l-4 border-l-yellow-500">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                11. Oportunidades de mejora
              </h3>
              
              {/* Contexto / Datos Detallados */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-100">
                <h4 className="text-sm font-bold text-yellow-800 mb-3">Oportunidades Identificadas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {mejoras.map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-800 text-sm">{m.titulo}</p>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${
                          ['implementada', 'aprobada'].includes(m.estado) ? 'bg-green-100 text-green-700 border-green-200' :
                          ['identificada', 'en_analisis'].includes(m.estado) ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {m.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{m.descripcion_mejora_propuesta || m.descripcion}</p>
                      <div className="text-xs text-slate-600 mt-auto bg-yellow-50 p-2 rounded border border-yellow-100">
                        <p className="font-medium text-yellow-800 mb-1">Beneficio Esperado:</p>
                        <p className="italic">{m.beneficios_esperados || m.beneficio_esperado}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input de Análisis */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Análisis y Evaluación (9.3.2.f - Oportunidades de mejora):
                </label>
                <textarea
                  rows={3}
                  value={formData.analisis_mejoras}
                  onChange={(e) => setFormData({...formData, analisis_mejoras: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Identificar nuevas oportunidades de mejora..."
                />
              </div>
            </div>
          </>
        )}

        {/* Salidas */}
        {activeTab === 'salidas' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-slate-800 mb-4">Conclusiones y Decisiones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Conveniencia del SGC</label>
                  <select
                    value={formData.conveniencia_sgc}
                    onChange={(e) => setFormData({...formData, conveniencia_sgc: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option>Conveniente</option>
                    <option>Requiere Ajustes</option>
                    <option>No Conveniente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adecuación del SGC</label>
                  <select
                    value={formData.adecuacion_sgc}
                    onChange={(e) => setFormData({...formData, adecuacion_sgc: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option>Adecuado</option>
                    <option>Parcialmente Adecuado</option>
                    <option>Inadecuado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Eficacia del SGC</label>
                  <select
                    value={formData.eficacia_sgc}
                    onChange={(e) => setFormData({...formData, eficacia_sgc: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option>Eficaz</option>
                    <option>Parcialmente Eficaz</option>
                    <option>Ineficaz</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Oportunidades de Mejora Identificadas
                  </label>
                  <textarea
                    rows={3}
                    value={formData.decisiones_mejora}
                    onChange={(e) => setFormData({...formData, decisiones_mejora: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Listar mejoras a implementar..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Necesidad de Cambios en el SGC
                  </label>
                  <textarea
                    rows={3}
                    value={formData.decisiones_cambios_sgc}
                    onChange={(e) => setFormData({...formData, decisiones_cambios_sgc: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Cambios en políticas, objetivos, procesos..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Necesidades de Recursos
                  </label>
                  <textarea
                    rows={3}
                    value={formData.decisiones_recursos}
                    onChange={(e) => setFormData({...formData, decisiones_recursos: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Personal, infraestructura, presupuesto..."
                  />
                </div>

                {/* Sección de Compromisos */}
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckSquare size={20} className="text-blue-600" />
                    Compromisos y Acuerdos
                  </h4>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Descripción del Compromiso</label>
                        <input
                          type="text"
                          value={nuevoCompromiso.descripcion}
                          onChange={(e) => setNuevoCompromiso({...nuevoCompromiso, descripcion: e.target.value})}
                          className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                          placeholder="Acción a realizar..."
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Responsable</label>
                        <input
                          type="text"
                          value={nuevoCompromiso.responsable}
                          onChange={(e) => setNuevoCompromiso({...nuevoCompromiso, responsable: e.target.value})}
                          className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                          placeholder="Nombre / Cargo"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Fecha Límite</label>
                        <input
                          type="date"
                          value={nuevoCompromiso.fecha_limite}
                          onChange={(e) => setNuevoCompromiso({...nuevoCompromiso, fecha_limite: e.target.value})}
                          className="w-full px-3 py-2 rounded border border-slate-300 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!nuevoCompromiso.descripcion || !nuevoCompromiso.responsable) return;
                            setNuevosCompromisos([...nuevosCompromisos, { ...nuevoCompromiso, id: Date.now() }]);
                            setNuevoCompromiso({ descripcion: '', responsable: '', fecha_limite: '', prioridad: 'media' });
                          }}
                          className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Compromisos */}
                  {nuevosCompromisos.length > 0 ? (
                    <div className="space-y-2">
                      {nuevosCompromisos.map((comp) => (
                        <div key={comp.id} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 shadow-sm">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 text-sm">{comp.descripcion}</p>
                            <div className="flex gap-4 text-xs text-slate-500 mt-1">
                              <span><span className="font-medium">Resp:</span> {comp.responsable}</span>
                              {comp.fecha_limite && <span><span className="font-medium">Vence:</span> {comp.fecha_limite}</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNuevosCompromisos(nuevosCompromisos.filter(c => c.id !== comp.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No se han agregado compromisos aún.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
