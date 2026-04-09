'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import {
  ClipboardCheck,
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
  FileText,
  Camera,
  Users
} from 'lucide-react';

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fecha_inspeccion: new Date().toISOString().split('T')[0],
    tipo_inspeccion: 'producto',
    proceso_inspeccionado: '',
    area: '',
    lote_producto: '',
    turno: '',
    inspector: '',
    rol_inspector: 'calidad',
    acompanantes: '', // Array as string
    criterios_evaluacion: '',
    norma_aplicable: '',
    items_inspeccionados: 0,
    items_conformes: 0,
    items_no_conformes: 0,
    porcentaje_conformidad: 0,
    resultado_general: 'conforme',
    hallazgos: '',
    observaciones_menor: '',
    no_conformidades_detectadas: '',
    acciones_inmediatas: '',
    requiere_accion_correctiva: false,
    evidencias_fotograficas: '', // Array as string
    fecha_seguimiento: '',
    estado_seguimiento: 'pendiente'
  });

  useEffect(() => {
    fetchInspecciones();
  }, []);

  const fetchInspecciones = async () => {
    setLoading(true);
    const data = await pb.collection('inspecciones_verificacion').getFullList({ sort: '-created' });

    setInspecciones(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular items no conformes y porcentaje
    const itemsNoConformes = Math.max(0, formData.items_inspeccionados - formData.items_conformes);
    const porcentaje = formData.items_inspeccionados > 0 
      ? (formData.items_conformes / formData.items_inspeccionados) * 100 
      : 0;

    const dataToSave = {
      ...formData,
      items_inspeccionados: Number(formData.items_inspeccionados),
      items_conformes: Number(formData.items_conformes),
      items_no_conformes: itemsNoConformes,
      porcentaje_conformidad: Number(porcentaje.toFixed(2)),
      acompanantes: formData.acompanantes.split(',').map(s => s.trim()).filter(Boolean),
      evidencias_fotograficas: formData.evidencias_fotograficas.split(',').map(s => s.trim()).filter(Boolean),
      fecha_seguimiento: formData.fecha_seguimiento || null
    };

    if (editingId) {
      await pb.collection('inspecciones_verificacion').update(editingId, dataToSave);
      
        fetchInspecciones();
        resetForm();
    } else {
      await pb.collection('inspecciones_verificacion').create(dataToSave);
      
        fetchInspecciones();
        resetForm();
    }
  };

  const handleEdit = (inspeccion: any) => {
    setEditingId(inspeccion.id);
    setFormData({
      fecha_inspeccion: inspeccion.fecha_inspeccion || new Date().toISOString().split('T')[0],
      tipo_inspeccion: inspeccion.tipo_inspeccion || 'producto',
      proceso_inspeccionado: inspeccion.proceso_inspeccionado || '',
      area: inspeccion.area || '',
      lote_producto: inspeccion.lote_producto || '',
      turno: inspeccion.turno || '',
      inspector: inspeccion.inspector || '',
      rol_inspector: inspeccion.rol_inspector || 'calidad',
      acompanantes: Array.isArray(inspeccion.acompanantes) ? inspeccion.acompanantes.join(', ') : '',
      criterios_evaluacion: inspeccion.criterios_evaluacion || '',
      norma_aplicable: inspeccion.norma_aplicable || '',
      items_inspeccionados: inspeccion.items_inspeccionados || 0,
      items_conformes: inspeccion.items_conformes || 0,
      items_no_conformes: inspeccion.items_no_conformes || 0,
      porcentaje_conformidad: inspeccion.porcentaje_conformidad || 0,
      resultado_general: inspeccion.resultado_general || 'conforme',
      hallazgos: inspeccion.hallazgos || '',
      observaciones_menor: inspeccion.observaciones_menor || '',
      no_conformidades_detectadas: inspeccion.no_conformidades_detectadas || '',
      acciones_inmediatas: inspeccion.acciones_inmediatas || '',
      requiere_accion_correctiva: inspeccion.requiere_accion_correctiva || false,
      evidencias_fotograficas: Array.isArray(inspeccion.evidencias_fotograficas) ? inspeccion.evidencias_fotograficas.join(', ') : '',
      fecha_seguimiento: inspeccion.fecha_seguimiento || '',
      estado_seguimiento: inspeccion.estado_seguimiento || 'pendiente'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar inspección?')) {
      await pb.collection('inspecciones_verificacion').delete(id);
        fetchInspecciones();
    }
  };

  const resetForm = () => {
    setFormData({
      fecha_inspeccion: new Date().toISOString().split('T')[0],
      tipo_inspeccion: 'producto',
      proceso_inspeccionado: '',
      area: '',
      lote_producto: '',
      turno: '',
      inspector: '',
      rol_inspector: 'calidad',
      acompanantes: '',
      criterios_evaluacion: '',
      norma_aplicable: '',
      items_inspeccionados: 0,
      items_conformes: 0,
      items_no_conformes: 0,
      porcentaje_conformidad: 0,
      resultado_general: 'conforme',
      hallazgos: '',
      observaciones_menor: '',
      no_conformidades_detectadas: '',
      acciones_inmediatas: '',
      requiere_accion_correctiva: false,
      evidencias_fotograficas: '',
      fecha_seguimiento: '',
      estado_seguimiento: 'pendiente'
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
            <h1 className="text-2xl font-bold text-slate-800">Inspecciones y Verificación</h1>
          </div>
          <p className="text-slate-500 ml-7">Control de calidad y verificación (8.6)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Inspección
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Inspecciones</p>
              <p className="text-2xl font-bold text-slate-800">{inspecciones.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ClipboardCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Conformes</p>
              <p className="text-2xl font-bold text-slate-800">
                {inspecciones.filter(i => i.resultado_general === 'conforme').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">No Conformes</p>
              <p className="text-2xl font-bold text-slate-800">
                {inspecciones.filter(i => i.resultado_general === 'no_conforme').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800">Registro de Inspecciones</h3>
          <div className="relative max-w-md w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar inspección..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              Cargando inspecciones...
            </div>
          </div>
        ) : inspecciones.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay inspecciones registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Conformidad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Resultado</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspecciones.map((inspeccion) => (
                  <tr key={inspeccion.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{inspeccion.fecha_inspeccion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 capitalize">{inspeccion.tipo_inspeccion}</span>
                        <span className="text-xs text-slate-500">{inspeccion.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{inspeccion.inspector}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              inspeccion.porcentaje_conformidad >= 90 ? 'bg-emerald-500' :
                              inspeccion.porcentaje_conformidad >= 75 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${inspeccion.porcentaje_conformidad}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{inspeccion.porcentaje_conformidad}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inspeccion.resultado_general === 'conforme' ? 'bg-emerald-100 text-emerald-700' :
                        inspeccion.resultado_general === 'conforme_con_observaciones' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {inspeccion.resultado_general?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(inspeccion)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(inspeccion.id)}
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
                {editingId ? 'Editar Inspección' : 'Nueva Inspección'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inspección</label>
                  <input
                    type="date"
                    value={formData.fecha_inspeccion}
                    onChange={(e) => setFormData({...formData, fecha_inspeccion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Inspección</label>
                  <select
                    value={formData.tipo_inspeccion}
                    onChange={(e) => setFormData({...formData, tipo_inspeccion: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="producto">Producto</option>
                    <option value="proceso">Proceso</option>
                    <option value="instalaciones">Instalaciones</option>
                    <option value="documentacion">Documentación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Inspeccionado</label>
                  <input
                    type="text"
                    value={formData.proceso_inspeccionado}
                    onChange={(e) => setFormData({...formData, proceso_inspeccionado: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lote Producto</label>
                  <input
                    type="text"
                    value={formData.lote_producto}
                    onChange={(e) => setFormData({...formData, lote_producto: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                  <input
                    type="text"
                    value={formData.turno}
                    onChange={(e) => setFormData({...formData, turno: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Inspector</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({...formData, inspector: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol Inspector</label>
                  <select
                    value={formData.rol_inspector}
                    onChange={(e) => setFormData({...formData, rol_inspector: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="calidad">Calidad</option>
                    <option value="produccion">Producción</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="externo">Externo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Items Inspeccionados</label>
                  <input
                    type="number"
                    value={formData.items_inspeccionados}
                    onChange={(e) => setFormData({...formData, items_inspeccionados: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Items Conformes</label>
                  <input
                    type="number"
                    value={formData.items_conformes}
                    onChange={(e) => setFormData({...formData, items_conformes: Number(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resultado General</label>
                <select
                  value={formData.resultado_general}
                  onChange={(e) => setFormData({...formData, resultado_general: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="conforme">Conforme</option>
                  <option value="conforme_con_observaciones">Conforme con Observaciones</option>
                  <option value="no_conforme">No Conforme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgos</label>
                <textarea
                  value={formData.hallazgos}
                  onChange={(e) => setFormData({...formData, hallazgos: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acciones Inmediatas</label>
                <textarea
                  value={formData.acciones_inmediatas}
                  onChange={(e) => setFormData({...formData, acciones_inmediatas: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiere_accion"
                  checked={formData.requiere_accion_correctiva}
                  onChange={(e) => setFormData({...formData, requiere_accion_correctiva: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="requiere_accion" className="font-medium text-slate-700">Requiere Acción Correctiva</label>
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
