'use client';

import { useState, useEffect } from 'react';
import { Indicador } from '@/lib/types';
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
  ArrowLeft
} from 'lucide-react';

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Indicador | null>(null);

  const [formData, setFormData] = useState({
    periodo: 'Q4-2024',
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

  useEffect(() => {
    // Calcular cumplimiento automáticamente
    if (formData.valor_meta > 0) {
      const cumplimiento = (formData.valor_actual / formData.valor_meta) * 100;
      setFormData(prev => ({ ...prev, cumplimiento: parseFloat(cumplimiento.toFixed(2)) }));
    }
  }, [formData.valor_actual, formData.valor_meta]);

  const fetchIndicadores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('indicadores')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setIndicadores(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editando) {
      const { error } = await supabase
        .from('indicadores')
        .update(formData)
        .eq('id', editando.id);
      
      if (!error) {
        fetchIndicadores();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('indicadores')
        .insert([formData]);
      
      if (!error) {
        fetchIndicadores();
        resetForm();
      }
    }
  };

  const handleEdit = (indicador: Indicador) => {
    setEditando(indicador);
    setFormData({
      periodo: indicador.periodo,
      nombre_indicador: indicador.nombre_indicador,
      categoria: indicador.categoria,
      valor_actual: indicador.valor_actual,
      valor_meta: indicador.valor_meta,
      unidad_medida: indicador.unidad_medida,
      cumplimiento: indicador.cumplimiento,
      tendencia: indicador.tendencia,
      responsable: indicador.responsable
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este indicador?')) {
      const { error } = await supabase
        .from('indicadores')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchIndicadores();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      periodo: 'Q4-2024',
      nombre_indicador: '',
      categoria: 'calidad',
      valor_actual: 0,
      valor_meta: 0,
      unidad_medida: '%',
      cumplimiento: 0,
      tendencia: 'estable',
      responsable: ''
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Indicadores</h1>
          </div>
          <p className="text-slate-500 ml-7">Seguimiento y medición del desempeño del SGC</p>
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
              <BarChart2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cumpliendo Meta</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.filter(i => i.cumplimiento >= 100).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Target className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Riesgo</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.filter(i => i.cumplimiento >= 90 && i.cumplimiento < 100).length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Críticos</p>
              <p className="text-2xl font-bold text-slate-800">
                {indicadores.filter(i => i.cumplimiento < 90).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Indicadores Registrados</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar indicador..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando indicadores...
            </div>
          </div>
        ) : indicadores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay indicadores registrados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {indicadores.map((indicador) => (
              <div key={indicador.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 line-clamp-2">{indicador.nombre_indicador}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {indicador.responsable}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {indicador.periodo}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    {indicador.tendencia === 'mejora' ? (
                      <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                        <TrendingUp size={20} />
                      </div>
                    ) : indicador.tendencia === 'deterioro' ? (
                      <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                        <TrendingDown size={20} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        <Minus size={20} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Actual</p>
                    <p className="text-xl font-bold text-slate-800">
                      {indicador.valor_actual} <span className="text-sm font-normal text-slate-500">{indicador.unidad_medida}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Meta</p>
                    <p className="text-xl font-bold text-slate-600">
                      {indicador.valor_meta} <span className="text-sm font-normal text-slate-500">{indicador.unidad_medida}</span>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Cumplimiento</span>
                    <span className={`font-bold ${
                      indicador.cumplimiento >= 100 ? 'text-emerald-600' : 
                      indicador.cumplimiento >= 90 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {indicador.cumplimiento.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        indicador.cumplimiento >= 100 ? 'bg-emerald-500' : 
                        indicador.cumplimiento >= 90 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(indicador.cumplimiento, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(indicador)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(indicador.id)}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editando ? 'Editar Indicador' : 'Nuevo Indicador'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Indicador *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_indicador}
                  onChange={(e) => setFormData({...formData, nombre_indicador: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. Satisfacción del Cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="calidad">Calidad</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="ambiental">Ambiental</option>
                    <option value="operativo">Operativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo *</label>
                  <input
                    type="text"
                    required
                    value={formData.periodo}
                    onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ej. Q4-2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Actual *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor_actual}
                    onChange={(e) => setFormData({...formData, valor_actual: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Meta *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor_meta}
                    onChange={(e) => setFormData({...formData, valor_meta: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida *</label>
                  <input
                    type="text"
                    required
                    placeholder="%, unidades, días, etc."
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cumplimiento (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cumplimiento}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tendencia *</label>
                  <select
                    required
                    value={formData.tendencia}
                    onChange={(e) => setFormData({...formData, tendencia: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="mejora">Mejora</option>
                    <option value="estable">Estable</option>
                    <option value="deterioro">Deterioro</option>
                  </select>
                </div>
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
                  {editando ? 'Actualizar Indicador' : 'Guardar Indicador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
