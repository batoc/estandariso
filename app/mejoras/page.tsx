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
  Rocket
} from 'lucide-react';

export default function MejorasPage() {
  const [mejoras, setMejoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    codigo_om: '',
    fecha_identificacion: new Date().toISOString().split('T')[0],
    origen: 'iniciativa_propia',
    titulo: '',
    descripcion_situacion_actual: '',
    descripcion_mejora_propuesta: '',
    proceso_afectado: '',
    area_responsable: '',
    beneficios_esperados: '',
    impacto_esperado: 'medio',
    prioridad: 'media',
    responsable_implementacion: '',
    estado: 'propuesta'
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('oportunidades_mejora').select('*').order('fecha_identificacion', { ascending: false });
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
      if (editingId) {
        const { error } = await supabase.from('oportunidades_mejora').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('oportunidades_mejora').insert([formData]);
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
    if (!confirm('¿Eliminar oportunidad de mejora?')) return;
    try {
      const { error } = await supabase.from('oportunidades_mejora').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(m: any) {
    setFormData({
      codigo_om: m.codigo_om || '',
      fecha_identificacion: m.fecha_identificacion,
      origen: m.origen || 'iniciativa_propia',
      titulo: m.titulo,
      descripcion_situacion_actual: m.descripcion_situacion_actual,
      descripcion_mejora_propuesta: m.descripcion_mejora_propuesta,
      proceso_afectado: m.proceso_afectado || '',
      area_responsable: m.area_responsable || '',
      beneficios_esperados: m.beneficios_esperados || '',
      impacto_esperado: m.impacto_esperado || 'medio',
      prioridad: m.prioridad || 'media',
      responsable_implementacion: m.responsable_implementacion || '',
      estado: m.estado
    });
    setEditingId(m.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      codigo_om: '',
      fecha_identificacion: new Date().toISOString().split('T')[0],
      origen: 'iniciativa_propia',
      titulo: '',
      descripcion_situacion_actual: '',
      descripcion_mejora_propuesta: '',
      proceso_afectado: '',
      area_responsable: '',
      beneficios_esperados: '',
      impacto_esperado: 'medio',
      prioridad: 'media',
      responsable_implementacion: '',
      estado: 'propuesta'
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'medio': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'implementada': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'en_proceso': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'propuesta': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Oportunidades de Mejora</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de iniciativas para la mejora continua</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Oportunidad
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Iniciativas</p>
              <p className="text-2xl font-bold text-slate-800">{mejoras.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Lightbulb className="text-blue-600" size={24} />
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
              <Rocket className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alto Impacto</p>
              <p className="text-2xl font-bold text-slate-800">
                {mejoras.filter(m => m.impacto_esperado === 'alto').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Zap className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Proceso</p>
              <p className="text-2xl font-bold text-slate-800">
                {mejoras.filter(m => m.estado === 'en_proceso').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Listado de Oportunidades</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar oportunidad..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando oportunidades...
            </div>
          </div>
        ) : mejoras.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay oportunidades registradas
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {mejoras.map((mejora) => (
              <div key={mejora.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getImpactoColor(mejora.impacto_esperado)} uppercase`}>
                        Impacto {mejora.impacto_esperado}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(mejora.estado)} uppercase`}>
                        {mejora.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{mejora.titulo}</h4>
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">Situación Actual</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{mejora.descripcion_situacion_actual}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-600 mb-1">Propuesta</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{mejora.descripcion_mejora_propuesta}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {mejora.responsable_implementacion || 'Sin asignar'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {mejora.fecha_identificacion}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(mejora)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(mejora.id)}
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
                {editingId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Título breve de la mejora"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código OM</label>
                  <input
                    type="text"
                    value={formData.codigo_om}
                    onChange={(e) => setFormData({...formData, codigo_om: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. OM-2024-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                  <select
                    value={formData.origen}
                    onChange={(e) => setFormData({...formData, origen: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="iniciativa_propia">Iniciativa Propia</option>
                    <option value="auditoria">Auditoría</option>
                    <option value="revision_direccion">Revisión Dirección</option>
                    <option value="queja_cliente">Queja Cliente</option>
                    <option value="analisis_datos">Análisis de Datos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Identificación *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_identificacion}
                    onChange={(e) => setFormData({...formData, fecha_identificacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Situación Actual *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion_situacion_actual}
                    onChange={(e) => setFormData({...formData, descripcion_situacion_actual: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Descripción del problema o situación..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mejora Propuesta *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion_mejora_propuesta}
                    onChange={(e) => setFormData({...formData, descripcion_mejora_propuesta: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Descripción de la solución..."
                  />
                </div>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área Responsable</label>
                  <input
                    type="text"
                    value={formData.area_responsable}
                    onChange={(e) => setFormData({...formData, area_responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beneficios Esperados</label>
                <textarea
                  rows={2}
                  value={formData.beneficios_esperados}
                  onChange={(e) => setFormData({...formData, beneficios_esperados: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Resultados esperados..."
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impacto Esperado</label>
                  <select
                    value={formData.impacto_esperado}
                    onChange={(e) => setFormData({...formData, impacto_esperado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="propuesta">Propuesta</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="implementada">Implementada</option>
                    <option value="verificada">Verificada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsable Implementación</label>
                <input
                  type="text"
                  value={formData.responsable_implementacion}
                  onChange={(e) => setFormData({...formData, responsable_implementacion: e.target.value})}
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
