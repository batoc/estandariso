'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Target,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  BarChart2,
  AlertTriangle,
  Activity
} from 'lucide-react';

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    periodo: new Date().getFullYear().toString(),
    codigo_objetivo: '',
    objetivo: '',
    alineacion_estrategica: '',
    proceso_relacionado: '',
    area_responsable: '',
    responsable: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_meta: '',
    indicador_medicion: '',
    frecuencia_medicion: 'mensual',
    valor_inicial: 0,
    valor_actual: 0,
    valor_meta: 0,
    unidad_medida: '%',
    porcentaje_avance: 0,
    estado: 'activo',
    tendencia: 'estable',
    observaciones: ''
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('objetivos_calidad').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setObjetivos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Calcular porcentaje de avance automáticamente
      const avance = formData.valor_meta !== 0 
        ? ((formData.valor_actual - formData.valor_inicial) / (formData.valor_meta - formData.valor_inicial)) * 100
        : 0;
      
      const dataToSave = {
        ...formData,
        porcentaje_avance: Math.min(Math.max(avance, 0), 100) // Clamp entre 0 y 100
      };

      if (editingId) {
        const { error } = await supabase.from('objetivos_calidad').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('objetivos_calidad').insert([dataToSave]);
        if (error) throw error;
      }
      await cargar();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar objetivo?')) return;
    try {
      const { error } = await supabase.from('objetivos_calidad').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(obj: any) {
    setFormData({
      periodo: obj.periodo,
      codigo_objetivo: obj.codigo_objetivo || '',
      objetivo: obj.objetivo,
      alineacion_estrategica: obj.alineacion_estrategica || '',
      proceso_relacionado: obj.proceso_relacionado || '',
      area_responsable: obj.area_responsable || '',
      responsable: obj.responsable || '',
      fecha_inicio: obj.fecha_inicio,
      fecha_meta: obj.fecha_meta || '',
      indicador_medicion: obj.indicador_medicion || '',
      frecuencia_medicion: obj.frecuencia_medicion || 'mensual',
      valor_inicial: obj.valor_inicial || 0,
      valor_actual: obj.valor_actual || 0,
      valor_meta: obj.valor_meta || 0,
      unidad_medida: obj.unidad_medida || '%',
      porcentaje_avance: obj.porcentaje_avance || 0,
      estado: obj.estado || 'activo',
      tendencia: obj.tendencia || 'estable',
      observaciones: obj.observaciones || ''
    });
    setEditingId(obj.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      periodo: new Date().getFullYear().toString(),
      codigo_objetivo: '',
      objetivo: '',
      alineacion_estrategica: '',
      proceso_relacionado: '',
      area_responsable: '',
      responsable: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_meta: '',
      indicador_medicion: '',
      frecuencia_medicion: 'mensual',
      valor_inicial: 0,
      valor_actual: 0,
      valor_meta: 0,
      unidad_medida: '%',
      porcentaje_avance: 0,
      estado: 'activo',
      tendencia: 'estable',
      observaciones: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'alcanzado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'activo': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'riesgo': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'critico': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'mejora': return <TrendingUp size={16} className="text-emerald-500" />;
      case 'empeora': return <TrendingUp size={16} className="text-red-500 rotate-180" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Objetivos de Calidad</h1>
          </div>
          <p className="text-slate-500 ml-7">Seguimiento de metas estratégicas y operativas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Objetivo
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Objetivos</p>
              <p className="text-2xl font-bold text-slate-800">{objetivos.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alcanzados</p>
              <p className="text-2xl font-bold text-slate-800">
                {objetivos.filter(o => o.estado === 'alcanzado').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Riesgo</p>
              <p className="text-2xl font-bold text-slate-800">
                {objetivos.filter(o => o.estado === 'riesgo').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avance Promedio</p>
              <p className="text-2xl font-bold text-slate-800">
                {objetivos.length > 0 
                  ? Math.round(objetivos.reduce((acc, curr) => acc + (curr.porcentaje_avance || 0), 0) / objetivos.length) 
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart2 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Listado de Objetivos</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar objetivo..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando objetivos...
            </div>
          </div>
        ) : objetivos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay objetivos registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {objetivos.map((obj) => (
              <div key={obj.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(obj.estado)} uppercase`}>
                        {obj.estado}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {obj.periodo}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{obj.objetivo}</h4>
                  </div>
                  <div className="ml-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {getTendenciaIcon(obj.tendencia)}
                  </div>
                </div>

                <div className="space-y-4 mb-4 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Progreso</span>
                      <span className="font-bold text-slate-700">{Math.round(obj.porcentaje_avance)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${
                          obj.porcentaje_avance >= 100 ? 'bg-emerald-500' : 
                          obj.porcentaje_avance >= 70 ? 'bg-blue-500' : 
                          obj.porcentaje_avance >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(obj.porcentaje_avance, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-slate-400 mb-1">Inicial</p>
                      <p className="font-bold text-slate-700">{obj.valor_inicial} {obj.unidad_medida}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-blue-400 mb-1">Actual</p>
                      <p className="font-bold text-blue-700">{obj.valor_actual} {obj.unidad_medida}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <p className="text-emerald-400 mb-1">Meta</p>
                      <p className="font-bold text-emerald-700">{obj.valor_meta} {obj.unidad_medida}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {obj.responsable || 'Sin asignar'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Meta: {obj.fecha_meta || 'N/A'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(obj)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(obj.id)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Objetivo' : 'Nuevo Objetivo'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo *</label>
                  <input
                    type="text"
                    required
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Descripción del objetivo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo_objetivo}
                    onChange={(e) => setFormData({...formData, codigo_objetivo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. OBJ-2024-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
                  <input
                    type="text"
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Meta</label>
                  <input
                    type="date"
                    value={formData.fecha_meta}
                    onChange={(e) => setFormData({...formData, fecha_meta: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alineación Estratégica</label>
                  <input
                    type="text"
                    value={formData.alineacion_estrategica}
                    onChange={(e) => setFormData({...formData, alineacion_estrategica: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Relacionado</label>
                  <input
                    type="text"
                    value={formData.proceso_relacionado}
                    onChange={(e) => setFormData({...formData, proceso_relacionado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Inicial</label>
                  <input
                    type="number"
                    value={formData.valor_inicial}
                    onChange={(e) => setFormData({...formData, valor_inicial: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Actual</label>
                  <input
                    type="number"
                    value={formData.valor_actual}
                    onChange={(e) => setFormData({...formData, valor_actual: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Valor Meta</label>
                  <input
                    type="number"
                    value={formData.valor_meta}
                    onChange={(e) => setFormData({...formData, valor_meta: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unidad</label>
                  <input
                    type="text"
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="activo">Activo</option>
                    <option value="alcanzado">Alcanzado</option>
                    <option value="riesgo">En Riesgo</option>
                    <option value="critico">Crítico</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tendencia</label>
                  <select
                    value={formData.tendencia}
                    onChange={(e) => setFormData({...formData, tendencia: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="estable">Estable</option>
                    <option value="mejora">Mejora</option>
                    <option value="empeora">Empeora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
