'use client';

import Link from 'next/link';
import { 
  ClipboardList, RefreshCw, MessageSquare, Target, Search, AlertTriangle,
  BarChart2, FileCheck, Truck, Box, ShieldAlert, Lightbulb, TrendingUp,
  Plus, Info, Compass, Building2, ChevronRight
} from 'lucide-react';

const CLAUSULA4 = [
  { href: '/organizacion', icon: Building2, color: 'bg-violet-500', label: 'Organización', sub: 'Direccionamiento · Áreas · Colaboradores' },
  { href: '/contexto', icon: Compass, color: 'bg-indigo-500', label: 'Análisis de Contexto', sub: 'Cláusula 4.1 · DOFA & Estrategias' },
];

const MODULOS = [
  { href: '/compromisos', icon: ClipboardList, color: 'bg-amber-500', label: 'Compromisos Previos', clause: '9.3.2.a' },
  { href: '/cambios', icon: RefreshCw, color: 'bg-blue-500', label: 'Gestión de Cambios', clause: '9.3.2.b' },
  { href: '/encuestas', icon: MessageSquare, color: 'bg-emerald-500', label: 'Satisfacción Cliente', clause: '9.3.2.c.1' },
  { href: '/modulos/quejas', icon: AlertTriangle, color: 'bg-rose-500', label: 'PQRS', clause: '9.3.2.c.1' },
  { href: '/objetivos', icon: Target, color: 'bg-purple-500', label: 'Objetivos Calidad', clause: '9.3.2.c.2' },
  { href: '/inspecciones', icon: Search, color: 'bg-sky-500', label: 'Inspecciones', clause: '9.3.2.c.3' },
  { href: '/modulos/no-conformidades', icon: AlertTriangle, color: 'bg-red-500', label: 'No Conformidades', clause: '9.3.2.c.4' },
  { href: '/modulos/indicadores', icon: BarChart2, color: 'bg-cyan-500', label: 'Indicadores', clause: '9.3.2.c.5' },
  { href: '/modulos/auditorias', icon: FileCheck, color: 'bg-teal-500', label: 'Auditorías', clause: '9.3.2.c.6' },
  { href: '/modulos/proveedores', icon: Truck, color: 'bg-orange-500', label: 'Proveedores', clause: '9.3.2.c.7' },
  { href: '/recursos', icon: Box, color: 'bg-lime-600', label: 'Recursos', clause: '9.3.2.d' },
  { href: '/riesgos', icon: ShieldAlert, color: 'bg-fuchsia-500', label: 'Riesgos', clause: '6.1' },
  { href: '/oportunidades', icon: Lightbulb, color: 'bg-amber-500', label: 'Oportunidades', clause: '6.1' },
  { href: '/mejoras', icon: TrendingUp, color: 'bg-yellow-500', label: 'Mejora Continua', clause: '10.3' },
];

export default function DashboardPage() {
  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sistema de Gestión de Calidad</h1>
            <p className="text-slate-500 mt-1 text-sm">ISO 9001:2015 — Revisión por la Dirección</p>
          </div>
          <div className="flex gap-2">
            <Link href="/compromisos" className="btn-secondary flex items-center gap-2 text-sm">
              <ClipboardList size={16} /> Compromisos
            </Link>
            <Link href="/nueva-revision" className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Nueva Revisión
            </Link>
          </div>
        </div>
      </div>

      {/* Cláusula 4 */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Cláusula 4 — Contexto de la Organización
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLAUSULA4.map(m => (
            <Link key={m.href} href={m.href} className="module-card group flex items-center gap-4">
              <div className={`${m.color} p-2.5 rounded-xl text-white shrink-0`}>
                <m.icon size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight">{m.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{m.sub}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Módulos 9.3 */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Módulos de Revisión — Cláusula 9.3
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {MODULOS.map(m => (
            <Link key={m.href} href={m.href} className="module-card group flex items-center gap-4">
              <div className={`${m.color} p-2.5 rounded-xl text-white shrink-0`}>
                <m.icon size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight">{m.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cláusula {m.clause}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
        <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Todos los módulos están operativos. Seleccione cualquier tarjeta para gestionar sus registros.
          </p>
        </div>
      </div>
    </div>
  );
}
