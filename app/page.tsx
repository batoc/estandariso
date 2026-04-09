import Link from 'next/link';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Sistema de Gestión ISO 9001
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Plataforma integral para la Revisión por la Dirección y gestión de calidad.
          </p>
        </div>

        {/* Cards de Acciones */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Ver Dashboard */}
          <Link 
            href="/dashboard"
            className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard size={100} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                Panel de Control
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Accede al dashboard principal para visualizar indicadores, gestionar módulos y consultar el historial de revisiones.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                Ingresar al Sistema <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Card 2: Nueva Revisión */}
          <Link 
            href="/nueva-revision"
            className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <PlusCircle size={100} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <PlusCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                Nueva Revisión
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Inicia un nuevo proceso de Revisión por la Dirección (Cláusula 9.3) recopilando datos de todos los módulos.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                Crear Registro <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-50 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Sistema Operativo</p>
              <p className="text-sm text-slate-500">
                v3.0.0 • Next.js 16 • PocketBase • Tailwind CSS
              </p>
            </div>
          </div>
          <div className="hidden md:block text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            Status: ONLINE
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Sistema de Gestión de Calidad. Todos los derechos reservados.
        </div>
      </div>
    </main>
  );
}
