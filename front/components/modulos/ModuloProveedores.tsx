import { Proveedor } from '@/lib/types';

interface ModuloProveedoresProps {
  proveedores: Proveedor[];
}

export default function ModuloProveedores({ proveedores }: ModuloProveedoresProps) {
  const getEstadoBadge = (estado: string) => {
    const badges = {
      aprobado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      condicional: 'bg-amber-50 text-amber-700 border border-amber-200',
      no_aprobado: 'bg-red-50 text-red-700 border border-red-200'
    };
    return badges[estado as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 90) return { bg: 'from-emerald-50 to-white', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-100' };
    if (calificacion >= 70) return { bg: 'from-amber-50 to-white', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-100' };
    return { bg: 'from-red-50 to-white', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-100' };
  };

  const getCriterioColor = (valor: number) => {
    if (valor >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (valor >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Estadísticas
  const stats = {
    total: proveedores.length,
    aprobados: proveedores.filter(p => p.estado === 'aprobado').length,
    condicionales: proveedores.filter(p => p.estado === 'condicional').length,
    noAprobados: proveedores.filter(p => p.estado === 'no_aprobado').length,
    promedioCalificacion: proveedores.reduce((acc, p) => acc + p.calificacion_actual, 0) / proveedores.length,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Proveedores</h3>
              <p className="text-sm text-slate-600 mt-0.5">Evaluación y calificación de proveedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-600 uppercase mt-1">Total</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{stats.aprobados}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase mt-1">Aprobados</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-200 text-center">
            <div className="text-3xl font-bold text-amber-700">{stats.condicionales}</div>
            <div className="text-xs font-medium text-amber-600 uppercase mt-1">Condicionales</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.promedioCalificacion.toFixed(1)}</div>
            <div className="text-xs font-medium text-blue-600 uppercase mt-1">Promedio</div>
          </div>
        </div>
      </div>

      {/* Lista de Proveedores */}
      <div className="p-6">
        <div className="space-y-4">
          {proveedores.map((proveedor) => {
            const colors = getCalificacionColor(proveedor.calificacion_actual);
            return (
              <div key={proveedor.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-slate-900">{proveedor.nombre_proveedor}</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(proveedor.estado)}`}>
                          {proveedor.estado.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs border border-slate-200">
                          {proveedor.categoria.replace('_', ' ').charAt(0).toUpperCase() + proveedor.categoria.replace('_', ' ').slice(1)}
                        </span>
                        <span className="text-slate-600 text-xs flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(proveedor.fecha_evaluacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Calificación destacada */}
                    <div className={`ml-6 text-center px-6 py-4 bg-gradient-to-br ${colors.bg} rounded-xl border ${colors.border} shadow-sm`}>
                      <p className={`text-4xl font-bold ${colors.text}`}>
                        {proveedor.calificacion_actual}
                      </p>
                      <p className="text-xs font-medium text-slate-600 uppercase mt-1">Calificación</p>
                    </div>
                  </div>

                  {/* Criterios de evaluación en grid */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {Object.entries(proveedor.criterios_evaluacion).map(([criterio, valor]) => (
                      <div key={criterio} className={`text-center p-3 rounded-lg border ${getCriterioColor(valor as number)}`}>
                        <p className="text-xl font-bold">{valor}</p>
                        <p className="text-xs font-medium uppercase mt-1">{criterio}</p>
                      </div>
                    ))}
                  </div>

                  {/* Información adicional */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      {proveedor.incidentes_totales > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {proveedor.incidentes_totales} incidente(s)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Sin incidentes
                        </span>
                      )}
                    </div>
                  </div>

                  {proveedor.observaciones && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-900 mb-1">Observaciones:</p>
                          <p className="text-xs text-blue-800 leading-relaxed">{proveedor.observaciones}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
