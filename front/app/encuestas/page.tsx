'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
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
  Frown,
  Send,
  Link as LinkIcon
} from 'lucide-react';

export default function EncuestasSatisfaccionPage() {
  const [encuestas, setEncuestas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fecha_encuesta: new Date().toISOString().split('T')[0],
    periodo: '',
    cliente: '',
    tipo_cliente: 'usuario_final',
    metodo_aplicacion: 'email',
    calidad_producto: 5,
    servicio_atencion: 5,
    tiempos_entrega: 5,
    precio_valor: 5,
    comunicacion: 5,
    resolucion_problemas: 5,
    satisfaccion_general: 5,
    nps_score: 10,
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
    // Calcular satisfacción general promedio si no se establece manualmente
    const promedio = (
      Number(formData.calidad_producto) +
      Number(formData.servicio_atencion) +
      Number(formData.tiempos_entrega) +
      Number(formData.precio_valor) +
      Number(formData.comunicacion) +
      Number(formData.resolucion_problemas)
    ) / 6;
    
    setFormData(prev => ({
      ...prev,
      satisfaccion_general: Number(promedio.toFixed(1))
    }));
  }, [
    formData.calidad_producto,
    formData.servicio_atencion,
    formData.tiempos_entrega,
    formData.precio_valor,
    formData.comunicacion,
    formData.resolucion_problemas
  ]);

  const cargarEncuestas = async () => {
    try {
      const data = await pb.collection('encuestas_satisfaccion').getFullList({ sort: '-fecha_encuesta' });

      setEncuestas(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        calidad_producto: Number(formData.calidad_producto),
        servicio_atencion: Number(formData.servicio_atencion),
        tiempos_entrega: Number(formData.tiempos_entrega),
        precio_valor: Number(formData.precio_valor),
        comunicacion: Number(formData.comunicacion),
        resolucion_problemas: Number(formData.resolucion_problemas),
        satisfaccion_general: Number(formData.satisfaccion_general),
        nps_score: Number(formData.nps_score)
      };

      if (editingId) {
        await pb.collection('encuestas_satisfaccion').update(editingId, dataToSave);
      } else {
        await pb.collection('encuestas_satisfaccion').create(dataToSave);
      }
      cargarEncuestas();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  };

  const handleEdit = (encuesta: any) => {
    setEditingId(encuesta.id);
    setFormData({
      fecha_encuesta: encuesta.fecha_encuesta || new Date().toISOString().split('T')[0],
      periodo: encuesta.periodo || '',
      cliente: encuesta.cliente || '',
      tipo_cliente: encuesta.tipo_cliente || 'usuario_final',
      metodo_aplicacion: encuesta.metodo_aplicacion || 'email',
      calidad_producto: encuesta.calidad_producto || 5,
      servicio_atencion: encuesta.servicio_atencion || 5,
      tiempos_entrega: encuesta.tiempos_entrega || 5,
      precio_valor: encuesta.precio_valor || 5,
      comunicacion: encuesta.comunicacion || 5,
      resolucion_problemas: encuesta.resolucion_problemas || 5,
      satisfaccion_general: encuesta.satisfaccion_general || 5,
      nps_score: encuesta.nps_score || 10,
      comentarios: encuesta.comentarios || '',
      areas_mejora_identificadas: encuesta.areas_mejora_identificadas || '',
      responsable_seguimiento: encuesta.responsable_seguimiento || '',
      acciones_tomadas: encuesta.acciones_tomadas || '',
      estado: encuesta.estado || 'pendiente'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar encuesta?')) {
      await pb.collection('encuestas_satisfaccion').delete(id);
        cargarEncuestas();
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_encuesta: new Date().toISOString().split('T')[0],
      periodo: '',
      cliente: '',
      tipo_cliente: 'usuario_final',
      metodo_aplicacion: 'email',
      calidad_producto: 5,
      servicio_atencion: 5,
      tiempos_entrega: 5,
      precio_valor: 5,
      comunicacion: 5,
      resolucion_problemas: 5,
      satisfaccion_general: 5,
      nps_score: 10,
      comentarios: '',
      areas_mejora_identificadas: '',
      responsable_seguimiento: '',
      acciones_tomadas: '',
      estado: 'pendiente'
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Satisfacción del Cliente</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-7">Seguimiento y medición de la satisfacción (9.1.2)</p>
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
        <div className="card p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Encuestas</p>
              <p className="text-2xl font-bold text-slate-900">{encuestas.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Promedio Satisfacción</p>
              <p className="text-2xl font-bold text-slate-900">
                {encuestas.length > 0 
                  ? (encuestas.reduce((acc, curr) => acc + (curr.satisfaccion_general || 0), 0) / encuestas.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Star className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">NPS Promedio</p>
              <p className="text-2xl font-bold text-slate-900">
                {encuestas.length > 0 
                  ? Math.round(encuestas.reduce((acc, curr) => acc + (curr.nps_score || 0), 0) / encuestas.length)
                  : '0'}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pendientes Acción</p>
              <p className="text-2xl font-bold text-slate-900">
                {encuestas.filter(e => e.estado === 'pendiente' || e.estado === 'en_analisis').length}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <CheckCircle2 className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Encuestas</h3>
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
              Cargando encuestas...
            </div>
          </div>
        ) : encuestas.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay encuestas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Satisfacción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NPS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {encuestas.map((encuesta) => (
                  <tr key={encuesta.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{encuesta.fecha_encuesta}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{encuesta.cliente}</span>
                        <span className="text-xs text-slate-500">{encuesta.tipo_cliente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                        <span className="text-sm font-bold text-slate-700">{encuesta.satisfaccion_general}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        encuesta.nps_score >= 9 ? 'bg-emerald-100 text-emerald-700' :
                        encuesta.nps_score >= 7 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {encuesta.nps_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        encuesta.estado === 'cerrada' ? 'bg-emerald-100 text-emerald-700' :
                        encuesta.estado === 'con_acciones' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {encuesta.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(encuesta)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(encuesta.id)}
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
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={resetForm} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slide-in">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? 'Editar Encuesta' : 'Nueva Encuesta'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Encuesta</label>
                  <input
                    type="date"
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
                    placeholder="Ej: Q1-2024"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Cliente</label>
                  <select
                    value={formData.tipo_cliente}
                    onChange={(e) => setFormData({...formData, tipo_cliente: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="usuario_final">Usuario Final</option>
                    <option value="distribuidor">Distribuidor</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="gobierno">Gobierno</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 mb-4">Evaluación (1-5)</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Calidad Producto</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.calidad_producto}
                      onChange={(e) => setFormData({...formData, calidad_producto: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Servicio Atención</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.servicio_atencion}
                      onChange={(e) => setFormData({...formData, servicio_atencion: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiempos Entrega</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.tiempos_entrega}
                      onChange={(e) => setFormData({...formData, tiempos_entrega: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio / Valor</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.precio_valor}
                      onChange={(e) => setFormData({...formData, precio_valor: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Satisfacción General (Calc)</label>
                  <input
                    type="number"
                    value={formData.satisfaccion_general}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NPS Score (-100 a 100)</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={formData.nps_score}
                    onChange={(e) => setFormData({...formData, nps_score: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios</label>
                <textarea
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Áreas de Mejora</label>
                <textarea
                  value={formData.areas_mejora_identificadas}
                  onChange={(e) => setFormData({...formData, areas_mejora_identificadas: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_analisis">En Análisis</option>
                    <option value="con_acciones">Con Acciones</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable Seguimiento</label>
                  <input
                    type="text"
                    value={formData.responsable_seguimiento}
                    onChange={(e) => setFormData({...formData, responsable_seguimiento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
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
        </>
      )}
    </div>
  );
}
