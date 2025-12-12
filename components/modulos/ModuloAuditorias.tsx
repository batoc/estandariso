import { Auditoria } from '@/lib/types';

interface ModuloAuditoriasProps {
  auditorias: Auditoria[];
}

export default function ModuloAuditorias({ auditorias }: ModuloAuditoriasProps) {
  const getEstadoBadge = (estado: string) => {
    const badges = {
      satisfactorio: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      requiere_mejoras: 'bg-amber-50 text-amber-700 border border-amber-200',
      critico: 'bg-red-50 text-red-700 border border-red-200'
    };
    return badges[estado as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const getTipoBadge = (tipo: string) => {
    const badges = {
      interna: 'bg-blue-50 text-blue-700 border border-blue-200',
      externa: 'bg-violet-50 text-violet-700 border border-violet-200',
      certificacion: 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    };
    return badges[tipo as keyof typeof badges] || 'bg-slate-100 text-slate-700 border border-slate-300';
  };

  const totalStats = {
    total: auditorias.length,
    satisfactorias: auditorias.filter(a => a.estado_general === 'satisfactorio').length,
    requierenMejoras: auditorias.filter(a => a.estado_general === 'requiere_mejoras').length,
    criticas: auditorias.filter(a => a.estado_general === 'critico').length,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Auditorías del Sistema</h3>
              <p className="text-sm text-slate-600 mt-0.5">{auditorias.length} auditorías registradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
            <div className="text-3xl font-bold text-slate-900">{totalStats.total}</div>
            <div className="text-xs font-medium text-slate-600 uppercase mt-1">Total</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700">{totalStats.satisfactorias}</div>
            <div className="text-xs font-medium text-emerald-600 uppercase mt-1">Satisfactorias</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-4 border border-amber-200 text-center">
            <div className="text-3xl font-bold text-amber-700">{totalStats.requierenMejoras}</div>
            <div className="text-xs font-medium text-amber-600 uppercase mt-1">Con Mejoras</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-200 text-center">
            <div className="text-3xl font-bold text-red-700">{totalStats.criticas}</div>
            <div className="text-xs font-medium text-red-600 uppercase mt-1">Críticas</div>
          </div>
        </div>
      </div>

      {/* Lista de Auditorías */}
      <div className="p-6">
        <div className="space-y-4">
          {auditorias.map((auditoria) => (
            <div key={auditoria.id} className="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTipoBadge(auditoria.tipo)}`}>
                        {auditoria.tipo.charAt(0).toUpperCase() + auditoria.tipo.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(auditoria.estado_general)}`}>
                        {auditoria.estado_general.replace('_', ' ').charAt(0).toUpperCase() + auditoria.estado_general.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{auditoria.proceso_auditado}</h4>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Auditor: <span className="font-medium">{auditoria.auditor_lider}</span>
                    </p>
                    <p className="text-sm text-slate-700 mt-3 leading-relaxed">{auditoria.resumen}</p>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600">Fecha</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(auditoria.fecha_auditoria).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                
                {/* Métricas de hallazgos */}
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{auditoria.hallazgos_totales}</p>
                    <p className="text-xs font-medium text-slate-600 uppercase mt-1">Hallazgos</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">{auditoria.conformidades}</p>
                    <p className="text-xs font-medium text-emerald-600 uppercase mt-1">Conformes</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-2xl font-bold text-amber-700">{auditoria.no_conformidades_menores}</p>
                    <p className="text-xs font-medium text-amber-600 uppercase mt-1">NC Menores</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-2xl font-bold text-red-700">{auditoria.no_conformidades_mayores}</p>
                    <p className="text-xs font-medium text-red-600 uppercase mt-1">NC Mayores</p>
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
