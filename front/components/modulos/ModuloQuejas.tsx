import { QuejaReclamo } from '@/lib/types';

interface ModuloQuejasProps {
  quejas: QuejaReclamo[];
}

export default function ModuloQuejas({ quejas }: ModuloQuejasProps) {
  const getTipoBadge = (tipo: string) => {
    const badges = {
      queja: 'bg-red-50 text-red-700 border border-red-200',
      reclamo: 'bg-orange-50 text-orange-700 border border-orange-200',
      sugerencia: 'bg-blue-50 text-blue-700 border border-blue-200',
      felicitacion: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };
    return badges[tipo as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      abierta: 'bg-amber-50 text-amber-700 border border-amber-200',
      en_analisis: 'bg-blue-50 text-blue-700 border border-blue-200',
      resuelta: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cerrada: 'bg-slate-100 text-slate-700 border border-slate-300'
    };
    return badges[estado as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getBorderColor = (tipo: string) => {
    const borders = {
      queja: 'border-red-500',
      reclamo: 'border-orange-500',
      sugerencia: 'border-blue-500',
      felicitacion: 'border-emerald-500'
    };
    return borders[tipo as keyof typeof borders] || 'border-slate-300';
  };

  const renderEstrellas = (satisfaccion?: number) => {
    if (!satisfaccion) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < satisfaccion ? 'text-amber-400' : 'text-slate-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-700">{satisfaccion}/5</span>
      </div>
    );
  };

  // Calcular estadísticas
  const stats = {
    total: quejas.length,
    resueltas: quejas.filter(q => q.estado === 'resuelta' || q.estado === 'cerrada').length,
    pendientes: quejas.filter(q => q.estado === 'abierta' || q.estado === 'en_analisis').length,
    satisfaccionPromedio: quejas.filter(q => q.satisfaccion_resolucion).reduce((acc, q) => acc + (q.satisfaccion_resolucion || 0), 0) / quejas.filter(q => q.satisfaccion_resolucion).length || 0
  };

  const porQuejas = quejas.filter(q => q.tipo === 'queja').length;
  const porReclamos = quejas.filter(q => q.tipo === 'reclamo').length;
  const porSugerencias = quejas.filter(q => q.tipo === 'sugerencia').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-600 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quejas y Reclamos</h3>
              <p className="text-sm text-slate-600 mt-0.5">Gestión de la voz del cliente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-600 uppercase mt-1">Total</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{stats.resueltas}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase mt-1">Resueltas</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-200 text-center">
            <div className="text-3xl font-bold text-amber-700">{stats.pendientes}</div>
            <div className="text-xs font-medium text-amber-600 uppercase mt-1">Pendientes</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="flex items-center justify-center gap-1">
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-3xl font-bold text-blue-700">{stats.satisfaccionPromedio.toFixed(1)}</span>
            </div>
            <div className="text-xs font-medium text-blue-600 uppercase mt-1">Satisfacción</div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-4 border border-slate-200 text-center lg:col-span-1 col-span-2">
            <div className="text-sm font-semibold text-slate-700">
              <div className="text-red-600">{porQuejas} quejas</div>
              <div className="text-orange-600">{porReclamos} reclamos</div>
              <div className="text-blue-600">{porSugerencias} sugerencias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Quejas */}
      <div className="p-6">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {quejas.map((queja) => (
            <div key={queja.id} className={`bg-white border-l-4 ${getBorderColor(queja.tipo)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTipoBadge(queja.tipo)}`}>
                        {queja.tipo.charAt(0).toUpperCase() + queja.tipo.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(queja.estado)}`}>
                        {queja.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-bold text-base text-slate-900">{queja.cliente}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {queja.producto_servicio}
                      </p>
                    </div>
                    
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{queja.descripcion}</p>
                    
                    {queja.satisfaccion_resolucion && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs font-medium text-amber-900 mb-2">Satisfacción con la resolución:</p>
                        {renderEstrellas(queja.satisfaccion_resolucion)}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600">Recibida</p>
                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                        {new Date(queja.fecha_recepcion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
