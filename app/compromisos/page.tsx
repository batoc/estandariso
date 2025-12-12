'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Compromiso } from '@/lib/types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  Target,
  Briefcase,
  DollarSign
} from 'lucide-react';

export default function CompromisosPage() {
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Compromiso | null>(null);
  
  const [formData, setFormData] = useState({
    revision_id: null as number | null,
    tipo_salida: 'mejora' as 'mejora' | 'cambio_sgc' | 'recursos',
    descripcion: '',
    objetivo: '',
    responsable: '',
    area_responsable: '',
    fecha_compromiso: new Date().toISOString().split('T')[0],
    fecha_limite: '',
    estado: 'pendiente' as 'pendiente' | 'en_proceso' | 'completado' | 'vencido' | 'cancelado',
    prioridad: 'media' as 'alta' | 'media' | 'baja',
    porcentaje_avance: 0,
    recursos_necesarios: '',
    presupuesto_estimado: 0,
    observaciones: '',
  });

  useEffect(() => {
    cargarCompromisos();
  }, []);

  const cargarCompromisos = async () => {
    try {
      const { data, error } = await supabase
        .from('compromisos')
        .select('*')
        .order('fecha_limite', { ascending: true });

      if (error) throw error;
      setCompromisos(data || []);
    } catch (error) {
      console.error('Error cargando compromisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.fecha_limite) {
        alert('Por favor seleccione una fecha límite');
        return;
      }

      if (editando) {
        const { error } = await supabase
          .from('compromisos')
          .update(formData)
          .eq('id', editando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('compromisos')
          .insert([formData]);

        if (error) throw error;
      }

      await cargarCompromisos();
      resetForm();
    } catch (error) {
      console.error('Error guardando compromiso:', error);
      alert('Error al guardar el compromiso');
    }
  };

  const handleEditar = (compromiso: Compromiso) => {
    setEditando(compromiso);
    setFormData({
      revision_id: compromiso.revision_id,
      tipo_salida: compromiso.tipo_salida,
      descripcion: compromiso.descripcion,
      objetivo: compromiso.objetivo || '',
      responsable: compromiso.responsable,
      area_responsable: compromiso.area_responsable || '',
      fecha_compromiso: compromiso.fecha_compromiso,
      fecha_limite: compromiso.fecha_limite,
      estado: compromiso.estado,
      prioridad: compromiso.prioridad,
      porcentaje_avance: compromiso.porcentaje_avance,
      recursos_necesarios: compromiso.recursos_necesarios || '',
      presupuesto_estimado: compromiso.presupuesto_estimado || 0,
      observaciones: compromiso.observaciones || '',
    });
    setShowForm(true);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este compromiso?')) return;
    
    const { error } = await supabase
      .from('compromisos')
      .delete()
      .eq('id', id);
    
    if (!error) {
      cargarCompromisos();
    }
  };

  const resetForm = () => {
    setFormData({
      revision_id: 0,
      tipo_salida: 'mejora',
      descripcion: '',
      objetivo: '',
      responsable: '',
      area_responsable: '',
      fecha_compromiso: new Date().toISOString().split('T')[0],
      fecha_limite: '',
      estado: 'pendiente',
      prioridad: 'media',
      porcentaje_avance: 0,
      recursos_necesarios: '',
      presupuesto_estimado: 0,
      observaciones: '',
    });
    setEditando(null);
    setShowForm(false);
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-100';
      case 'media': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'en_proceso': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'vencido': return 'text-red-600 bg-red-50 border-red-100';
      case 'cancelado': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Compromisos y Tareas</h1>
          </div>
          <p className="text-slate-500 ml-7">Seguimiento de acciones y responsabilidades</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Compromiso
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Compromisos</p>
              <p className="text-2xl font-bold text-slate-800">{compromisos.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-800">
                {compromisos.filter(c => c.estado === 'pendiente' || c.estado === 'en_proceso').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Completados</p>
              <p className="text-2xl font-bold text-slate-800">
                {compromisos.filter(c => c.estado === 'completado').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Vencidos</p>
              <p className="text-2xl font-bold text-slate-800">
                {compromisos.filter(c => c.estado === 'vencido').length}
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
          <h3 className="font-bold text-slate-800">Listado de Compromisos</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar compromiso..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando compromisos...
            </div>
          </div>
        ) : compromisos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay compromisos registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {compromisos.map((compromiso) => (
              <div key={compromiso.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getPrioridadColor(compromiso.prioridad)} uppercase`}>
                        {compromiso.prioridad}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(compromiso.estado)} uppercase`}>
                        {compromiso.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{compromiso.descripcion}</h4>
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-slate-400" />
                    <span>{compromiso.responsable}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Vence: {compromiso.fecha_limite}</span>
                  </div>
                  {compromiso.objetivo && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Target size={16} className="text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{compromiso.objetivo}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Avance</span>
                    <span className="font-bold text-blue-600">{compromiso.porcentaje_avance}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${compromiso.porcentaje_avance}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => handleEditar(compromiso)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(compromiso.id)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editando ? 'Editar Compromiso' : 'Nuevo Compromiso'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Salida *</label>
                  <select
                    required
                    value={formData.tipo_salida}
                    onChange={(e) => setFormData({...formData, tipo_salida: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="mejora">Mejora</option>
                    <option value="cambio_sgc">Cambio SGC</option>
                    <option value="recursos">Recursos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad *</label>
                  <select
                    required
                    value={formData.prioridad}
                    onChange={(e) => setFormData({...formData, prioridad: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Descripción del compromiso..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                <textarea
                  rows={2}
                  value={formData.objetivo}
                  onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Objetivo a alcanzar..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable *</label>
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
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

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compromiso *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_compromiso}
                    onChange={(e) => setFormData({...formData, fecha_compromiso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_limite}
                    onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Avance (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.porcentaje_avance}
                      onChange={(e) => setFormData({...formData, porcentaje_avance: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-blue-600 w-12 text-right">{formData.porcentaje_avance}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Recursos Necesarios</label>
                  <input
                    type="text"
                    value={formData.recursos_necesarios}
                    onChange={(e) => setFormData({...formData, recursos_necesarios: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Presupuesto Estimado</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.presupuesto_estimado}
                      onChange={(e) => setFormData({...formData, presupuesto_estimado: parseFloat(e.target.value) || 0})}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Notas adicionales..."
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
                  {editando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
