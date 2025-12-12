import { Indicador } from '@/lib/types';

interface ModuloIndicadoresProps {
  indicadores: Indicador[];
}

export default function ModuloIndicadores({ indicadores }: ModuloIndicadoresProps) {
  const getTendenciaIcon = (tendencia: string) => {
    if (tendencia === 'mejora') {
      return (
        <div className="flex items-center gap-1 text-emerald-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs font-semibold">↑ Mejora</span>
        </div>
      );
    } else if (tendencia === 'deterioro') {
      return (
        <div className="flex items-center gap-1 text-red-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="text-xs font-semibold">↓ Deterioro</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-slate-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
        <span className="text-xs font-semibold">→ Estable</span>
      </div>
    );
  };

  const getCumplimientoColor = (cumplimiento: number) => {
    if (cumplimiento >= 100) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-600' };
    if (cumplimiento >= 90) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-600' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-600' };
  };

  // Estadísticas generales
  const promedioGeneral = indicadores.reduce((acc, ind) => acc + ind.cumplimiento, 0) / indicadores.length;
  const alcanzados = indicadores.filter(i => i.cumplimiento >= 100).length;
  const enProgreso = indicadores.filter(i => i.cumplimiento >= 90 && i.cumplimiento < 100).length;
  const criticos = indicadores.filter(i => i.cumplimiento < 90).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-violet-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-600 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Indicadores de Desempeño</h3>
              <p className="text-sm text-slate-600 mt-0.5">Monitoreo de KPIs - Q4 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
            <div className="text-3xl font-bold text-slate-900">{promedioGeneral.toFixed(1)}%</div>
            <div className="text-xs font-medium text-slate-600 uppercase mt-1">Promedio General</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{alcanzados}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase mt-1">Alcanzados</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-200 text-center">
            <div className="text-3xl font-bold text-amber-700">{enProgreso}</div>
            <div className="text-xs font-medium text-amber-600 uppercase mt-1">En Progreso</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-200 text-center">
            <div className="text-3xl font-bold text-red-700">{criticos}</div>
            <div className="text-xs font-medium text-red-600 uppercase mt-1">Críticos</div>
          </div>
        </div>
      </div>

      {/* Grid de Indicadores */}
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {indicadores.map((indicador) => {
            const colors = getCumplimientoColor(indicador.cumplimiento);
            return (
              <div key={indicador.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-5">
                  {/* Header del indicador */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">
                        {indicador.nombre_indicador}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {indicador.responsable}
                      </p>
                    </div>
                    <div className="ml-3">
                      {getTendenciaIcon(indicador.tendencia)}
                    </div>
                  </div>

                  {/* Valores Actual vs Meta */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-600 uppercase mb-1">Valor Actual</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {indicador.valor_actual}<span className="text-base font-normal text-blue-700">{indicador.unidad_medida}</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 uppercase mb-1">Meta</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {indicador.valor_meta}<span className="text-base font-normal text-slate-700">{indicador.unidad_medida}</span>
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso mejorada */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">Cumplimiento</span>
                      <span className={`px-2.5 py-1 rounded-full font-bold border ${colors.border} ${colors.bg} ${colors.text}`}>
                        {indicador.cumplimiento.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full ${colors.bar} transition-all duration-500 shadow-sm`}
                        style={{ width: `${Math.min(indicador.cumplimiento, 100)}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
