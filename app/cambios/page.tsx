'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  GitPullRequest,
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
  Globe,
  Building2,
  AlertTriangle
} from 'lucide-react';

export default function GestionCambiosPage() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const [formData, setFormData] = useState({
    fecha_identificacion: new Date().toISOString().split('T')[0],
    tipo_cambio: 'externo',
    categoria: '',
    descripcion_cambio: '',
    origen: '',
    impacto_sgc: 'medio',
    procesos_afectados: '',
    analisis_impacto: '',
    acciones_requeridas: '',
    responsable: '',
    fecha_implementacion: '',
    estado: 'identificado',
    observaciones: ''
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('gestion_cambios').select('*').order('fecha_identificacion', { ascending: false });
      if (error) throw error;
      setCambios(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Convertir procesos_afectados a array si es string
      const dataToSave = {
        ...formData,
        procesos_afectados: Array.isArray(formData.procesos_afectados) 
          ? formData.procesos_afectados 
          : formData.procesos_afectados.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      if (editingId) {
        const { error } = await supabase.from('gestion_cambios').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gestion_cambios').insert([dataToSave]);
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
    if (!confirm('¿Eliminar registro de cambio?')) return;
    try {
      const { error } = await supabase.from('gestion_cambios').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(c: any) {
    setFormData({
      fecha_identificacion: c.fecha_identificacion,
      tipo_cambio: c.tipo_cambio,
      categoria: c.categoria || '',
      descripcion_cambio: c.descripcion_cambio,
      origen: c.origen || '',
      impacto_sgc: c.impacto_sgc || 'medio',
      procesos_afectados: Array.isArray(c.procesos_afectados) ? c.procesos_afectados.join(', ') : (c.procesos_afectados || ''),
      analisis_impacto: c.analisis_impacto || '',
      acciones_requeridas: c.acciones_requeridas || '',
      responsable: c.responsable || '',
      fecha_implementacion: c.fecha_implementacion || '',
      estado: c.estado || 'identificado',
      observaciones: c.observaciones || ''
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      fecha_identificacion: new Date().toISOString().split('T')[0],
      tipo_cambio: 'externo',
      categoria: '',
      descripcion_cambio: '',
      origen: '',
      impacto_sgc: 'medio',
      procesos_afectados: '',
      analisis_impacto: '',
      acciones_requeridas: '',
      responsable: '',
      fecha_implementacion: '',
      estado: 'identificado',
      observaciones: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-red-600 bg-red-50 border-red-100';
      case 'medio': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'bajo': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredCambios = filtroTipo === 'todos' ? cambios : cambios.filter(c => c.tipo_cambio === filtroTipo);

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Cambios</h1>
          </div>
          <p className="text-slate-500 ml-7">Control de cambios internos y externos en el SGC</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cambio
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Cambios</p>
              <p className="text-2xl font-bold text-slate-800">{cambios.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <GitPullRequest className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Externos</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.tipo_cambio === 'externo').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Globe className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Internos</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.tipo_cambio === 'interno').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Building2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alto Impacto</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.impacto_sgc === 'alto').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800">Registro de Cambios</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('externo')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'externo' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Externos
              </button>
              <button
                onClick={() => setFiltroTipo('interno')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'interno' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Internos
              </button>
            </div>
          </div>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cambio..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando cambios...
            </div>
          </div>
        ) : filteredCambios.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay cambios registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCambios.map((cambio) => (
              <div key={cambio.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border uppercase ${
                        cambio.tipo_cambio === 'externo' ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      }`}>
                        {cambio.tipo_cambio}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getImpactoColor(cambio.impacto_sgc)} uppercase`}>
                        Impacto {cambio.impacto_sgc}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{cambio.descripcion_cambio}</h4>
                  </div>
                  <div className="ml-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {cambio.tipo_cambio === 'externo' ? <Globe size={20} className="text-purple-500" /> : <Building2 size={20} className="text-emerald-500" />}
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">Análisis de Impacto</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{cambio.analisis_impacto}</p>
                  </div>
                  
                  {cambio.acciones_requeridas && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-600 mb-1">Acciones Requeridas</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{cambio.acciones_requeridas}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {cambio.responsable || 'Sin asignar'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {cambio.fecha_identificacion}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cambio)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cambio.id)}
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
                {editingId ? 'Editar Cambio' : 'Nuevo Cambio'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cambio *</label>
                  <select
                    value={formData.tipo_cambio}
                    onChange={(e) => setFormData({...formData, tipo_cambio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="externo">Externo (Legal, Mercado, etc.)</option>
                    <option value="interno">Interno (Procesos, Estructura, etc.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Identificación</label>
                  <input
                    type="date"
                    value={formData.fecha_identificacion}
                    onChange={(e) => setFormData({...formData, fecha_identificacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Cambio *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.descripcion_cambio}
                  onChange={(e) => setFormData({...formData, descripcion_cambio: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="¿Qué está cambiando?"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origen / Fuente</label>
                  <input
                    type="text"
                    value={formData.origen}
                    onChange={(e) => setFormData({...formData, origen: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Nueva Ley, Auditoría, Revisión"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impacto en SGC</label>
                  <select
                    value={formData.impacto_sgc}
                    onChange={(e) => setFormData({...formData, impacto_sgc: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Análisis de Impacto</label>
                <textarea
                  rows={3}
                  value={formData.analisis_impacto}
                  onChange={(e) => setFormData({...formData, analisis_impacto: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Consecuencias potenciales del cambio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Requeridas</label>
                <textarea
                  rows={3}
                  value={formData.acciones_requeridas}
                  onChange={(e) => setFormData({...formData, acciones_requeridas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Pasos para implementar el cambio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Procesos Afectados</label>
                  <input
                    type="text"
                    value={formData.procesos_afectados}
                    onChange={(e) => setFormData({...formData, procesos_afectados: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Separados por coma"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Implementación</label>
                  <input
                    type="date"
                    value={formData.fecha_implementacion}
                    onChange={(e) => setFormData({...formData, fecha_implementacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="identificado">Identificado</option>
                    <option value="en_analisis">En Análisis</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="en_implementacion">En Implementación</option>
                    <option value="verificado">Verificado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
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
