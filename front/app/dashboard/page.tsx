'use client';

import Link from 'next/link';
import { 
  ClipboardList, 
  RefreshCw, 
  MessageSquare, 
  Target, 
  Search, 
  AlertTriangle, 
  BarChart2, 
  FileCheck, 
  Truck, 
  Box, 
  ShieldAlert, 
  Lightbulb,
  TrendingUp,
  Plus,
  Info,
  Compass,
  Building2,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sistema de Gestión de Calidad ISO 9001:2015</h1>
          <p className="text-slate-500 mt-1">Módulos de Revisión por la Dirección - Cláusula 9.3</p>
        </div>
        <div className="flex gap-3">
          <Link href="/compromisos" className="btn-secondary flex items-center gap-2">
            <ClipboardList size={18} />
            Compromisos
          </Link>
          <Link href="/nueva-revision" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nueva Revisión
          </Link>
        </div>
      </div>

      {/* Sección: Cláusula 4 - Contexto de la Organización */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Compass size={20} className="text-indigo-600" />
          Cláusula 4 — Contexto de la Organización
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="/organizacion" className="module-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Organización</h3>
            <p className="text-xs font-medium text-slate-400">Direccionamiento · Áreas · Colaboradores</p>
          </Link>
          <Link href="/contexto" className="module-card group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Compass className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Análisis de Contexto</h3>
            <p className="text-xs font-medium text-slate-400">Cláusula 4.1 · DOFA & Estrategias</p>
          </Link>
        </div>
      </div>

      {/* Grid de Módulos ISO 9.3.2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* 9.3.2.a - Compromisos Previos */}
        <Link href="/compromisos" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Compromisos Previos</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.a</p>
        </Link>

        {/* 9.3.2.b - Cambios */}
        <Link href="/cambios" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Gestión de Cambios</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.b</p>
        </Link>

        {/* 9.3.2.c.1 - Encuestas */}
        <Link href="/encuestas" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Satisfacción Cliente</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.1</p>
        </Link>

        {/* 9.3.2.c.1 - PQRS */}
        <Link href="/modulos/quejas" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">PQRS</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.1</p>
        </Link>

        {/* 9.3.2.c.2 - Objetivos */}
        <Link href="/objetivos" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Objetivos Calidad</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.2</p>
        </Link>

        {/* 9.3.2.c.3 - Inspecciones */}
        <Link href="/inspecciones" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Inspecciones</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.3</p>
        </Link>

        {/* 9.3.2.c.4 - No Conformidades */}
        <Link href="/modulos/no-conformidades" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">No Conformidades</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.4</p>
        </Link>

        {/* 9.3.2.c.5 - Indicadores */}
        <Link href="/modulos/indicadores" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <BarChart2 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Indicadores</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.5</p>
        </Link>

        {/* 9.3.2.c.6 - Auditorías */}
        <Link href="/modulos/auditorias" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <FileCheck className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Auditorías</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.6</p>
        </Link>

        {/* 9.3.2.c.7 - Proveedores */}
        <Link href="/modulos/proveedores" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Proveedores</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.c.7</p>
        </Link>

        {/* 9.3.2.d - Recursos */}
        <Link href="/recursos" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-lime-100 rounded-lg group-hover:bg-lime-200 transition-colors">
              <Box className="w-6 h-6 text-lime-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Recursos</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 9.3.2.d</p>
        </Link>

        {/* 9.3.2.e - Riesgos */}
        <Link href="/riesgos" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-fuchsia-100 rounded-lg group-hover:bg-fuchsia-200 transition-colors">
              <ShieldAlert className="w-6 h-6 text-fuchsia-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Riesgos</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 6.1</p>
        </Link>

        {/* 9.3.2.e - Oportunidades */}
        <Link href="/oportunidades" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Oportunidades</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 6.1</p>
        </Link>

        {/* 9.3.2.f - Mejoras */}
        <Link href="/mejoras" className="module-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Mejora Continua</h3>
          <p className="text-xs font-medium text-slate-400">Cláusula 10.3</p>
        </Link>
      </div>

      {/* Nota informativa */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-50 rounded-full">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Sistema ISO 9001:2015 - Cláusula 9.3</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Todos los módulos están operativos. Seleccione cualquier tarjeta para gestionar sus registros.
              Para realizar una nueva revisión, haga clic en el botón <strong className="text-blue-600">Nueva Revisión</strong>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
