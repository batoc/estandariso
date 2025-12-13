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
    objetivo: '',
    area_responsable: '',
    responsable: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_meta: '',
    estado: 'activo',
    indicador_medicion: '',
    valor_inicial: 0,
    valor_actual: 0,
    valor_meta: 0,
    unidad_medida: '%',
    porcentaje_avance: 0,
    ultimo_seguimiento: '',
    observaciones: '',
    riesgos_identificados: '',
    acciones_mitigacion: ''
  });

  useEffect(() => {
    fetchObjetivos();
  }, []);

  const fetchObjetivos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('objetivos_calidad')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setObjetivos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular porcentaje de avance automáticamente
    let avance = 0;
    if (formData.valor_meta !== formData.valor_inicial) {
      avance = ((formData.valor_actual - formData.valor_inicial) / (formData.valor_meta - formData.valor_inicial)) * 100;
    }
    
    const dataToSave = {
      ...formData,
      valor_inicial: Number(formData.valor_inicial),
      valor_actual: Number(formData.valor_actual),
      valor_meta: Number(formData.valor_meta),
      porcentaje_avance: Math.min(Math.max(avance, 0), 100) // Clamp entre 0 y 100
    };

    if (editingId) {
      const { error } = await supabase
        .from('objetivos_calidad')
        .update(dataToSave)
        .eq('id', editingId);
      
      if (!error) {
        fetchObjetivos();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('objetivos_calidad')
        .insert([dataToSave]);
      
      if (!error) {
        fetchObjetivos();
        resetForm();
      }
    }
  };

  const handleEdit = (objetivo: any) => {
    setEditingId(objetivo.id);
    setFormData({
      periodo: objetivo.periodo || new Date().getFullYear().toString(),
      objetivo: objetivo.objetivo || '',
      area_responsable: objetivo.area_responsable || '',
      responsable: objetivo.responsable || '',
      fecha_inicio: objetivo.fecha_inicio || new Date().toISOString().split('T')[0],
      fecha_meta: objetivo.fecha_meta || '',
      estado: objetivo.estado || 'activo',
      indicador_medicion: objetivo.indicador_medicion || '',
      valor_inicial: objetivo.valor_inicial || 0,
      valor_actual: objetivo.valor_actual || 0,
      valor_meta: objetivo.valor_meta || 0,
      unidad_medida: objetivo.unidad_medida || '%',
      porcentaje_avance: objetivo.porcentaje_avance || 0,
      ultimo_seguimiento: objetivo.ultimo_seguimiento || '',
      observaciones: objetivo.observaciones || '',
      riesgos_identificados: objetivo.riesgos_identificados || '',
      acciones_mitigacion: objetivo.acciones_mitigacion || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar objetivo?')) {
      const { error } = await supabase.from('objetivos_calidad').delete().eq('id', id);
      if (!error) fetchObjetivos();
    }
  };

  const resetForm = () => {
    setFormData({
      periodo: new Date().getFullYear().toString(),
      objetivo: '',
      area_responsable: '',
      responsable: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_meta: '',
      estado: 'activo',
      indicador_medicion: '',
      valor_inicial: 0,
      valor_actual: 0,
      valor_meta: 0,
      unidad_medida: '%',
      porcentaje_avance: 0,
      ultimo_seguimiento: '',
      observaciones: '',
      riesgos_identificados: '',
      acciones_mitigacion: ''
    });
    setEditingId(null);
    setShowForm(false);
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
          <p className="text-slate-500 ml-7">Planificación y seguimiento de objetivos (6.2)</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm font-medium text-slate-500">Completados</p>
              <p className="text-2xl font-bold text-slate-800">
                {objetivos.filter(o => o.estado === 'completado').length}
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
                {objetivos.filter(o => o.estado === 'retrasado').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="text-amber-600" size={24} />
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Objetivo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Meta</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avance</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {objetivos.map((objetivo) => (
                  <tr key={objetivo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{objetivo.objetivo}</span>
                        <span className="text-xs text-slate-500">{objetivo.periodo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{objetivo.responsable}</span>
                        <span className="text-xs text-slate-500">{objetivo.area_responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-700">
                        {objetivo.valor_meta} {objetivo.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              objetivo.porcentaje_avance >= 100 ? 'bg-emerald-500' :
                              objetivo.porcentaje_avance >= 70 ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(objetivo.porcentaje_avance, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{Math.round(objetivo.porcentaje_avance)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        objetivo.estado === 'completado' ? 'bg-emerald-100 text-emerald-700' :
                        objetivo.estado === 'activo' ? 'bg-blue-100 text-blue-700' :
                        objetivo.estado === 'retrasado' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {objetivo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(objetivo)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(objetivo.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
                  <input
                    type="text"
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área Responsable</label>
                  <input
                    type="text"
                    value={formData.area_responsable}
                    onChange={(e) => setFormData({...formData, area_responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
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

              <div className="grid grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Indicador de Medición</label>
                  <input
                    type="text"
                    value={formData.indicador_medicion}
                    onChange={(e) => setFormData({...formData, indicador_medicion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Inicial</label>
                  <input
                    type="number"
                    value={formData.valor_inicial}
                    onChange={(e) => setFormData({...formData, valor_inicial: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Actual</label>
                  <input
                    type="number"
                    value={formData.valor_actual}
                    onChange={(e) => setFormData({...formData, valor_actual: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Meta</label>
                  <input
                    type="number"
                    value={formData.valor_meta}
                    onChange={(e) => setFormData({...formData, valor_meta: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="activo">Activo</option>
                    <option value="completado">Completado</option>
                    <option value="retrasado">Retrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Último Seguimiento</label>
                  <input
                    type="date"
                    value={formData.ultimo_seguimiento}
                    onChange={(e) => setFormData({...formData, ultimo_seguimiento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Riesgos Identificados</label>
                <textarea
                  value={formData.riesgos_identificados}
                  onChange={(e) => setFormData({...formData, riesgos_identificados: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones de Mitigación</label>
                <textarea
                  value={formData.acciones_mitigacion}
                  onChange={(e) => setFormData({...formData, acciones_mitigacion: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={2}
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
