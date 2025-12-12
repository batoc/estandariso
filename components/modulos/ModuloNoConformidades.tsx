import { NoConformidad } from '@/lib/types';

interface ModuloNoConformidadesProps {
  noConformidades: NoConformidad[];
}

export default function ModuloNoConformidades({ noConformidades }: ModuloNoConformidadesProps) {
  const getSeveridadBadge = (severidad: string) => {
    const badges = {
      critica: 'bg-red-600 text-white border-red-700 shadow-sm',
      mayor: 'bg-orange-50 text-orange-700 border border-orange-200',
      menor: 'bg-amber-50 text-amber-700 border border-amber-200'
    };
    return badges[severidad as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      abierta: 'bg-red-50 text-red-700 border border-red-200',
      en_analisis: 'bg-amber-50 text-amber-700 border border-amber-200',
      en_implementacion: 'bg-blue-50 text-blue-700 border border-blue-200',
      cerrada: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };
    return badges[estado as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getBorderColor = (severidad: string) => {
    const borders = {
      critica: 'border-red-600',
      mayor: 'border-orange-500',
      menor: 'border-amber-500'
    };
    return borders[severidad as keyof typeof borders] || 'border-slate-300';
  };

  // Estadísticas
  const stats = {
    total: noConformidades.length,
    abiertas: noConformidades.filter(nc => nc.estado !== 'cerrada').length,
    cerradas: noConformidades.filter(nc => nc.estado === 'cerrada').length,
    criticas: noConformidades.filter(nc => nc.severidad === 'critica' && nc.estado !== 'cerrada').length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">No Conformidades</h3>
              <p className="text-sm text-slate-600 mt-0.5">Gestión de hallazgos y acciones correctivas</p>
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
          <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-200 text-center">
            <div className="text-3xl font-bold text-red-700">{stats.abiertas}</div>
            <div className="text-xs font-medium text-red-600 uppercase mt-1">Abiertas</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{stats.cerradas}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase mt-1">Cerradas</div>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-4 border-2 border-red-300 text-center">
            <div className="text-3xl font-bold text-red-800">{stats.criticas}</div>
            <div className="text-xs font-medium text-red-700 uppercase mt-1">⚠ Críticas</div>
          </div>
        </div>
      </div>

      {/* Lista de No Conformidades */}
      <div className="p-6">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {noConformidades.map((nc) => (
            <div key={nc.id} className={`bg-white border-l-4 ${getBorderColor(nc.severidad)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getSeveridadBadge(nc.severidad)}`}>
                        {nc.severidad === 'critica' && '⚠ '}
                        {nc.severidad.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(nc.estado)}`}>
                        {nc.estado.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                        {nc.tipo.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mb-1">{nc.proceso_afectado}</h4>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{nc.descripcion}</p>
                    
                    {nc.accion_correctiva && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-blue-900 mb-1">Acción Correctiva:</p>
                            <p className="text-xs text-blue-800 leading-relaxed">{nc.accion_correctiva}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{nc.responsable}</span>
                      </div>
                      {nc.eficacia_verificada && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Eficacia verificada
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right flex-shrink-0">
                    <div className="px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600">Detectada</p>
                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                        {new Date(nc.fecha_deteccion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {nc.fecha_cierre && (
                      <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-xs font-medium text-emerald-600">Cerrada</p>
                        <p className="text-sm font-bold text-emerald-700 whitespace-nowrap">
                          {new Date(nc.fecha_cierre).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
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
