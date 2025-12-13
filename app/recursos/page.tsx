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
  HardDrive,
  MapPin,
  BarChart2
} from 'lucide-react';

export default function RecursosPage() {
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    tipo_recurso: 'humano',
    nombre_recurso: '',
    area: '',
    estado_actual: 'adecuado',
    cantidad_actual: '',
    capacidad_utilizada: 0,
    necesidad_adicional: false,
    cantidad_requerida: '',
    justificacion: '',
    prioridad: 'media',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    responsable: '',
    costo_estimado: 0,
    estado_solicitud: 'pendiente',
    observaciones: ''
  });

  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recursos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRecursos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      capacidad_utilizada: Number(formData.capacidad_utilizada),
      costo_estimado: Number(formData.costo_estimado)
    };

    if (editingId) {
      const { error } = await supabase
        .from('recursos')
        .update(dataToSave)
        .eq('id', editingId);
      
      if (!error) {
        fetchRecursos();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('recursos')
        .insert([dataToSave]);
      
      if (!error) {
        fetchRecursos();
        resetForm();
      }
    }
  };

  const handleEdit = (recurso: any) => {
    setEditingId(recurso.id);
    setFormData({
      tipo_recurso: recurso.tipo_recurso || 'humano',
      nombre_recurso: recurso.nombre_recurso || '',
      area: recurso.area || '',
      estado_actual: recurso.estado_actual || 'adecuado',
      cantidad_actual: recurso.cantidad_actual || '',
      capacidad_utilizada: recurso.capacidad_utilizada || 0,
      necesidad_adicional: recurso.necesidad_adicional || false,
      cantidad_requerida: recurso.cantidad_requerida || '',
      justificacion: recurso.justificacion || '',
      prioridad: recurso.prioridad || 'media',
      fecha_evaluacion: recurso.fecha_evaluacion || new Date().toISOString().split('T')[0],
      responsable: recurso.responsable || '',
      costo_estimado: recurso.costo_estimado || 0,
      estado_solicitud: recurso.estado_solicitud || 'pendiente',
      observaciones: recurso.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar recurso?')) {
      const { error } = await supabase.from('recursos').delete().eq('id', id);
      if (!error) fetchRecursos();
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_recurso: 'humano',
      nombre_recurso: '',
      area: '',
      estado_actual: 'adecuado',
      cantidad_actual: '',
      capacidad_utilizada: 0,
      necesidad_adicional: false,
      cantidad_requerida: '',
      justificacion: '',
      prioridad: 'media',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      responsable: '',
      costo_estimado: 0,
      estado_solicitud: 'pendiente',
      observaciones: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'humano': return <Users className="text-blue-500" />;
      case 'infraestructura': return <HardDrive className="text-slate-500" />;
      case 'tecnologico': return <Monitor className="text-purple-500" />;
      case 'financiero': return <DollarSign className="text-emerald-500" />;
      default: return <Briefcase className="text-slate-500" />;
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
            <h1 className="text-2xl font-bold text-slate-800">Recursos</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de recursos (7.1)</p>
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
              <p className="text-sm font-medium text-slate-500">Adecuados</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.estado_actual === 'adecuado').length}
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
              <p className="text-sm font-medium text-slate-500">Requieren Mejora</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.estado_actual === 'requiere_mejora').length}
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
              <p className="text-sm font-medium text-slate-500">Solicitudes</p>
              <p className="text-2xl font-bold text-slate-800">
                {recursos.filter(r => r.necesidad_adicional).length}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Recurso</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Capacidad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Necesidad</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recursos.map((recurso) => (
                  <tr key={recurso.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getIcon(recurso.tipo_recurso)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{recurso.nombre_recurso}</p>
                          <p className="text-xs text-slate-500 capitalize">{recurso.tipo_recurso}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{recurso.area}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        recurso.estado_actual === 'adecuado' ? 'bg-emerald-100 text-emerald-700' :
                        recurso.estado_actual === 'disponible' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {recurso.estado_actual?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              recurso.capacidad_utilizada > 90 ? 'bg-red-500' :
                              recurso.capacidad_utilizada > 75 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${recurso.capacidad_utilizada}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{recurso.capacidad_utilizada}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {recurso.necesidad_adicional ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Solicitada
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(recurso)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(recurso.id)}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Recurso *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_recurso}
                    onChange={(e) => setFormData({...formData, nombre_recurso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
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
                    <option value="informacion">Información</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
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
                    <option value="disponible">Disponible</option>
                    <option value="adecuado">Adecuado</option>
                    <option value="insuficiente">Insuficiente</option>
                    <option value="requiere_mejora">Requiere Mejora</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad Actual</label>
                  <input
                    type="text"
                    value={formData.cantidad_actual}
                    onChange={(e) => setFormData({...formData, cantidad_actual: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Capacidad Utilizada (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.capacidad_utilizada}
                    onChange={(e) => setFormData({...formData, capacidad_utilizada: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="necesidad"
                    checked={formData.necesidad_adicional}
                    onChange={(e) => setFormData({...formData, necesidad_adicional: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="necesidad" className="font-medium text-slate-700">Requiere Recursos Adicionales</label>
                </div>

                {formData.necesidad_adicional && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad Requerida</label>
                        <input
                          type="text"
                          value={formData.cantidad_requerida}
                          onChange={(e) => setFormData({...formData, cantidad_requerida: e.target.value})}
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
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Justificación</label>
                      <textarea
                        value={formData.justificacion}
                        onChange={(e) => setFormData({...formData, justificacion: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Costo Estimado</label>
                        <input
                          type="number"
                          value={formData.costo_estimado}
                          onChange={(e) => setFormData({...formData, costo_estimado: Number(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estado Solicitud</label>
                        <select
                          value={formData.estado_solicitud}
                          onChange={(e) => setFormData({...formData, estado_solicitud: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="rechazado">Rechazado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Evaluación</label>
                  <input
                    type="date"
                    value={formData.fecha_evaluacion}
                    onChange={(e) => setFormData({...formData, fecha_evaluacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
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
