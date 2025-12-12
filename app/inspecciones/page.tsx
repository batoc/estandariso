'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  ClipboardCheck,
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
  FileText
} from 'lucide-react';

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo_inspeccion: '',
    area: '',
    fecha_inspeccion: new Date().toISOString().split('T')[0],
    fecha_seguimiento: '',
    inspector: '',
    hallazgos: '',
    acciones_inmediatas: '',
    estado_seguimiento: 'pendiente'
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('inspecciones_verificacion').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInspecciones(data || []);
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
        fecha_seguimiento: formData.fecha_seguimiento || null
      };

      if (editingId) {
        const { error } = await supabase.from('inspecciones_verificacion').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('inspecciones_verificacion').insert([dataToSave]);
        if (error) throw error;
      }
      await cargar();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar inspección?')) return;
    try {
      const { error } = await supabase.from('inspecciones_verificacion').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(i: any) {
    setFormData({
      tipo_inspeccion: i.tipo_inspeccion,
      area: i.area,
      fecha_inspeccion: i.fecha_inspeccion,
      fecha_seguimiento: i.fecha_seguimiento || '',
      inspector: i.inspector,
      hallazgos: i.hallazgos || '',
      acciones_inmediatas: i.acciones_inmediatas || '',
      estado_seguimiento: i.estado_seguimiento || 'pendiente'
    });
    setEditingId(i.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      tipo_inspeccion: '',
      area: '',
      fecha_inspeccion: new Date().toISOString().split('T')[0],
      fecha_seguimiento: '',
      inspector: '',
      hallazgos: '',
      acciones_inmediatas: '',
      estado_seguimiento: 'pendiente'
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'cerrado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'en_proceso': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'pendiente': return 'text-amber-600 bg-amber-50 border-amber-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Inspecciones</h1>
          </div>
          <p className="text-slate-500 ml-7">Control y seguimiento de inspecciones de calidad</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Inspección
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Inspecciones</p>
              <p className="text-2xl font-bold text-slate-800">{inspecciones.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cerradas</p>
              <p className="text-2xl font-bold text-slate-800">
                {inspecciones.filter(i => i.estado_seguimiento === 'cerrado').length}
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
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-800">
                {inspecciones.filter(i => i.estado_seguimiento === 'pendiente').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Proceso</p>
              <p className="text-2xl font-bold text-slate-800">
                {inspecciones.filter(i => i.estado_seguimiento === 'en_proceso').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Inspecciones</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar inspección..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando inspecciones...
            </div>
          </div>
        ) : inspecciones.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay inspecciones registradas
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {inspecciones.map((inspeccion) => (
              <div key={inspeccion.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(inspeccion.estado_seguimiento)} uppercase`}>
                        {inspeccion.estado_seguimiento?.replace('_', ' ') || 'PENDIENTE'}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {inspeccion.area}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{inspeccion.tipo_inspeccion}</h4>
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  {inspeccion.hallazgos && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">Hallazgos</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{inspeccion.hallazgos}</p>
                    </div>
                  )}
                  
                  {inspeccion.acciones_inmediatas && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-600 mb-1">Acciones Inmediatas</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{inspeccion.acciones_inmediatas}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {inspeccion.inspector || 'Sin asignar'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {inspeccion.fecha_inspeccion}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(inspeccion)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(inspeccion.id)}
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
                {editingId ? 'Editar Inspección' : 'Nueva Inspección'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Inspección *</label>
                  <input
                    type="text"
                    required
                    value={formData.tipo_inspeccion}
                    onChange={(e) => setFormData({...formData, tipo_inspeccion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Seguridad, Calidad, Ambiental"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área / Departamento *</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inspección *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inspeccion}
                    onChange={(e) => setFormData({...formData, fecha_inspeccion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Seguimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_seguimiento}
                    onChange={(e) => setFormData({...formData, fecha_seguimiento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgos</label>
                <textarea
                  rows={3}
                  value={formData.hallazgos}
                  onChange={(e) => setFormData({...formData, hallazgos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Observaciones encontradas durante la inspección..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Inmediatas</label>
                <textarea
                  rows={3}
                  value={formData.acciones_inmediatas}
                  onChange={(e) => setFormData({...formData, acciones_inmediatas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Medidas a tomar..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Inspector</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({...formData, inspector: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado Seguimiento</label>
                  <select
                    value={formData.estado_seguimiento}
                    onChange={(e) => setFormData({...formData, estado_seguimiento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
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
