'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Lightbulb,
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
  Target,
  Zap,
  Rocket,
  DollarSign,
  FileText
} from 'lucide-react';

export default function MejorasPage() {
  const [mejoras, setMejoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fecha_identificacion: new Date().toISOString().split('T')[0],
    titulo: '',
    descripcion_situacion_actual: '',
    descripcion_mejora_propuesta: '',
    origen: 'iniciativa_propia',
    proceso_afectado: '',
    beneficios_esperados: '',
    prioridad: 'media',
    estado: 'propuesta',
    responsable_implementacion: '',
    plan_implementacion: '',
    fecha_inicio_prevista: '',
    fecha_fin_prevista: '',
    recursos_necesarios: '',
    costo_estimado: 0,
    resultados_obtenidos: '',
    eficaz: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const { data, error } = await supabase
        .from('oportunidades_mejora')
        .select('*')
        .order('fecha_identificacion', { ascending: false });

      if (error) throw error;
      setMejoras(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        costo_estimado: Number(formData.costo_estimado),
        fecha_inicio_prevista: formData.fecha_inicio_prevista || null,
        fecha_fin_prevista: formData.fecha_fin_prevista || null
      };

      if (editingId) {
        const { error } = await supabase.from('oportunidades_mejora').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('oportunidades_mejora').insert([dataToSave]);
        if (error) throw error;
      }
      
      cargarDatos();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la mejora');
    }
  }

  const handleEdit = (mejora: any) => {
    setEditingId(mejora.id);
    setFormData({
      fecha_identificacion: mejora.fecha_identificacion || new Date().toISOString().split('T')[0],
      titulo: mejora.titulo || '',
      descripcion_situacion_actual: mejora.descripcion_situacion_actual || '',
      descripcion_mejora_propuesta: mejora.descripcion_mejora_propuesta || '',
      origen: mejora.origen || 'iniciativa_propia',
      proceso_afectado: mejora.proceso_afectado || '',
      beneficios_esperados: mejora.beneficios_esperados || '',
      prioridad: mejora.prioridad || 'media',
      estado: mejora.estado || 'propuesta',
      responsable_implementacion: mejora.responsable_implementacion || '',
      plan_implementacion: mejora.plan_implementacion || '',
      fecha_inicio_prevista: mejora.fecha_inicio_prevista || '',
      fecha_fin_prevista: mejora.fecha_fin_prevista || '',
      recursos_necesarios: mejora.recursos_necesarios || '',
      costo_estimado: mejora.costo_estimado || 0,
      resultados_obtenidos: mejora.resultados_obtenidos || '',
      eficaz: mejora.eficaz || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta oportunidad de mejora?')) {
      const { error } = await supabase.from('oportunidades_mejora').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_identificacion: new Date().toISOString().split('T')[0],
      titulo: '',
      descripcion_situacion_actual: '',
      descripcion_mejora_propuesta: '',
      origen: 'iniciativa_propia',
      proceso_afectado: '',
      beneficios_esperados: '',
      prioridad: 'media',
      estado: 'propuesta',
      responsable_implementacion: '',
      plan_implementacion: '',
      fecha_inicio_prevista: '',
      fecha_fin_prevista: '',
      recursos_necesarios: '',
      costo_estimado: 0,
      resultados_obtenidos: '',
      eficaz: false
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
            <h1 className="text-2xl font-bold text-slate-800">Oportunidades de Mejora</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de la mejora continua (10.1, 10.3)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Mejora
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Mejoras</p>
              <p className="text-2xl font-bold text-slate-800">{mejoras.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Lightbulb className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Implementación</p>
              <p className="text-2xl font-bold text-slate-800">
                {mejoras.filter(m => m.estado === 'en_implementacion').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Rocket className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Implementadas</p>
              <p className="text-2xl font-bold text-slate-800">
                {mejoras.filter(m => m.estado === 'implementada').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Eficaces</p>
              <p className="text-2xl font-bold text-slate-800">
                {mejoras.filter(m => m.eficaz).length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Mejoras</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar mejora..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando mejoras...
            </div>
          </div>
        ) : mejoras.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay oportunidades de mejora registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Origen</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mejoras.map((mejora) => (
                  <tr key={mejora.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{mejora.fecha_identificacion}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{mejora.titulo}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{mejora.descripcion_mejora_propuesta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 capitalize">{mejora.origen?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        mejora.prioridad === 'critica' ? 'bg-red-100 text-red-700' :
                        mejora.prioridad === 'alta' ? 'bg-orange-100 text-orange-700' :
                        mejora.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {mejora.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        mejora.estado === 'implementada' ? 'bg-emerald-100 text-emerald-700' :
                        mejora.estado === 'en_implementacion' ? 'bg-blue-100 text-blue-700' :
                        mejora.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {mejora.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(mejora)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(mejora.id)}
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
                {editingId ? 'Editar Mejora' : 'Nueva Oportunidad de Mejora'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Identificación</label>
                  <input
                    type="date"
                    value={formData.fecha_identificacion}
                    onChange={(e) => setFormData({...formData, fecha_identificacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                  <select
                    value={formData.origen}
                    onChange={(e) => setFormData({...formData, origen: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="iniciativa_propia">Iniciativa Propia</option>
                    <option value="auditoria">Auditoría</option>
                    <option value="revision_direccion">Revisión por Dirección</option>
                    <option value="sugerencia_personal">Sugerencia Personal</option>
                    <option value="cliente">Cliente</option>
                    <option value="benchmarking">Benchmarking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Situación Actual</label>
                <textarea
                  value={formData.descripcion_situacion_actual}
                  onChange={(e) => setFormData({...formData, descripcion_situacion_actual: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mejora Propuesta</label>
                <textarea
                  value={formData.descripcion_mejora_propuesta}
                  onChange={(e) => setFormData({...formData, descripcion_mejora_propuesta: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Afectado</label>
                  <input
                    type="text"
                    value={formData.proceso_afectado}
                    onChange={(e) => setFormData({...formData, proceso_afectado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beneficios Esperados</label>
                <textarea
                  value={formData.beneficios_esperados}
                  onChange={(e) => setFormData({...formData, beneficios_esperados: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable Implementación</label>
                  <input
                    type="text"
                    value={formData.responsable_implementacion}
                    onChange={(e) => setFormData({...formData, responsable_implementacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Costo Estimado</label>
                  <input
                    type="number"
                    value={formData.costo_estimado}
                    onChange={(e) => setFormData({...formData, costo_estimado: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Implementación</label>
                <textarea
                  value={formData.plan_implementacion}
                  onChange={(e) => setFormData({...formData, plan_implementacion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio Prevista</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio_prevista}
                    onChange={(e) => setFormData({...formData, fecha_inicio_prevista: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin Prevista</label>
                  <input
                    type="date"
                    value={formData.fecha_fin_prevista}
                    onChange={(e) => setFormData({...formData, fecha_fin_prevista: e.target.value})}
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
                    <option value="propuesta">Propuesta</option>
                    <option value="en_evaluacion">En Evaluación</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                    <option value="en_implementacion">En Implementación</option>
                    <option value="implementada">Implementada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.eficaz}
                      onChange={(e) => setFormData({...formData, eficaz: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">¿Fue eficaz?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resultados Obtenidos</label>
                <textarea
                  value={formData.resultados_obtenidos}
                  onChange={(e) => setFormData({...formData, resultados_obtenidos: e.target.value})}
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
