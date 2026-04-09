'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Save,
  Loader2,
  MoreVertical,
  Trash2,
  Edit,
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Target,
  ListChecks
} from 'lucide-react';

export default function AuditoriasPage() {
  const [auditorias, setAuditorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fecha_auditoria: new Date().toISOString().split('T')[0],
    tipo: 'interna',
    proceso_auditado: '',
    auditor_lider: '',
    hallazgos_totales: 0,
    conformidades: 0,
    no_conformidades_mayores: 0,
    no_conformidades_menores: 0,
    observaciones_count: 0,
    estado_general: 'satisfactorio',
    resumen: '',
    archivo_informe: ''
  });

  useEffect(() => {
    fetchAuditorias();
  }, []);

  const fetchAuditorias = async () => {
    setLoading(true);
    const data = await pb.collection('auditorias').getFullList({ sort: '-fecha_auditoria' });

    setAuditorias(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      hallazgos_totales: Number(formData.hallazgos_totales),
      conformidades: Number(formData.conformidades),
      no_conformidades_mayores: Number(formData.no_conformidades_mayores),
      no_conformidades_menores: Number(formData.no_conformidades_menores),
      observaciones_count: Number(formData.observaciones_count)
    };

    try {
      if (editingId) {
        await pb.collection('auditorias').update(editingId, dataToSave);
      } else {
        await pb.collection('auditorias').create(dataToSave);
      }
      fetchAuditorias();
      resetForm();
    } catch (error) {
      console.error('Error saving auditoria:', error);
      alert('Error al guardar la auditoría');
    }
  };

  const handleEdit = (auditoria: any) => {
    setEditingId(auditoria.id);
    setFormData({
      fecha_auditoria: auditoria.fecha_auditoria || new Date().toISOString().split('T')[0],
      tipo: auditoria.tipo || 'interna',
      proceso_auditado: auditoria.proceso_auditado || '',
      auditor_lider: auditoria.auditor_lider || '',
      hallazgos_totales: auditoria.hallazgos_totales || 0,
      conformidades: auditoria.conformidades || 0,
      no_conformidades_mayores: auditoria.no_conformidades_mayores || 0,
      no_conformidades_menores: auditoria.no_conformidades_menores || 0,
      observaciones_count: auditoria.observaciones_count || 0,
      estado_general: auditoria.estado_general || 'satisfactorio',
      resumen: auditoria.resumen || '',
      archivo_informe: auditoria.archivo_informe || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      await pb.collection('auditorias').delete(id);
        fetchAuditorias();
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_auditoria: new Date().toISOString().split('T')[0],
      tipo: 'interna',
      proceso_auditado: '',
      auditor_lider: '',
      hallazgos_totales: 0,
      conformidades: 0,
      no_conformidades_mayores: 0,
      no_conformidades_menores: 0,
      observaciones_count: 0,
      estado_general: 'satisfactorio',
      resumen: '',
      archivo_informe: ''
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
            <h1 className="text-2xl font-bold text-slate-800">Auditorías</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de auditorías internas y externas (9.2)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Auditoría
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Auditorías</p>
              <p className="text-2xl font-bold text-slate-800">{auditorias.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">NC Mayores</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.reduce((acc, curr) => acc + (curr.no_conformidades_mayores || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Satisfactorias</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.filter(a => a.estado_general === 'satisfactorio').length}
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
              <p className="text-sm font-medium text-slate-500">Hallazgos Totales</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.reduce((acc, curr) => acc + (curr.hallazgos_totales || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <ListChecks className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Auditorías</h3>
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
        ) : auditorias.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proceso</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Auditor Líder</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditorias.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{item.fecha_auditoria}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                        item.tipo === 'interna' ? 'bg-blue-100 text-blue-700' :
                        item.tipo === 'externa' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{item.proceso_auditado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{item.auditor_lider}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.estado_general === 'satisfactorio' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado_general === 'requiere_mejoras' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.estado_general?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Auditoría' : 'Nueva Auditoría'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Auditoría</label>
                  <input
                    type="date"
                    value={formData.fecha_auditoria}
                    onChange={(e) => setFormData({...formData, fecha_auditoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="interna">Interna</option>
                    <option value="externa">Externa</option>
                    <option value="certificacion">Certificación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Auditado</label>
                  <input
                    type="text"
                    value={formData.proceso_auditado}
                    onChange={(e) => setFormData({...formData, proceso_auditado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Líder</label>
                  <input
                    type="text"
                    value={formData.auditor_lider}
                    onChange={(e) => setFormData({...formData, auditor_lider: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgos Totales</label>
                  <input
                    type="number"
                    value={formData.hallazgos_totales}
                    onChange={(e) => setFormData({...formData, hallazgos_totales: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conformidades</label>
                  <input
                    type="number"
                    value={formData.conformidades}
                    onChange={(e) => setFormData({...formData, conformidades: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones (Cant.)</label>
                  <input
                    type="number"
                    value={formData.observaciones_count}
                    onChange={(e) => setFormData({...formData, observaciones_count: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NC Mayores</label>
                  <input
                    type="number"
                    value={formData.no_conformidades_mayores}
                    onChange={(e) => setFormData({...formData, no_conformidades_mayores: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NC Menores</label>
                  <input
                    type="number"
                    value={formData.no_conformidades_menores}
                    onChange={(e) => setFormData({...formData, no_conformidades_menores: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resumen</label>
                <textarea
                  value={formData.resumen}
                  onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado General</label>
                <select
                  value={formData.estado_general}
                  onChange={(e) => setFormData({...formData, estado_general: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="satisfactorio">Satisfactorio</option>
                  <option value="requiere_mejoras">Requiere Mejoras</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Informe</label>
                <input
                  type="text"
                  value={formData.archivo_informe}
                  onChange={(e) => setFormData({...formData, archivo_informe: e.target.value})}
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
