'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  ShieldAlert,
  Lightbulb,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  X,
  Save,
  Loader2,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Activity
} from 'lucide-react';

export default function RiesgosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const [formData, setFormData] = useState({
    codigo: '',
    fecha_identificacion: new Date().toISOString().split('T')[0],
    tipo: 'riesgo',
    categoria: 'operacional',
    descripcion: '',
    proceso_relacionado: '',
    probabilidad: 3,
    impacto: 3,
    acciones_planificadas: '',
    responsable: '',
    estado: 'activo'
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const { data, error } = await supabase.from('riesgos_oportunidades').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nivelRiesgo = formData.probabilidad * formData.impacto;
    const clasificacion = nivelRiesgo <= 6 ? 'bajo' : nivelRiesgo <= 12 ? 'medio' : nivelRiesgo <= 18 ? 'alto' : 'critico';
    
    try {
      const dataToSave = { ...formData, nivel_riesgo: nivelRiesgo, clasificacion_nivel: clasificacion };
      
      if (editingId) {
        const { error } = await supabase.from('riesgos_oportunidades').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('riesgos_oportunidades').insert([dataToSave]);
        if (error) throw error;
      }
      await cargar();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar?')) return;
    try {
      const { error } = await supabase.from('riesgos_oportunidades').delete().eq('id', id);
      if (error) throw error;
      await cargar();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function handleEdit(item: any) {
    setFormData({
      codigo: item.codigo || '',
      fecha_identificacion: item.fecha_identificacion,
      tipo: item.tipo,
      categoria: item.categoria || 'operacional',
      descripcion: item.descripcion,
      proceso_relacionado: item.proceso_relacionado || '',
      probabilidad: item.probabilidad || 3,
      impacto: item.impacto || 3,
      acciones_planificadas: item.acciones_planificadas,
      responsable: item.responsable,
      estado: item.estado
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      codigo: '',
      fecha_identificacion: new Date().toISOString().split('T')[0],
      tipo: 'riesgo',
      categoria: 'operacional',
      descripcion: '',
      proceso_relacionado: '',
      probabilidad: 3,
      impacto: 3,
      acciones_planificadas: '',
      responsable: '',
      estado: 'activo'
    });
    setEditingId(null);
    setShowForm(false);
  }

  const getClasificacionColor = (clasificacion: string) => {
    switch (clasificacion) {
      case 'critico': return 'text-red-600 bg-red-50 border-red-100';
      case 'alto': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medio': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'bajo': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredItems = filtroTipo === 'todos' ? items : items.filter(i => i.tipo === filtroTipo);

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Riesgos y Oportunidades</h1>
          </div>
          <p className="text-slate-500 ml-7">Gestión basada en riesgos según ISO 9001:2015</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Registro
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Registros</p>
              <p className="text-2xl font-bold text-slate-800">{items.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Riesgos Altos</p>
              <p className="text-2xl font-bold text-slate-800">
                {items.filter(i => i.tipo === 'riesgo' && (i.clasificacion_nivel === 'alto' || i.clasificacion_nivel === 'critico')).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <ShieldAlert className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Oportunidades</p>
              <p className="text-2xl font-bold text-slate-800">
                {items.filter(i => i.tipo === 'oportunidad').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Lightbulb className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Activos</p>
              <p className="text-2xl font-bold text-slate-800">
                {items.filter(i => i.estado === 'activo').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800">Matriz de Riesgos</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFiltroTipo('todos')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('riesgo')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'riesgo' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Riesgos
              </button>
              <button
                onClick={() => setFiltroTipo('oportunidad')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${filtroTipo === 'oportunidad' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Oportunidades
              </button>
            </div>
          </div>
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
              Cargando matriz...
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros que coincidan con el filtro
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border uppercase ${
                        item.tipo === 'riesgo' ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      }`}>
                        {item.tipo}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${getClasificacionColor(item.clasificacion_nivel)} uppercase`}>
                        {item.clasificacion_nivel}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 line-clamp-2">{item.descripcion}</h4>
                  </div>
                  <div className="ml-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {item.tipo === 'riesgo' ? <ShieldAlert size={20} className="text-red-500" /> : <Lightbulb size={20} className="text-emerald-500" />}
                  </div>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-slate-400 mb-1">Prob.</p>
                      <p className="font-bold text-slate-700">{item.probabilidad}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-slate-400 mb-1">Imp.</p>
                      <p className="font-bold text-slate-700">{item.impacto}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-slate-400 mb-1">Nivel</p>
                      <p className="font-bold text-slate-700">{item.nivel_riesgo}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-600 mb-1">Acciones Planificadas</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.acciones_planificadas}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {item.responsable || 'Sin asignar'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {item.fecha_identificacion}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
                {editingId ? 'Editar Registro' : 'Nuevo Registro'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="riesgo">Riesgo</option>
                    <option value="oportunidad">Oportunidad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. R-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Descripción detallada del riesgo u oportunidad..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="operacional">Operacional</option>
                    <option value="estrategico">Estratégico</option>
                    <option value="financiero">Financiero</option>
                    <option value="cumplimiento">Cumplimiento</option>
                    <option value="tecnologico">Tecnológico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Relacionado</label>
                  <input
                    type="text"
                    value={formData.proceso_relacionado}
                    onChange={(e) => setFormData({...formData, proceso_relacionado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Evaluación (1-5)</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Probabilidad</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.probabilidad}
                      onChange={(e) => setFormData({...formData, probabilidad: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Baja (1)</span>
                      <span>Alta (5)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Impacto</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.impacto}
                      onChange={(e) => setFormData({...formData, impacto: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Bajo (1)</span>
                      <span>Alto (5)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-slate-600">Nivel Calculado: </span>
                  <span className="font-bold text-lg text-slate-800">{formData.probabilidad * formData.impacto}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Planificadas</label>
                <textarea
                  rows={3}
                  value={formData.acciones_planificadas}
                  onChange={(e) => setFormData({...formData, acciones_planificadas: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Medidas para mitigar el riesgo o aprovechar la oportunidad..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="activo">Activo</option>
                    <option value="cerrado">Cerrado</option>
                    <option value="monitoreo">En Monitoreo</option>
                  </select>
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
