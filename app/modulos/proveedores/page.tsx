'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  ShieldCheck,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre_proveedor: '',
    categoria: 'materias_primas',
    calificacion_actual: 0,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    estado: 'aprobado',
    incidentes_totales: 0,
    observaciones: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('nombre_proveedor');

    if (!error && data) {
      setProveedores(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      calificacion_actual: Number(formData.calificacion_actual),
      incidentes_totales: Number(formData.incidentes_totales)
    };

    if (editingId) {
      const { error } = await supabase
        .from('proveedores')
        .update(dataToSave)
        .eq('id', editingId);
      
      if (!error) {
        fetchProveedores();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('proveedores')
        .insert([dataToSave]);
      
      if (!error) {
        fetchProveedores();
        resetForm();
      }
    }
  };

  const handleEdit = (proveedor: any) => {
    setEditingId(proveedor.id);
    setFormData({
      nombre_proveedor: proveedor.nombre_proveedor || '',
      categoria: proveedor.categoria || 'materias_primas',
      calificacion_actual: proveedor.calificacion_actual || 0,
      fecha_evaluacion: proveedor.fecha_evaluacion || new Date().toISOString().split('T')[0],
      estado: proveedor.estado || 'aprobado',
      incidentes_totales: proveedor.incidentes_totales || 0,
      observaciones: proveedor.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este registro?')) {
      const { error } = await supabase.from('proveedores').delete().eq('id', id);
      if (!error) fetchProveedores();
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_proveedor: '',
      categoria: 'materias_primas',
      calificacion_actual: 0,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      estado: 'aprobado',
      incidentes_totales: 0,
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
            <h1 className="text-2xl font-bold text-slate-800">Proveedores</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión y evaluación de proveedores externos (8.4)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Proveedores</p>
              <p className="text-2xl font-bold text-slate-800">{proveedores.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Aprobados</p>
              <p className="text-2xl font-bold text-slate-800">
                {proveedores.filter(p => p.estado === 'aprobado').length}
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
              <p className="text-sm font-medium text-slate-500">Calif. Promedio</p>
              <p className="text-2xl font-bold text-slate-800">
                {proveedores.length > 0 
                  ? (proveedores.reduce((acc, curr) => acc + (curr.calificacion_actual || 0), 0) / proveedores.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Con Incidentes</p>
              <p className="text-2xl font-bold text-slate-800">
                {proveedores.filter(p => (p.incidentes_totales || 0) > 0).length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <AlertCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Directorio de Proveedores</h3>
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
        ) : proveedores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluación</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Calificación</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proveedores.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{item.nombre_proveedor}</span>
                        <span className="text-xs text-slate-500">{item.observaciones}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                        item.categoria === 'materias_primas' ? 'bg-blue-100 text-blue-700' :
                        item.categoria === 'servicios' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.categoria?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{item.fecha_evaluacion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${
                          (item.calificacion_actual || 0) >= 90 ? 'text-emerald-600' :
                          (item.calificacion_actual || 0) >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {item.calificacion_actual}
                        </span>
                        <span className="text-slate-400">/ 100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado === 'condicional' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.estado?.replace(/_/g, ' ')}
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
                {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Proveedor</label>
                  <input
                    type="text"
                    value={formData.nombre_proveedor}
                    onChange={(e) => setFormData({...formData, nombre_proveedor: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="materias_primas">Materias Primas</option>
                    <option value="servicios">Servicios</option>
                    <option value="equipos">Equipos</option>
                    <option value="transporte">Transporte</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Evaluación</label>
                  <input
                    type="date"
                    value={formData.fecha_evaluacion}
                    onChange={(e) => setFormData({...formData, fecha_evaluacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Calificación (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.calificacion_actual}
                    onChange={(e) => setFormData({...formData, calificacion_actual: Number(e.target.value)})}
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
                    <option value="aprobado">Aprobado</option>
                    <option value="condicional">Condicional</option>
                    <option value="no_aprobado">No Aprobado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Incidentes Totales</label>
                  <input
                    type="number"
                    value={formData.incidentes_totales}
                    onChange={(e) => setFormData({...formData, incidentes_totales: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={3}
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
