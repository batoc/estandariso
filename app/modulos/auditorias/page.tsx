'use client';

import { useState, useEffect } from 'react';
import { Auditoria } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
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
  Briefcase
} from 'lucide-react';

export default function AuditoriasPage() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Auditoria | null>(null);

  const [formData, setFormData] = useState({
    fecha_auditoria: '',
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
    const { data, error } = await supabase
      .from('auditorias')
      .select('*')
      .order('fecha_auditoria', { ascending: false });

    if (!error && data) {
      setAuditorias(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editando) {
      const { error } = await supabase
        .from('auditorias')
        .update(formData)
        .eq('id', editando.id);
      
      if (!error) {
        fetchAuditorias();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('auditorias')
        .insert([formData]);
      
      if (!error) {
        fetchAuditorias();
        resetForm();
      }
    }
  };

  const handleEdit = (auditoria: Auditoria) => {
    setEditando(auditoria);
    setFormData({
      fecha_auditoria: auditoria.fecha_auditoria,
      tipo: auditoria.tipo,
      proceso_auditado: auditoria.proceso_auditado,
      auditor_lider: auditoria.auditor_lider,
      hallazgos_totales: auditoria.hallazgos_totales,
      conformidades: auditoria.conformidades,
      no_conformidades_mayores: auditoria.no_conformidades_mayores,
      no_conformidades_menores: auditoria.no_conformidades_menores,
      observaciones_count: auditoria.observaciones_count,
      estado_general: auditoria.estado_general,
      resumen: auditoria.resumen,
      archivo_informe: auditoria.archivo_informe || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta auditoría?')) {
      const { error } = await supabase
        .from('auditorias')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchAuditorias();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_auditoria: '',
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
    setEditando(null);
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Auditorías</h1>
          </div>
          <p className="text-slate-500 ml-7">Registro y seguimiento de auditorías internas y externas</p>
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
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Con Mejoras</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.filter(a => a.estado_general === 'requiere_mejoras').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Críticas</p>
              <p className="text-2xl font-bold text-slate-800">
                {auditorias.filter(a => a.estado_general === 'critico').length}
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
          <h3 className="font-bold text-slate-800">Auditorías Registradas</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar auditoría..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-standard">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Proceso</th>
                <th>Auditor</th>
                <th>Hallazgos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Cargando auditorías...
                    </div>
                  </td>
                </tr>
              ) : auditorias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No hay auditorías registradas
                  </td>
                </tr>
              ) : (
                auditorias.map((auditoria) => (
                  <tr key={auditoria.id} className="hover:bg-slate-50">
                    <td className="text-slate-600">
                      {new Date(auditoria.fecha_auditoria).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {auditoria.tipo.charAt(0).toUpperCase() + auditoria.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="font-medium text-slate-800">{auditoria.proceso_auditado}</td>
                    <td className="text-slate-600">{auditoria.auditor_lider}</td>
                    <td className="text-slate-600">{auditoria.hallazgos_totales}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        auditoria.estado_general === 'satisfactorio' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        auditoria.estado_general === 'requiere_mejoras' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {auditoria.estado_general === 'satisfactorio' ? 'Satisfactorio' :
                         auditoria.estado_general === 'requiere_mejoras' ? 'Requiere Mejoras' : 'Crítico'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(auditoria)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(auditoria.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editando ? 'Editar Auditoría' : 'Nueva Auditoría'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Auditoría *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      required
                      value={formData.fecha_auditoria}
                      onChange={(e) => setFormData({...formData, fecha_auditoria: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Auditoría *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="interna">Interna</option>
                    <option value="externa">Externa</option>
                    <option value="certificacion">Certificación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Auditado *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.proceso_auditado}
                      onChange={(e) => setFormData({...formData, proceso_auditado: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Ej. Producción, Ventas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Líder *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.auditor_lider}
                      onChange={(e) => setFormData({...formData, auditor_lider: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Nombre del auditor"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgos Totales</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hallazgos_totales}
                    onChange={(e) => setFormData({...formData, hallazgos_totales: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conformidades</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.conformidades}
                    onChange={(e) => setFormData({...formData, conformidades: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NC Mayores</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.no_conformidades_mayores}
                    onChange={(e) => setFormData({...formData, no_conformidades_mayores: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NC Menores</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.no_conformidades_menores}
                    onChange={(e) => setFormData({...formData, no_conformidades_menores: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado General *</label>
                <select
                  required
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Resumen *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.resumen}
                  onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Resumen de los resultados de la auditoría..."
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
                  {editando ? 'Actualizar Auditoría' : 'Guardar Auditoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
