'use client';

import { useState, useEffect } from 'react';
import { NoConformidad } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Activity
} from 'lucide-react';

export default function NoConformidadesPage() {
  const [noConformidades, setNoConformidades] = useState<NoConformidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<NoConformidad | null>(null);

  const [formData, setFormData] = useState({
    fecha_deteccion: new Date().toISOString().split('T')[0],
    tipo: 'producto',
    severidad: 'menor',
    proceso_afectado: '',
    descripcion: '',
    causa_raiz: '',
    accion_correctiva: '',
    responsable: '',
    fecha_cierre: '',
    estado: 'abierta',
    eficacia_verificada: false
  });

  useEffect(() => {
    fetchNoConformidades();
  }, []);

  const fetchNoConformidades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('no_conformidades')
      .select('*')
      .order('fecha_deteccion', { ascending: false });

    if (!error && data) {
      setNoConformidades(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      fecha_cierre: formData.fecha_cierre || null
    };

    if (editando) {
      const { error } = await supabase
        .from('no_conformidades')
        .update(dataToSave)
        .eq('id', editando.id);
      
      if (!error) {
        fetchNoConformidades();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('no_conformidades')
        .insert([dataToSave]);
      
      if (!error) {
        fetchNoConformidades();
        resetForm();
      }
    }
  };

  const handleEdit = (nc: NoConformidad) => {
    setEditando(nc);
    setFormData({
      fecha_deteccion: nc.fecha_deteccion,
      tipo: nc.tipo,
      severidad: nc.severidad,
      proceso_afectado: nc.proceso_afectado,
      descripcion: nc.descripcion,
      causa_raiz: nc.causa_raiz || '',
      accion_correctiva: nc.accion_correctiva || '',
      responsable: nc.responsable,
      fecha_cierre: nc.fecha_cierre || '',
      estado: nc.estado,
      eficacia_verificada: nc.eficacia_verificada
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta no conformidad?')) {
      const { error } = await supabase
        .from('no_conformidades')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchNoConformidades();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_deteccion: new Date().toISOString().split('T')[0],
      tipo: 'producto',
      severidad: 'menor',
      proceso_afectado: '',
      descripcion: '',
      causa_raiz: '',
      accion_correctiva: '',
      responsable: '',
      fecha_cierre: '',
      estado: 'abierta',
      eficacia_verificada: false
    });
    setEditando(null);
    setShowForm(false);
  };

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'critica': return 'text-red-600 bg-red-50 border-red-100';
      case 'mayor': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'cerrada': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'en_analisis':
      case 'en_implementacion': return 'text-blue-600 bg-blue-50 border-blue-100';
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
            <h1 className="text-2xl font-bold text-slate-800">No Conformidades</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de hallazgos y acciones correctivas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva No Conformidad
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Registradas</p>
              <p className="text-2xl font-bold text-slate-800">{noConformidades.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Abiertas</p>
              <p className="text-2xl font-bold text-slate-800">
                {noConformidades.filter(nc => nc.estado === 'abierta').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Proceso</p>
              <p className="text-2xl font-bold text-slate-800">
                {noConformidades.filter(nc => ['en_analisis', 'en_implementacion'].includes(nc.estado)).length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Activity className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cerradas</p>
              <p className="text-2xl font-bold text-slate-800">
                {noConformidades.filter(nc => nc.estado === 'cerrada').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Listado de No Conformidades</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por descripción..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando registros...
            </div>
          </div>
        ) : noConformidades.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay no conformidades registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha / Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {noConformidades.map((nc) => (
                  <tr key={nc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{nc.fecha_deteccion}</div>
                      <div className="text-xs text-slate-500 capitalize">{nc.tipo.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={nc.descripcion}>
                        {nc.descripcion}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Proceso: {nc.proceso_afectado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeveridadColor(nc.severidad)}`}>
                        {nc.severidad.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(nc.estado)}`}>
                        {nc.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {nc.responsable ? nc.responsable.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-sm text-slate-600">{nc.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(nc)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(nc.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
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
                {editando ? 'Editar No Conformidad' : 'Nueva No Conformidad'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Detección *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_deteccion}
                    onChange={(e) => setFormData({...formData, fecha_deteccion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="producto">Producto</option>
                    <option value="proceso">Proceso</option>
                    <option value="sistema">Sistema</option>
                    <option value="auditoria">Auditoría</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severidad *</label>
                  <select
                    required
                    value={formData.severidad}
                    onChange={(e) => setFormData({...formData, severidad: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="menor">Menor</option>
                    <option value="mayor">Mayor</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Afectado *</label>
                  <input
                    type="text"
                    required
                    value={formData.proceso_afectado}
                    onChange={(e) => setFormData({...formData, proceso_afectado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Producción, Ventas..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Hallazgo *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Describa detalladamente la no conformidad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Causa Raíz</label>
                <textarea
                  rows={2}
                  value={formData.causa_raiz}
                  onChange={(e) => setFormData({...formData, causa_raiz: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Análisis de causa raíz..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acción Correctiva</label>
                <textarea
                  rows={2}
                  value={formData.accion_correctiva}
                  onChange={(e) => setFormData({...formData, accion_correctiva: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Acciones a tomar..."
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="abierta">Abierta</option>
                    <option value="en_analisis">En Análisis</option>
                    <option value="en_implementacion">En Implementación</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
              </div>

              {formData.estado === 'cerrada' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <h4 className="font-medium text-slate-800">Cierre de No Conformidad</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Cierre</label>
                      <input
                        type="date"
                        value={formData.fecha_cierre}
                        onChange={(e) => setFormData({...formData, fecha_cierre: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.eficacia_verificada}
                          onChange={(e) => setFormData({...formData, eficacia_verificada: e.target.checked})}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Eficacia Verificada</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

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
