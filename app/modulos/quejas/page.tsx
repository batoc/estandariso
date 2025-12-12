'use client';

import { useState, useEffect } from 'react';
import { QuejaReclamo } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Smile,
  Frown,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';

export default function QuejasPage() {
  const [quejas, setQuejas] = useState<QuejaReclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<QuejaReclamo | null>(null);

  const [formData, setFormData] = useState({
    fecha_recepcion: new Date().toISOString().split('T')[0],
    tipo: 'queja',
    cliente: '',
    producto_servicio: '',
    descripcion: '',
    estado: 'abierta',
    fecha_resolucion: '',
    satisfaccion_resolucion: 0,
    acciones_tomadas: ''
  });

  useEffect(() => {
    fetchQuejas();
  }, []);

  const fetchQuejas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quejas_reclamos')
      .select('*')
      .order('fecha_recepcion', { ascending: false });

    if (!error && data) {
      setQuejas(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      satisfaccion_resolucion: formData.satisfaccion_resolucion || null,
      fecha_resolucion: formData.fecha_resolucion || null
    };

    if (editando) {
      const { error } = await supabase
        .from('quejas_reclamos')
        .update(dataToSave)
        .eq('id', editando.id);
      
      if (!error) {
        fetchQuejas();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('quejas_reclamos')
        .insert([dataToSave]);
      
      if (!error) {
        fetchQuejas();
        resetForm();
      }
    }
  };

  const handleEdit = (queja: QuejaReclamo) => {
    setEditando(queja);
    setFormData({
      fecha_recepcion: queja.fecha_recepcion,
      tipo: queja.tipo,
      cliente: queja.cliente,
      producto_servicio: queja.producto_servicio,
      descripcion: queja.descripcion,
      estado: queja.estado,
      fecha_resolucion: queja.fecha_resolucion || '',
      satisfaccion_resolucion: queja.satisfaccion_resolucion || 0,
      acciones_tomadas: queja.acciones_tomadas || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta queja/reclamo?')) {
      const { error } = await supabase
        .from('quejas_reclamos')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchQuejas();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_recepcion: new Date().toISOString().split('T')[0],
      tipo: 'queja',
      cliente: '',
      producto_servicio: '',
      descripcion: '',
      estado: 'abierta',
      fecha_resolucion: '',
      satisfaccion_resolucion: 0,
      acciones_tomadas: ''
    });
    setEditando(null);
    setShowForm(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'cerrada': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'en_proceso': return 'text-blue-600 bg-blue-50 border-blue-100';
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
            <h1 className="text-2xl font-bold text-slate-800">Quejas y Reclamos</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de feedback y satisfacción del cliente</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Queja
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Registros</p>
              <p className="text-2xl font-bold text-slate-800">{quejas.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Abiertas</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.filter(q => q.estado === 'abierta').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Resueltas</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.filter(q => q.estado === 'cerrada').length}
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
              <p className="text-sm font-medium text-slate-500">Satisfacción Prom.</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.filter(q => q.satisfaccion_resolucion).length > 0
                  ? (quejas.reduce((acc, q) => acc + (q.satisfaccion_resolucion || 0), 0) / quejas.filter(q => q.satisfaccion_resolucion).length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Smile className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Listado de Quejas y Reclamos</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente..."
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
        ) : quejas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay quejas o reclamos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha / Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente / Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Satisfacción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quejas.map((queja) => (
                  <tr key={queja.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{queja.fecha_recepcion}</div>
                      <div className="text-xs text-slate-500 capitalize">{queja.tipo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{queja.cliente}</div>
                      <div className="text-xs text-slate-500">{queja.producto_servicio}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 line-clamp-2 max-w-xs" title={queja.descripcion}>
                        {queja.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(queja.estado)}`}>
                        {queja.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {queja.satisfaccion_resolucion ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-700">{queja.satisfaccion_resolucion}</span>
                          <span className="text-slate-400">/ 5</span>
                          {queja.satisfaccion_resolucion >= 4 ? (
                            <Smile size={16} className="text-emerald-500 ml-1" />
                          ) : queja.satisfaccion_resolucion <= 2 ? (
                            <Frown size={16} className="text-red-500 ml-1" />
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(queja)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(queja.id)}
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
                {editando ? 'Editar Registro' : 'Nueva Queja/Reclamo'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Recepción *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_recepcion}
                    onChange={(e) => setFormData({...formData, fecha_recepcion: e.target.value})}
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
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="felicitacion">Felicitación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                  <input
                    type="text"
                    required
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Producto/Servicio *</label>
                  <input
                    type="text"
                    required
                    value={formData.producto_servicio}
                    onChange={(e) => setFormData({...formData, producto_servicio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Producto o servicio afectado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Detalle de la queja o reclamo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Tomadas</label>
                <textarea
                  rows={2}
                  value={formData.acciones_tomadas}
                  onChange={(e) => setFormData({...formData, acciones_tomadas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Acciones para resolver el caso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="abierta">Abierta</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
              </div>

              {formData.estado === 'cerrada' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <h4 className="font-medium text-slate-800">Cierre del Caso</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Resolución</label>
                      <input
                        type="date"
                        value={formData.fecha_resolucion}
                        onChange={(e) => setFormData({...formData, fecha_resolucion: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Satisfacción (1-5)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.satisfaccion_resolucion}
                          onChange={(e) => setFormData({...formData, satisfaccion_resolucion: parseInt(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-bold text-lg text-blue-600 w-8 text-center">{formData.satisfaccion_resolucion}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Muy insatisfecho</span>
                        <span>Muy satisfecho</span>
                      </div>
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
