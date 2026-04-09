'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
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
  const [quejas, setQuejas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    const data = await pb.collection('quejas_reclamos').getFullList({ sort: '-fecha_recepcion' });

    setQuejas(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      satisfaccion_resolucion: Number(formData.satisfaccion_resolucion) || null,
      fecha_resolucion: formData.fecha_resolucion || null
    };

    if (editingId) {
      await pb.collection('quejas_reclamos').update(editingId, dataToSave);
      
        fetchQuejas();
        resetForm();
    } else {
      await pb.collection('quejas_reclamos').create(dataToSave);
      
        fetchQuejas();
        resetForm();
    }
  };

  const handleEdit = (queja: any) => {
    setEditingId(queja.id);
    setFormData({
      fecha_recepcion: queja.fecha_recepcion || new Date().toISOString().split('T')[0],
      tipo: queja.tipo || 'queja',
      cliente: queja.cliente || '',
      producto_servicio: queja.producto_servicio || '',
      descripcion: queja.descripcion || '',
      estado: queja.estado || 'abierta',
      fecha_resolucion: queja.fecha_resolucion || '',
      satisfaccion_resolucion: queja.satisfaccion_resolucion || 0,
      acciones_tomadas: queja.acciones_tomadas || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro?')) {
      await pb.collection('quejas_reclamos').delete(id);
        fetchQuejas();
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
            <h1 className="text-2xl font-bold text-slate-800">PQRS (Quejas y Reclamos)</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión de la satisfacción del cliente (9.1.2, 10.2)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva PQRS
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
        <div className="card p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Quejas Abiertas</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.filter(q => q.tipo === 'queja' && q.estado !== 'cerrada').length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <AlertCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Resueltas</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.filter(q => q.estado === 'resuelta' || q.estado === 'cerrada').length}
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
              <p className="text-sm font-medium text-slate-500">Satisfacción Prom.</p>
              <p className="text-2xl font-bold text-slate-800">
                {quejas.length > 0 
                  ? (quejas.reduce((acc, curr) => acc + (curr.satisfaccion_resolucion || 0), 0) / quejas.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <ThumbsUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de PQRS</h3>
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
        ) : quejas.length === 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quejas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{item.fecha_recepcion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                        item.tipo === 'queja' ? 'bg-red-100 text-red-700' :
                        item.tipo === 'reclamo' ? 'bg-orange-100 text-orange-700' :
                        item.tipo === 'felicitacion' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{item.cliente}</span>
                        <span className="text-xs text-slate-500">{item.producto_servicio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-2">{item.descripcion}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.estado === 'cerrada' || item.estado === 'resuelta' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado === 'en_analisis' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
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
                {editingId ? 'Editar Registro' : 'Nueva PQRS'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Recepción</label>
                  <input
                    type="date"
                    value={formData.fecha_recepcion}
                    onChange={(e) => setFormData({...formData, fecha_recepcion: e.target.value})}
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
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="felicitacion">Felicitación</option>
                  </select>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Producto / Servicio</label>
                  <input
                    type="text"
                    value={formData.producto_servicio}
                    onChange={(e) => setFormData({...formData, producto_servicio: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Tomadas</label>
                <textarea
                  value={formData.acciones_tomadas}
                  onChange={(e) => setFormData({...formData, acciones_tomadas: e.target.value})}
                  rows={3}
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
                    <option value="abierta">Abierta</option>
                    <option value="en_analisis">En Análisis</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Resolución</label>
                  <input
                    type="date"
                    value={formData.fecha_resolucion}
                    onChange={(e) => setFormData({...formData, fecha_resolucion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Satisfacción con Resolución (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.satisfaccion_resolucion}
                  onChange={(e) => setFormData({...formData, satisfaccion_resolucion: Number(e.target.value)})}
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
