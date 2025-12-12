'use client';

import { useState, useEffect } from 'react';
import { Proveedor } from '@/lib/types';
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
  ShieldCheck
} from 'lucide-react';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);

  const [formData, setFormData] = useState({
    nombre_proveedor: '',
    categoria: 'materias_primas',
    calificacion_actual: 0,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    criterios: {
      calidad: 0,
      entrega: 0,
      precio: 0,
      servicio: 0
    },
    estado: 'aprobado',
    incidentes_totales: 0,
    observaciones: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    // Calcular calificación promedio automáticamente
    const { calidad, entrega, precio, servicio } = formData.criterios;
    const promedio = (calidad + entrega + precio + servicio) / 4;
    setFormData(prev => ({ ...prev, calificacion_actual: parseFloat(promedio.toFixed(2)) }));
  }, [formData.criterios]);

  const fetchProveedores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('calificacion_actual', { ascending: false });

    if (!error && data) {
      setProveedores(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      nombre_proveedor: formData.nombre_proveedor,
      categoria: formData.categoria,
      calificacion_actual: formData.calificacion_actual,
      fecha_evaluacion: formData.fecha_evaluacion,
      criterios_evaluacion: formData.criterios,
      estado: formData.estado,
      incidentes_totales: formData.incidentes_totales,
      observaciones: formData.observaciones
    };

    if (editando) {
      const { error } = await supabase
        .from('proveedores')
        .update(dataToSave)
        .eq('id', editando.id);
      
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

  const handleEdit = (proveedor: Proveedor) => {
    setEditando(proveedor);
    setFormData({
      nombre_proveedor: proveedor.nombre_proveedor,
      categoria: proveedor.categoria,
      calificacion_actual: proveedor.calificacion_actual,
      fecha_evaluacion: proveedor.fecha_evaluacion,
      criterios: proveedor.criterios_evaluacion,
      estado: proveedor.estado,
      incidentes_totales: proveedor.incidentes_totales,
      observaciones: proveedor.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchProveedores();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_proveedor: '',
      categoria: 'materias_primas',
      calificacion_actual: 0,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      criterios: {
        calidad: 0,
        entrega: 0,
        precio: 0,
        servicio: 0
      },
      estado: 'aprobado',
      incidentes_totales: 0,
      observaciones: ''
    });
    setEditando(null);
    setShowForm(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'condicional': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'no_aprobado': return 'text-red-600 bg-red-50 border-red-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Proveedores</h1>
          </div>
          <p className="text-slate-500 ml-7">Evaluación y seguimiento de proveedores externos</p>
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
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Condicionados</p>
              <p className="text-2xl font-bold text-slate-800">
                {proveedores.filter(p => p.estado === 'condicional').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Rechazados</p>
              <p className="text-2xl font-bold text-slate-800">
                {proveedores.filter(p => p.estado === 'no_aprobado').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Listado de Proveedores</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando proveedores...
            </div>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay proveedores registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {proveedores.map((proveedor) => (
              <div key={proveedor.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg">{proveedor.nombre_proveedor}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
                        {proveedor.categoria.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getEstadoColor(proveedor.estado)} capitalize`}>
                        {proveedor.estado}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                      <Star size={20} fill="currentColor" />
                      {proveedor.calificacion_actual}
                    </div>
                    <span className="text-xs text-slate-400">Calificación</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Calidad</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(proveedor.criterios_evaluacion.calidad / 100) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{proveedor.criterios_evaluacion.calidad}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Entrega</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(proveedor.criterios_evaluacion.entrega / 100) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{proveedor.criterios_evaluacion.entrega}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Precio</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(proveedor.criterios_evaluacion.precio / 100) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{proveedor.criterios_evaluacion.precio}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Servicio</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(proveedor.criterios_evaluacion.servicio / 100) * 100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{proveedor.criterios_evaluacion.servicio}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Evaluado: {proveedor.fecha_evaluacion}
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle size={14} className={proveedor.incidentes_totales > 0 ? 'text-red-500' : 'text-slate-400'} />
                    Incidentes: {proveedor.incidentes_totales}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(proveedor)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(proveedor.id)}
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
                {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Proveedor *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_proveedor}
                    onChange={(e) => setFormData({...formData, nombre_proveedor: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Suministros Industriales SA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="materias_primas">Materias Primas</option>
                    <option value="servicios">Servicios</option>
                    <option value="logistica">Logística</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  Criterios de Evaluación (0-100)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Calidad</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.criterios.calidad}
                      onChange={(e) => setFormData({
                        ...formData,
                        criterios: { ...formData.criterios, calidad: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Entrega</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.criterios.entrega}
                      onChange={(e) => setFormData({
                        ...formData,
                        criterios: { ...formData.criterios, entrega: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.criterios.precio}
                      onChange={(e) => setFormData({
                        ...formData,
                        criterios: { ...formData.criterios, precio: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.criterios.servicio}
                      onChange={(e) => setFormData({
                        ...formData,
                        criterios: { ...formData.criterios, servicio: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Calificación Promedio:</span>
                  <span className="text-xl font-bold text-blue-600">{formData.calificacion_actual}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Evaluación *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_evaluacion}
                    onChange={(e) => setFormData({...formData, fecha_evaluacion: e.target.value})}
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
                    <option value="aprobado">Aprobado</option>
                    <option value="condicional">Condicional</option>
                    <option value="no_aprobado">No Aprobado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incidentes Totales</label>
                <input
                  type="number"
                  min="0"
                  value={formData.incidentes_totales}
                  onChange={(e) => setFormData({...formData, incidentes_totales: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={3}
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
