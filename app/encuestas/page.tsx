'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  CheckCircle2,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  BarChart2,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

interface EncuestaSatisfaccion {
  id: number;
  created_at: string;
  fecha_encuesta: string;
  periodo?: string;
  cliente: string;
  tipo_cliente?: string;
  metodo_aplicacion?: string;
  calidad_producto?: number;
  servicio_atencion?: number;
  tiempos_entrega?: number;
  precio_valor?: number;
  comunicacion?: number;
  resolucion_problemas?: number;
  satisfaccion_general?: number;
  nps_score?: number;
  comentarios?: string;
  areas_mejora_identificadas?: string;
  responsable_seguimiento?: string;
  acciones_tomadas?: string;
  estado: string;
}

export default function EncuestasSatisfaccionPage() {
  const [encuestas, setEncuestas] = useState<EncuestaSatisfaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fecha_encuesta: new Date().toISOString().split('T')[0],
    periodo: '',
    cliente: '',
    tipo_cliente: 'recurrente',
    metodo_aplicacion: 'online',
    calidad_producto: 0,
    servicio_atencion: 0,
    tiempos_entrega: 0,
    precio_valor: 0,
    comunicacion: 0,
    resolucion_problemas: 0,
    satisfaccion_general: 0,
    nps_score: 0,
    comentarios: '',
    areas_mejora_identificadas: '',
    responsable_seguimiento: '',
    acciones_tomadas: '',
    estado: 'pendiente'
  });

  useEffect(() => {
    cargarEncuestas();
  }, []);

  useEffect(() => {
    // Calcular satisfacción general automáticamente si no se ingresa manualmente
    const { calidad_producto, servicio_atencion, tiempos_entrega, precio_valor, comunicacion, resolucion_problemas } = formData;
    const valores = [calidad_producto, servicio_atencion, tiempos_entrega, precio_valor, comunicacion, resolucion_problemas].filter(v => v > 0);
    
    if (valores.length > 0) {
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      setFormData(prev => ({ ...prev, satisfaccion_general: parseFloat(promedio.toFixed(1)) }));
    }
  }, [formData.calidad_producto, formData.servicio_atencion, formData.tiempos_entrega, formData.precio_valor, formData.comunicacion, formData.resolucion_problemas]);

  const cargarEncuestas = async () => {
    try {
      const { data, error } = await supabase
        .from('encuestas_satisfaccion')
        .select('*')
        .order('fecha_encuesta', { ascending: false });

      if (error) throw error;
      setEncuestas(data || []);
    } catch (error) {
      console.error('Error cargando encuestas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('encuestas_satisfaccion')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('encuestas_satisfaccion')
          .insert([formData]);
        if (error) throw error;
      }
      
      await cargarEncuestas();
      resetForm();
    } catch (error) {
      console.error('Error guardando encuesta:', error);
      alert('Error al guardar la encuesta');
    }
  };

  const handleEdit = (encuesta: EncuestaSatisfaccion) => {
    setEditingId(encuesta.id);
    setFormData({
      fecha_encuesta: encuesta.fecha_encuesta,
      periodo: encuesta.periodo || '',
      cliente: encuesta.cliente,
      tipo_cliente: encuesta.tipo_cliente || 'recurrente',
      metodo_aplicacion: encuesta.metodo_aplicacion || 'online',
      calidad_producto: encuesta.calidad_producto || 0,
      servicio_atencion: encuesta.servicio_atencion || 0,
      tiempos_entrega: encuesta.tiempos_entrega || 0,
      precio_valor: encuesta.precio_valor || 0,
      comunicacion: encuesta.comunicacion || 0,
      resolucion_problemas: encuesta.resolucion_problemas || 0,
      satisfaccion_general: encuesta.satisfaccion_general || 0,
      nps_score: encuesta.nps_score || 0,
      comentarios: encuesta.comentarios || '',
      areas_mejora_identificadas: encuesta.areas_mejora_identificadas || '',
      responsable_seguimiento: encuesta.responsable_seguimiento || '',
      acciones_tomadas: encuesta.acciones_tomadas || '',
      estado: encuesta.estado
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta encuesta?')) return;
    
    try {
      const { error } = await supabase
        .from('encuestas_satisfaccion')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      cargarEncuestas();
    } catch (error) {
      console.error('Error eliminando encuesta:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_encuesta: new Date().toISOString().split('T')[0],
      periodo: '',
      cliente: '',
      tipo_cliente: 'recurrente',
      metodo_aplicacion: 'online',
      calidad_producto: 0,
      servicio_atencion: 0,
      tiempos_entrega: 0,
      precio_valor: 0,
      comunicacion: 0,
      resolucion_problemas: 0,
      satisfaccion_general: 0,
      nps_score: 0,
      comentarios: '',
      areas_mejora_identificadas: '',
      responsable_seguimiento: '',
      acciones_tomadas: '',
      estado: 'pendiente'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getSatisfaccionColor = (valor: number) => {
    if (valor >= 4.5) return 'text-emerald-600';
    if (valor >= 3.5) return 'text-blue-600';
    if (valor >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getNPSColor = (valor: number) => {
    if (valor >= 9) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (valor >= 7) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Encuestas de Satisfacción</h1>
          </div>
          <p className="text-slate-500 ml-7">Medición de la percepción del cliente y NPS</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Encuesta
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Encuestas</p>
              <p className="text-2xl font-bold text-slate-800">{encuestas.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Satisfacción Prom.</p>
              <p className="text-2xl font-bold text-slate-800">
                {encuestas.length > 0
                  ? (encuestas.reduce((acc, e) => acc + (e.satisfaccion_general || 0), 0) / encuestas.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Star className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">NPS Promedio</p>
              <p className="text-2xl font-bold text-slate-800">
                {encuestas.length > 0
                  ? (encuestas.reduce((acc, e) => acc + (e.nps_score || 0), 0) / encuestas.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pendientes Acción</p>
              <p className="text-2xl font-bold text-slate-800">
                {encuestas.filter(e => e.estado === 'pendiente').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CheckCircle2 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Resultados de Encuestas</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando encuestas...
            </div>
          </div>
        ) : encuestas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay encuestas registradas
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {encuestas.map((encuesta) => (
              <div key={encuesta.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg">{encuesta.cliente}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
                        {encuesta.tipo_cliente}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {encuesta.fecha_encuesta}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1 font-bold text-lg ${getSatisfaccionColor(encuesta.satisfaccion_general || 0)}`}>
                      <Star size={20} fill="currentColor" />
                      {encuesta.satisfaccion_general}
                    </div>
                    <span className="text-xs text-slate-400">Satisfacción</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 mb-1">NPS Score</span>
                    <span className={`px-2 py-0.5 text-sm font-bold rounded-full border ${getNPSColor(encuesta.nps_score || 0)}`}>
                      {encuesta.nps_score}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 mb-1">Estado</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                      encuesta.estado === 'completado' ? 'text-emerald-600 bg-emerald-100' : 'text-amber-600 bg-amber-100'
                    }`}>
                      {encuesta.estado}
                    </span>
                  </div>
                </div>

                {encuesta.comentarios && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">Comentarios:</p>
                    <p className="text-sm text-slate-600 line-clamp-2 italic">"{encuesta.comentarios}"</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(encuesta)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(encuesta.id)}
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
                {editingId ? 'Editar Encuesta' : 'Nueva Encuesta'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Cliente</label>
                  <select
                    value={formData.tipo_cliente}
                    onChange={(e) => setFormData({...formData, tipo_cliente: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="recurrente">Recurrente</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Encuesta *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_encuesta}
                    onChange={(e) => setFormData({...formData, fecha_encuesta: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
                  <input
                    type="text"
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Q1-2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
                  <select
                    value={formData.metodo_aplicacion}
                    onChange={(e) => setFormData({...formData, metodo_aplicacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                    <option value="telefonica">Telefónica</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  Evaluación (1-5)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Calidad Producto', key: 'calidad_producto' },
                    { label: 'Servicio Atención', key: 'servicio_atencion' },
                    { label: 'Tiempos Entrega', key: 'tiempos_entrega' },
                    { label: 'Precio / Valor', key: 'precio_valor' },
                    { label: 'Comunicación', key: 'comunicacion' },
                    { label: 'Resolución Problemas', key: 'resolucion_problemas' }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{item.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData[item.key as keyof typeof formData] as number}
                        onChange={(e) => setFormData({
                          ...formData,
                          [item.key]: parseFloat(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Satisfacción General:</span>
                  <span className="text-xl font-bold text-blue-600">{formData.satisfaccion_general}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NPS Score (0-10)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={formData.nps_score}
                      onChange={(e) => setFormData({...formData, nps_score: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className={`font-bold text-lg w-8 text-center rounded ${getNPSColor(formData.nps_score)}`}>
                      {formData.nps_score}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios del Cliente</label>
                <textarea
                  rows={2}
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Opiniones textuales..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Áreas de Mejora</label>
                  <textarea
                    rows={2}
                    value={formData.areas_mejora_identificadas}
                    onChange={(e) => setFormData({...formData, areas_mejora_identificadas: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Oportunidades detectadas..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Tomadas</label>
                  <textarea
                    rows={2}
                    value={formData.acciones_tomadas}
                    onChange={(e) => setFormData({...formData, acciones_tomadas: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Seguimiento realizado..."
                  />
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
