'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
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
  Link as LinkIcon
} from 'lucide-react';

export default function CompromisosPage() {
  const [compromisos, setCompromisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    descripcion: '',
    responsable: '',
    fecha_compromiso: new Date().toISOString().split('T')[0],
    fecha_cumplimiento: '',
    estado: 'pendiente',
    evidencia_url: '',
    observaciones: ''
  });

  useEffect(() => {
    fetchCompromisos();
  }, []);

  const fetchCompromisos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('compromisos')
      .select('*')
      .order('fecha_compromiso', { ascending: false });

    if (!error && data) {
      setCompromisos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion || !formData.responsable) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const dataToSave = {
      descripcion: formData.descripcion,
      responsable: formData.responsable,
      fecha_compromiso: formData.fecha_compromiso,
      fecha_cumplimiento: formData.fecha_cumplimiento || null,
      estado: formData.estado,
      evidencia_url: formData.evidencia_url || null,
      observaciones: formData.observaciones || null
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('compromisos')
          .update(dataToSave)
          .eq('id', editingId);
        
        if (error) {
          console.error('Error actualizando:', error);
          alert('Error al actualizar: ' + error.message);
        } else {
          alert('Compromiso actualizado exitosamente');
          fetchCompromisos();
          resetForm();
        }
      } else {
        const { error } = await supabase
          .from('compromisos')
          .insert([dataToSave]);
        
        if (error) {
          console.error('Error insertando:', error);
          alert('Error al guardar: ' + error.message);
        } else {
          alert('Compromiso guardado exitosamente');
          fetchCompromisos();
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      alert('Error inesperado: ' + String(err));
    }
  };

  const handleEdit = (compromiso: any) => {
    setEditingId(compromiso.id);
    setFormData({
      descripcion: compromiso.descripcion || '',
      responsable: compromiso.responsable || '',
      fecha_compromiso: compromiso.fecha_compromiso || new Date().toISOString().split('T')[0],
      fecha_cumplimiento: compromiso.fecha_cumplimiento || '',
      estado: compromiso.estado || 'pendiente',
      evidencia_url: compromiso.evidencia_url || '',
      observaciones: compromiso.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este compromiso?')) {
      const { error } = await supabase.from('compromisos').delete().eq('id', id);
      if (!error) fetchCompromisos();
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      responsable: '',
      fecha_compromiso: new Date().toISOString().split('T')[0],
      fecha_cumplimiento: '',
      estado: 'pendiente',
      evidencia_url: '',
      observaciones: ''
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
            <h1 className="text-2xl font-bold text-slate-800">Compromisos</h1>
          </div>
          <p className="text-slate-500 ml-7">Seguimiento de acciones y compromisos (9.3)</p>
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
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-800">
                {compromisos.filter(c => c.estado === 'pendiente').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
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
        <div className="card p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Vencidos</p>
              <p className="text-2xl font-bold text-slate-800">
                {compromisos.filter(c => c.estado === 'vencido').length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <AlertTriangle className="text-rose-600" size={24} />
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
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando datos...
            </div>
          </div>
        ) : compromisos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay compromisos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {compromisos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{item.descripcion}</span>
                        <span className="text-xs text-slate-500">{item.observaciones}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{item.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{item.fecha_compromiso}</span>
                        {item.fecha_cumplimiento && (
                          <span className="text-xs text-emerald-600">Cumplido: {item.fecha_cumplimiento}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.estado === 'completado' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                        item.estado === 'vencido' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {item.evidencia_url && (
                          <a 
                            href={item.evidencia_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <LinkIcon size={18} />
                          </a>
                        )}
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Compromiso' : 'Nuevo Compromiso'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compromiso</label>
                  <input
                    type="date"
                    value={formData.fecha_compromiso}
                    onChange={(e) => setFormData({...formData, fecha_compromiso: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Cumplimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_cumplimiento}
                    onChange={(e) => setFormData({...formData, fecha_cumplimiento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Evidencia</label>
                <input
                  type="url"
                  value={formData.evidencia_url}
                  onChange={(e) => setFormData({...formData, evidencia_url: e.target.value})}
                  placeholder="https://..."
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
