'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Monitor,
  DollarSign,
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
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export default function RecursosPage() {
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    tipo_recurso: 'humano',
    nombre_recurso: '',
    codigo_recurso: '',
    area_asignada: '',
    estado_actual: 'adecuado',
    justificacion: '',
    necesidad_adicional: false,
    tipo_necesidad: '',
    descripcion_necesidad: '',
    prioridad: 'media',
    costo_estimado: 0,
    estado_solicitud: 'identificado'
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('recursos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRecursos(data || []);
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
        const { error } = await supabase.from('recursos').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recursos').insert([formData]);
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
    if (!confirm('¿Eliminar recurso?')) return;
    try {
      const { error } = await supabase.from('recursos').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(r: any) {
    setFormData({
      tipo_recurso: r.tipo_recurso,
      nombre_recurso: r.nombre_recurso,
      codigo_recurso: r.codigo_recurso || '',
      area_asignada: r.area_asignada || '',
      estado_actual: r.estado_actual || 'adecuado',
      justificacion: r.justificacion,
      necesidad_adicional: r.necesidad_adicional || false,
      tipo_necesidad: r.tipo_necesidad || '',
      descripcion_necesidad: r.descripcion_necesidad || '',
      prioridad: r.prioridad || 'media',
      costo_estimado: r.costo_estimado || 0,
      estado_solicitud: r.estado_solicitud || 'identificado'
    });
    setEditingId(r.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      tipo_recurso: 'humano',
      nombre_recurso: '',
      codigo_recurso: '',
      area_asignada: '',
      estado_actual: 'adecuado',
      justificacion: '',
      necesidad_adicional: false,
      tipo_necesidad: '',
      descripcion_necesidad: '',
      prioridad: 'media',
      costo_estimado: 0,
      estado_solicitud: 'identificado'
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'humano': return <Users size={20} className="text-blue-600" />;
      case 'infraestructura': return <HardDrive size={20} className="text-slate-600" />;
      case 'tecnologico': return <Monitor size={20} className="text-purple-600" />;
      case 'financiero': return <DollarSign size={20} className="text-emerald-600" />;
      default: return <Briefcase size={20} className="text-slate-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'adecuado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'limitado': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'insuficiente': return 'text-red-600 bg-red-50 border-red-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Recursos</h1>
          </div>
          <p className="text-slate-500 ml-7">Administración de recursos humanos, infraestructura y financieros</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Recurso
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Recursos</p>
              <p className="text-2xl font-bold text-slate-800">{recursos.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Briefcase className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Humanos</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.tipo_recurso === 'humano').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Users className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tecnológicos</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.tipo_recurso === 'tecnologico').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Monitor className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Insuficientes</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.estado_actual === 'insuficiente').length}
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
          <h3 className="font-bold text-slate-800">Inventario de Recursos</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar recurso..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando recursos...
            </div>
          </div>
        ) : recursos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay recursos registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {recursos.map((recurso) => (
              <div key={recurso.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(recurso.estado_actual)} uppercase`}>
                        {recurso.estado_actual}
                      </span>
                      {recurso.codigo_recurso && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {recurso.codigo_recurso}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{recurso.nombre_recurso}</h4>
                  </div>
                  <div className="ml-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {getTipoIcon(recurso.tipo_recurso)}
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">Justificación</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{recurso.justificacion}</p>
                  </div>
                  
                  {recurso.necesidad_adicional && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <p className="text-xs font-medium text-amber-600">Necesidad Adicional</p>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{recurso.descripcion_necesidad}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {recurso.area_asignada || 'Sin asignar'}
                  </div>
                  {recurso.costo_estimado > 0 && (
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <DollarSign size={14} />
                      {recurso.costo_estimado.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(recurso)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(recurso.id)}
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
                {editingId ? 'Editar Recurso' : 'Nuevo Recurso'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Recurso *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_recurso}
                    onChange={(e) => setFormData({...formData, nombre_recurso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Personal de Calidad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo_recurso}
                    onChange={(e) => setFormData({...formData, codigo_recurso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. REC-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo_recurso}
                    onChange={(e) => setFormData({...formData, tipo_recurso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="humano">Humano</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="tecnologico">Tecnológico</option>
                    <option value="financiero">Financiero</option>
                    <option value="ambiente">Ambiente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área Asignada</label>
                  <input
                    type="text"
                    value={formData.area_asignada}
                    onChange={(e) => setFormData({...formData, area_asignada: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado Actual</label>
                  <select
                    value={formData.estado_actual}
                    onChange={(e) => setFormData({...formData, estado_actual: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="adecuado">Adecuado</option>
                    <option value="limitado">Limitado</option>
                    <option value="insuficiente">Insuficiente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Justificación / Uso</label>
                <textarea
                  rows={2}
                  value={formData.justificacion}
                  onChange={(e) => setFormData({...formData, justificacion: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Para qué se utiliza este recurso..."
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="necesidad_adicional"
                    checked={formData.necesidad_adicional}
                    onChange={(e) => setFormData({...formData, necesidad_adicional: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="necesidad_adicional" className="text-sm font-medium text-slate-700">
                    ¿Existe una necesidad adicional?
                  </label>
                </div>

                {formData.necesidad_adicional && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Necesidad</label>
                        <input
                          type="text"
                          value={formData.tipo_necesidad}
                          onChange={(e) => setFormData({...formData, tipo_necesidad: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Ej. Ampliación, Renovación"
                        />
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Necesidad</label>
                      <textarea
                        rows={2}
                        value={formData.descripcion_necesidad}
                        onChange={(e) => setFormData({...formData, descripcion_necesidad: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Costo Estimado</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="number"
                            value={formData.costo_estimado}
                            onChange={(e) => setFormData({...formData, costo_estimado: parseFloat(e.target.value)})}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estado Solicitud</label>
                        <select
                          value={formData.estado_solicitud}
                          onChange={(e) => setFormData({...formData, estado_solicitud: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="identificado">Identificado</option>
                          <option value="solicitado">Solicitado</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="rechazado">Rechazado</option>
                          <option value="en_proceso">En Proceso</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
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
