'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  BarChart2,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
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

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    nombre_indicador: '',
    categoria: 'calidad',
    valor_actual: 0,
    valor_meta: 0,
    unidad_medida: '%',
    cumplimiento: 0,
    tendencia: 'estable',
    responsable: ''
  });

  useEffect(() => {
    fetchIndicadores();
  }, []);

  const fetchIndicadores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('indicadores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIndicadores(data || []);
    } catch (error) {
      console.error('Error fetching indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular cumplimiento automático si es posible
    let cumplimientoCalc = Number(formData.cumplimiento);
    if (formData.valor_meta > 0 && cumplimientoCalc === 0) {
        cumplimientoCalc = (Number(formData.valor_actual) / Number(formData.valor_meta)) * 100;
    }

    const dataToSave = {
      ...formData,
      valor_actual: Number(formData.valor_actual),
      valor_meta: Number(formData.valor_meta),
      cumplimiento: cumplimientoCalc
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('indicadores')
          .update(dataToSave)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('indicadores')
          .insert([dataToSave]);
        if (error) throw error;
      }
      fetchIndicadores();
      resetForm();
    } catch (error) {
      console.error('Error saving indicador:', error);
      alert('Error al guardar el indicador');
    }
  };

  const handleEdit = (indicador: any) => {
    setEditingId(indicador.id);
    setFormData({
      periodo: indicador.periodo || new Date().toISOString().slice(0, 7),
      nombre_indicador: indicador.nombre_indicador || '',
      categoria: indicador.categoria || 'calidad',
      valor_actual: indicador.valor_actual || 0,
      valor_meta: indicador.valor_meta || 0,
      unidad_medida: indicador.unidad_medida || '%',
      cumplimiento: indicador.cumplimiento || 0,
      tendencia: indicador.tendencia || 'estable',
      responsable: indicador.responsable || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este registro?')) {
      const { error } = await supabase.from('indicadores').delete().eq('id', id);
      if (!error) fetchIndicadores();
    }
  };

  const resetForm = () => {
    setFormData({
      periodo: new Date().toISOString().slice(0, 7),
      nombre_indicador: '',
      categoria: 'calidad',
      valor_actual: 0,
      valor_meta: 0,
      unidad_medida: '%',
      cumplimiento: 0,
      tendencia: 'estable',
      responsable: ''
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
            <h1 className="text-2xl font-bold text-slate-800">Indicadores de Gestión</h1>
          </div>
          <p className="text-slate-500 ml-7">Seguimiento y medición del desempeño (9.1)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Indicador
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Indicadores</p>
              <p className="text-2xl font-bold text-slate-800">{indicadores.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cumplimiento Prom.</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.length > 0 
                  ? (indicadores.reduce((acc, curr) => acc + (curr.cumplimiento || 0), 0) / indicadores.length).toFixed(1)
                  : '0.0'}%
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Target className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Mejorando</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.filter(i => i.tendencia === 'mejora').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Críticos</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.filter(i => i.tendencia === 'deterioro' || (i.cumplimiento && i.cumplimiento < 80)).length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <TrendingDown className="text-rose-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Tablero de Control</h3>
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
        ) : indicadores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Indicador</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Meta / Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cumplimiento</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {indicadores.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{item.periodo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{item.nombre_indicador}</span>
                        <span className="text-xs text-slate-500">{item.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                        item.categoria === 'calidad' ? 'bg-blue-100 text-blue-700' :
                        item.categoria === 'produccion' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        <span className="font-medium">{item.valor_actual}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span>{item.valor_meta} {item.unidad_medida}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              (item.cumplimiento || 0) >= 100 ? 'bg-emerald-500' :
                              (item.cumplimiento || 0) >= 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(item.cumplimiento || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{Number(item.cumplimiento).toFixed(1)}%</span>
                        {item.tendencia === 'mejora' && <TrendingUp size={14} className="text-emerald-500" />}
                        {item.tendencia === 'deterioro' && <TrendingDown size={14} className="text-red-500" />}
                        {item.tendencia === 'estable' && <Minus size={14} className="text-slate-400" />}
                      </div>
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
                {editingId ? 'Editar Indicador' : 'Nuevo Indicador'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
                  <input
                    type="month"
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
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
                    <option value="calidad">Calidad</option>
                    <option value="produccion">Producción</option>
                    <option value="ventas">Ventas</option>
                    <option value="satisfaccion">Satisfacción</option>
                    <option value="rrhh">RRHH</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Indicador</label>
                  <input
                    type="text"
                    value={formData.nombre_indicador}
                    onChange={(e) => setFormData({...formData, nombre_indicador: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Meta</label>
                  <input
                    type="number"
                    value={formData.valor_meta}
                    onChange={(e) => setFormData({...formData, valor_meta: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Actual</label>
                  <input
                    type="number"
                    value={formData.valor_actual}
                    onChange={(e) => setFormData({...formData, valor_actual: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <input
                    type="text"
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cumplimiento (%)</label>
                  <input
                    type="number"
                    value={formData.cumplimiento}
                    onChange={(e) => setFormData({...formData, cumplimiento: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tendencia</label>
                  <select
                    value={formData.tendencia}
                    onChange={(e) => setFormData({...formData, tendencia: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="mejora">Mejora</option>
                    <option value="estable">Estable</option>
                    <option value="deterioro">Deterioro</option>
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
