'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Truck
} from 'lucide-react';

export default function AuditoriasProveedoresPage() {
  const [auditorias, setAuditorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_auditoria: new Date().toISOString().split('T')[0],
    auditor: '',
    puntuacion: 0,
    resultado: 'aprobado',
    hallazgos_criticos: '',
    acciones_correctivas: '',
    fecha_proxima_auditoria: '',
    normas_evaluadas: '', // Comma separated string for UI, JSONB in DB
    archivo_informe: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [auditoriasRes, proveedoresRes] = await Promise.all([
        supabase.from('auditorias_proveedores').select(`
          *,
          proveedores (nombre_proveedor)
        `).order('fecha_auditoria', { ascending: false }),
        supabase.from('proveedores').select('id, nombre_proveedor').order('nombre_proveedor')
      ]);

      if (auditoriasRes.error) throw auditoriasRes.error;
      if (proveedoresRes.error) throw proveedoresRes.error;

      setAuditorias(auditoriasRes.data || []);
      setProveedores(proveedoresRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Convert normas_evaluadas string to array/json
      const normasArray = formData.normas_evaluadas.split(',').map(s => s.trim()).filter(Boolean);

      const dataToSave = {
        ...formData,
        proveedor_id: parseInt(formData.proveedor_id),
        normas_evaluadas: normasArray,
        fecha_proxima_auditoria: formData.fecha_proxima_auditoria || null
      };

      if (editingId) {
        const { error } = await supabase.from('auditorias_proveedores').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('auditorias_proveedores').insert([dataToSave]);
        if (error) throw error;
      }
      
      cargarDatos();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la auditoría');
    }
  }

  const handleEdit = (auditoria: any) => {
    setEditingId(auditoria.id);
    
    // Handle normas_evaluadas which might be JSON/Array
    let normasStr = '';
    if (Array.isArray(auditoria.normas_evaluadas)) {
      normasStr = auditoria.normas_evaluadas.join(', ');
    } else if (typeof auditoria.normas_evaluadas === 'string') {
      normasStr = auditoria.normas_evaluadas;
    }

    setFormData({
      proveedor_id: auditoria.proveedor_id?.toString() || '',
      fecha_auditoria: auditoria.fecha_auditoria || '',
      auditor: auditoria.auditor || '',
      puntuacion: auditoria.puntuacion || 0,
      resultado: auditoria.resultado || 'aprobado',
      hallazgos_criticos: auditoria.hallazgos_criticos || '',
      acciones_correctivas: auditoria.acciones_correctivas || '',
      fecha_proxima_auditoria: auditoria.fecha_proxima_auditoria || '',
      normas_evaluadas: normasStr,
      archivo_informe: auditoria.archivo_informe || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar auditoría?')) {
      const { error } = await supabase.from('auditorias_proveedores').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  const resetForm = () => {
    setFormData({
      proveedor_id: '',
      fecha_auditoria: new Date().toISOString().split('T')[0],
      auditor: '',
      puntuacion: 0,
      resultado: 'aprobado',
      hallazgos_criticos: '',
      acciones_correctivas: '',
      fecha_proxima_auditoria: '',
      normas_evaluadas: '',
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
            <Link href="/modulos/proveedores" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Auditorías a Proveedores</h1>
          </div>
          <p className="text-slate-500 ml-7">Evaluación y seguimiento de desempeño (8.4)</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Aprobadas</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.filter(a => a.resultado === 'aprobado').length}
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
              <p className="text-sm font-medium text-slate-500">Críticas</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.filter(a => a.resultado === 'no_aprobado' || a.resultado === 'critico').length}
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
          <h3 className="font-bold text-slate-800">Historial de Auditorías</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar auditoría..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando auditorías...
            </div>
          </div>
        ) : auditorias.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay auditorías registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor / Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Auditor</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Puntuación</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resultado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditorias.map((auditoria) => (
                  <tr key={auditoria.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {auditoria.proveedores?.nombre_proveedor || 'Proveedor desconocido'}
                        </span>
                        <span className="text-xs text-slate-500">{auditoria.fecha_auditoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={14} />
                        <span className="text-sm">{auditoria.auditor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-700">{auditoria.puntuacion}/100</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        auditoria.resultado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                        auditoria.resultado === 'condicional' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {auditoria.resultado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(auditoria)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(auditoria.id)}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor *</label>
                  <select
                    required
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Auditoría *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_auditoria}
                    onChange={(e) => setFormData({...formData, fecha_auditoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Auditor</label>
                  <input
                    type="text"
                    value={formData.auditor}
                    onChange={(e) => setFormData({...formData, auditor: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resultado</label>
                  <select
                    value={formData.resultado}
                    onChange={(e) => setFormData({...formData, resultado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="aprobado">Aprobado</option>
                    <option value="condicional">Condicional</option>
                    <option value="no_aprobado">No Aprobado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Puntuación (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.puntuacion}
                    onChange={(e) => setFormData({...formData, puntuacion: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Próxima Auditoría</label>
                  <input
                    type="date"
                    value={formData.fecha_proxima_auditoria}
                    onChange={(e) => setFormData({...formData, fecha_proxima_auditoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Normas Evaluadas (separadas por coma)</label>
                <input
                  type="text"
                  value={formData.normas_evaluadas}
                  onChange={(e) => setFormData({...formData, normas_evaluadas: e.target.value})}
                  placeholder="ISO 9001, ISO 14001, BASC..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgos Críticos</label>
                <textarea
                  rows={3}
                  value={formData.hallazgos_criticos}
                  onChange={(e) => setFormData({...formData, hallazgos_criticos: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Correctivas</label>
                <textarea
                  rows={3}
                  value={formData.acciones_correctivas}
                  onChange={(e) => setFormData({...formData, acciones_correctivas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Informe Auditoría</label>
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
