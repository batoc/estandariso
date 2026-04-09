'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
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
  AlertTriangle,
  FileText,
  CheckSquare
} from 'lucide-react';

export default function GestionCambiosPage() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fecha_solicitud: new Date().toISOString().split('T')[0],
    solicitante: '',
    descripcion_cambio: '',
    justificacion: '',
    tipo_cambio: 'proceso',
    prioridad: 'media',
    analisis_riesgos: '',
    recursos_necesarios: '',
    aprobador: '',
    fecha_aprobacion: '',
    estado: 'solicitado',
    fecha_implementacion: '',
    resultado_verificacion: ''
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const data = await pb.collection('gestion_cambios').getFullList({ sort: '-fecha_solicitud' });
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
      const dataToSave = {
        ...formData,
        fecha_aprobacion: formData.fecha_aprobacion || null,
        fecha_implementacion: formData.fecha_implementacion || null
      };

      if (editingId) {
        await pb.collection('gestion_cambios').update(editingId, dataToSave);
      } else {
        await pb.collection('gestion_cambios').create(dataToSave);
      }
      await cargar();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar registro de cambio?')) return;
    try {
      await pb.collection('gestion_cambios').delete(id);
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(item: any) {
    setEditingId(item.id);
    setFormData({
      fecha_solicitud: item.fecha_solicitud || new Date().toISOString().split('T')[0],
      solicitante: item.solicitante || '',
      descripcion_cambio: item.descripcion_cambio || '',
      justificacion: item.justificacion || '',
      tipo_cambio: item.tipo_cambio || 'proceso',
      prioridad: item.prioridad || 'media',
      analisis_riesgos: item.analisis_riesgos || '',
      recursos_necesarios: item.recursos_necesarios || '',
      aprobador: item.aprobador || '',
      fecha_aprobacion: item.fecha_aprobacion || '',
      estado: item.estado || 'solicitado',
      fecha_implementacion: item.fecha_implementacion || '',
      resultado_verificacion: item.resultado_verificacion || ''
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      fecha_solicitud: new Date().toISOString().split('T')[0],
      solicitante: '',
      descripcion_cambio: '',
      justificacion: '',
      tipo_cambio: 'proceso',
      prioridad: 'media',
      analisis_riesgos: '',
      recursos_necesarios: '',
      aprobador: '',
      fecha_aprobacion: '',
      estado: 'solicitado',
      fecha_implementacion: '',
      resultado_verificacion: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

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
          <p className="text-slate-500 ml-7">Planificación y control de cambios (6.3)</p>
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
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.estado === 'solicitado' || c.estado === 'en_analisis').length}
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
              <p className="text-sm font-medium text-slate-500">Implementados</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.estado === 'implementado' || c.estado === 'verificado').length}
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
              <p className="text-sm font-medium text-slate-500">Alta Prioridad</p>
              <p className="text-2xl font-bold text-slate-800">
                {cambios.filter(c => c.prioridad === 'alta' || c.prioridad === 'critica').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <AlertTriangle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Cambios</h3>
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
        ) : cambios.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay cambios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cambios.map((cambio) => (
                  <tr key={cambio.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{cambio.fecha_solicitud}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 line-clamp-1">{cambio.descripcion_cambio}</span>
                        <span className="text-xs text-slate-500">{cambio.solicitante}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 capitalize">{cambio.tipo_cambio}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        cambio.prioridad === 'critica' ? 'bg-red-100 text-red-700' :
                        cambio.prioridad === 'alta' ? 'bg-orange-100 text-orange-700' :
                        cambio.prioridad === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {cambio.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        cambio.estado === 'verificado' ? 'bg-emerald-100 text-emerald-700' :
                        cambio.estado === 'implementado' ? 'bg-blue-100 text-blue-700' :
                        cambio.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {cambio.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(cambio)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cambio.id)}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Solicitud</label>
                  <input
                    type="date"
                    value={formData.fecha_solicitud}
                    onChange={(e) => setFormData({...formData, fecha_solicitud: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Solicitante</label>
                  <input
                    type="text"
                    value={formData.solicitante}
                    onChange={(e) => setFormData({...formData, solicitante: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Cambio</label>
                <textarea
                  value={formData.descripcion_cambio}
                  onChange={(e) => setFormData({...formData, descripcion_cambio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Justificación</label>
                <textarea
                  value={formData.justificacion}
                  onChange={(e) => setFormData({...formData, justificacion: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cambio</label>
                  <select
                    value={formData.tipo_cambio}
                    onChange={(e) => setFormData({...formData, tipo_cambio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="proceso">Proceso</option>
                    <option value="documental">Documental</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="organizacional">Organizacional</option>
                    <option value="tecnologico">Tecnológico</option>
                  </select>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Análisis de Riesgos</label>
                <textarea
                  value={formData.analisis_riesgos}
                  onChange={(e) => setFormData({...formData, analisis_riesgos: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recursos Necesarios</label>
                <textarea
                  value={formData.recursos_necesarios}
                  onChange={(e) => setFormData({...formData, recursos_necesarios: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aprobador</label>
                  <input
                    type="text"
                    value={formData.aprobador}
                    onChange={(e) => setFormData({...formData, aprobador: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Aprobación</label>
                  <input
                    type="date"
                    value={formData.fecha_aprobacion}
                    onChange={(e) => setFormData({...formData, fecha_aprobacion: e.target.value})}
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
                    <option value="solicitado">Solicitado</option>
                    <option value="en_analisis">En Análisis</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="implementado">Implementado</option>
                    <option value="verificado">Verificado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Implementación</label>
                  <input
                    type="date"
                    value={formData.fecha_implementacion}
                    onChange={(e) => setFormData({...formData, fecha_implementacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resultado Verificación</label>
                <textarea
                  value={formData.resultado_verificacion}
                  onChange={(e) => setFormData({...formData, resultado_verificacion: e.target.value})}
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
