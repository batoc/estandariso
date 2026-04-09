'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import {
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
  Target,
  Zap,
  BarChart2
} from 'lucide-react';

export default function OportunidadesPage() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    fecha_identificacion: new Date().toISOString().split('T')[0],
    tipo: 'oportunidad',
    categoria: 'estrategico',
    origen: '',
    descripcion: '',
    causa_origen: '',
    proceso_relacionado: '',
    contexto: '',
    probabilidad: 1,
    impacto: 1,
    nivel_riesgo: 1,
    clasificacion_nivel: 'bajo',
    partes_interesadas: '', // Array as string
    estrategia: 'explotar',
    acciones_planificadas: '',
    controles_existentes: '',
    controles_adicionales: '',
    responsable: '',
    area_responsable: '',
    recursos_necesarios: '',
    costo_estimado: 0,
    fecha_implementacion: '',
    plazo_implementacion: '',
    indicadores_seguimiento: '',
    frecuencia_revision: 'mensual',
    fecha_ultima_revision: '',
    estado_implementacion: 'identificado',
    fecha_evaluacion_eficacia: '',
    evaluado_por: '',
    eficacia_acciones: '',
    nivel_riesgo_residual: 0
  });

  useEffect(() => {
    fetchOportunidades();
  }, []);

  useEffect(() => {
    const nivel = formData.probabilidad * formData.impacto;
    let clasificacion = 'bajo';
    if (nivel >= 15) clasificacion = 'critico';
    else if (nivel >= 10) clasificacion = 'alto';
    else if (nivel >= 5) clasificacion = 'medio';
    
    setFormData(prev => ({ 
      ...prev, 
      nivel_riesgo: nivel,
      clasificacion_nivel: clasificacion
    }));
  }, [formData.probabilidad, formData.impacto]);

  const fetchOportunidades = async () => {
    setLoading(true);
    try {
      const data = await pb.collection('riesgos_oportunidades').getFullList({ filter: 'tipo = "oportunidad"', sort: '-created' });

      setOportunidades(data || []);
    } catch (error) {
      console.error('Error fetching oportunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        tipo: 'oportunidad',
        partes_interesadas: formData.partes_interesadas.split(',').map(s => s.trim()).filter(Boolean),
        fecha_implementacion: formData.fecha_implementacion || null,
        fecha_ultima_revision: formData.fecha_ultima_revision || null,
        fecha_evaluacion_eficacia: formData.fecha_evaluacion_eficacia || null,
        costo_estimado: Number(formData.costo_estimado),
        nivel_riesgo_residual: Number(formData.nivel_riesgo_residual)
      };

      if (editingId) {
        await pb.collection('riesgos_oportunidades').update(editingId, dataToSave);
      } else {
        await pb.collection('riesgos_oportunidades').create(dataToSave);
      }
      fetchOportunidades();
      resetForm();
    } catch (error) {
      console.error('Error saving oportunidad:', error);
      alert('Error al guardar la oportunidad');
    }
  };

  const handleEdit = (oportunidad: any) => {
    setEditingId(oportunidad.id);
    setFormData({
      codigo: oportunidad.codigo || '',
      fecha_identificacion: oportunidad.fecha_identificacion || new Date().toISOString().split('T')[0],
      tipo: 'oportunidad',
      categoria: oportunidad.categoria || 'estrategico',
      origen: oportunidad.origen || '',
      descripcion: oportunidad.descripcion || '',
      causa_origen: oportunidad.causa_origen || '',
      proceso_relacionado: oportunidad.proceso_relacionado || '',
      contexto: oportunidad.contexto || '',
      probabilidad: oportunidad.probabilidad || 1,
      impacto: oportunidad.impacto || 1,
      nivel_riesgo: oportunidad.nivel_riesgo || 1,
      clasificacion_nivel: oportunidad.clasificacion_nivel || 'bajo',
      partes_interesadas: Array.isArray(oportunidad.partes_interesadas) ? oportunidad.partes_interesadas.join(', ') : '',
      estrategia: oportunidad.estrategia || 'explotar',
      acciones_planificadas: oportunidad.acciones_planificadas || '',
      controles_existentes: oportunidad.controles_existentes || '',
      controles_adicionales: oportunidad.controles_adicionales || '',
      responsable: oportunidad.responsable || '',
      area_responsable: oportunidad.area_responsable || '',
      recursos_necesarios: oportunidad.recursos_necesarios || '',
      costo_estimado: oportunidad.costo_estimado || 0,
      fecha_implementacion: oportunidad.fecha_implementacion || '',
      plazo_implementacion: oportunidad.plazo_implementacion || '',
      indicadores_seguimiento: oportunidad.indicadores_seguimiento || '',
      frecuencia_revision: oportunidad.frecuencia_revision || 'mensual',
      fecha_ultima_revision: oportunidad.fecha_ultima_revision || '',
      estado_implementacion: oportunidad.estado_implementacion || 'identificado',
      fecha_evaluacion_eficacia: oportunidad.fecha_evaluacion_eficacia || '',
      evaluado_por: oportunidad.evaluado_por || '',
      eficacia_acciones: oportunidad.eficacia_acciones || '',
      nivel_riesgo_residual: oportunidad.nivel_riesgo_residual || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar oportunidad?')) {
      await pb.collection('riesgos_oportunidades').delete(id);
        fetchOportunidades();
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      fecha_identificacion: new Date().toISOString().split('T')[0],
      tipo: 'oportunidad',
      categoria: 'estrategico',
      origen: '',
      descripcion: '',
      causa_origen: '',
      proceso_relacionado: '',
      contexto: '',
      probabilidad: 1,
      impacto: 1,
      nivel_riesgo: 1,
      clasificacion_nivel: 'bajo',
      partes_interesadas: '',
      estrategia: 'explotar',
      acciones_planificadas: '',
      controles_existentes: '',
      controles_adicionales: '',
      responsable: '',
      area_responsable: '',
      recursos_necesarios: '',
      costo_estimado: 0,
      fecha_implementacion: '',
      plazo_implementacion: '',
      indicadores_seguimiento: '',
      frecuencia_revision: 'mensual',
      fecha_ultima_revision: '',
      estado_implementacion: 'identificado',
      fecha_evaluacion_eficacia: '',
      evaluado_por: '',
      eficacia_acciones: '',
      nivel_riesgo_residual: 0
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
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Oportunidades</h1>
          </div>
          <p className="text-slate-500 ml-7">Identificación y aprovechamiento de oportunidades (6.1)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Oportunidad
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Oportunidades</p>
              <p className="text-2xl font-bold text-slate-800">{oportunidades.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Lightbulb className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alto Potencial</p>
              <p className="text-2xl font-bold text-slate-800">
                {oportunidades.filter(o => o.clasificacion_nivel === 'critico' || o.clasificacion_nivel === 'alto').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Implementación</p>
              <p className="text-2xl font-bold text-slate-800">
                {oportunidades.filter(o => o.estado_implementacion === 'en_implementacion').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Zap className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Aprovechadas</p>
              <p className="text-2xl font-bold text-slate-800">
                {oportunidades.filter(o => o.estado_implementacion === 'implementado').length}
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
          <h3 className="font-bold text-slate-800">Matriz de Oportunidades</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar oportunidad..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando oportunidades...
            </div>
          </div>
        ) : oportunidades.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay oportunidades registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Oportunidad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Potencial</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estrategia</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {oportunidades.map((oportunidad) => (
                  <tr key={oportunidad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{oportunidad.codigo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 font-medium">{oportunidad.descripcion}</span>
                        <span className="text-xs text-slate-500">{oportunidad.categoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        oportunidad.clasificacion_nivel === 'critico' ? 'bg-emerald-100 text-emerald-700' :
                        oportunidad.clasificacion_nivel === 'alto' ? 'bg-green-100 text-green-700' :
                        oportunidad.clasificacion_nivel === 'medio' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {oportunidad.clasificacion_nivel?.toUpperCase()} ({oportunidad.nivel_riesgo})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 capitalize">{oportunidad.estrategia}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        oportunidad.estado_implementacion === 'implementado' ? 'bg-emerald-100 text-emerald-700' :
                        oportunidad.estado_implementacion === 'en_implementacion' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {oportunidad.estado_implementacion?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(oportunidad)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(oportunidad.id)}
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
                {editingId ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Identificación</label>
                  <input
                    type="date"
                    value={formData.fecha_identificacion}
                    onChange={(e) => setFormData({...formData, fecha_identificacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="estrategico">Estratégico</option>
                    <option value="operacional">Operacional</option>
                    <option value="financiero">Financiero</option>
                    <option value="cumplimiento">Cumplimiento</option>
                    <option value="reputacional">Reputacional</option>
                    <option value="tecnologico">Tecnológico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                  <input
                    type="text"
                    value={formData.origen}
                    onChange={(e) => setFormData({...formData, origen: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de la Oportunidad</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Probabilidad (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.probabilidad}
                    onChange={(e) => setFormData({...formData, probabilidad: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impacto (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.impacto}
                    onChange={(e) => setFormData({...formData, impacto: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Potencial de Oportunidad:</span>
                  <span className={`px-3 py-1 rounded-full font-bold ${
                    formData.clasificacion_nivel === 'critico' ? 'bg-emerald-100 text-emerald-700' :
                    formData.clasificacion_nivel === 'alto' ? 'bg-green-100 text-green-700' :
                    formData.clasificacion_nivel === 'medio' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {formData.nivel_riesgo} - {formData.clasificacion_nivel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estrategia</label>
                  <select
                    value={formData.estrategia}
                    onChange={(e) => setFormData({...formData, estrategia: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="explotar">Explotar</option>
                    <option value="mejorar">Mejorar</option>
                    <option value="compartir">Compartir</option>
                    <option value="aceptar">Aceptar</option>
                  </select>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Planificadas</label>
                <textarea
                  value={formData.acciones_planificadas}
                  onChange={(e) => setFormData({...formData, acciones_planificadas: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado Implementación</label>
                  <select
                    value={formData.estado_implementacion}
                    onChange={(e) => setFormData({...formData, estado_implementacion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="identificado">Identificado</option>
                    <option value="planificado">Planificado</option>
                    <option value="en_implementacion">En Implementación</option>
                    <option value="implementado">Implementado</option>
                    <option value="en_seguimiento">En Seguimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Implementación</label>
                  <input
                    type="date"
                    value={formData.fecha_implementacion}
                    onChange={(e) => setFormData({...formData, fecha_implementacion: e.target.value})}
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
