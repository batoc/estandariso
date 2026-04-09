import pb from '@/lib/pocketbase';
import { Revision } from '@/lib/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Target, 
  Download,
  Hash,
  Clock
} from 'lucide-react';

interface DetalleRevisionProps {
  params: {
    id: string;
  };
}

async function getRevision(id: string): Promise<Revision | null> {
  try {
    const data = await pb.collection('revisiones').getOne(id);
    return data as unknown as Revision;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
}

export default async function DetalleRevisionPage({ params }: DetalleRevisionProps) {
  const revision = await getRevision(params.id);

  if (!revision) {
    notFound();
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">{revision.titulo}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 ml-7">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(revision.fecha_revision).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <User size={14} />
              {revision.responsable}
            </div>
            <div className="flex items-center gap-1">
              <Hash size={14} />
              ID: {revision.id}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary flex items-center gap-2"
            disabled
          >
            <Download size={18} />
            Generar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conclusiones Generales */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Conclusiones Generales
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {revision.conclusiones_generales || 'No especificado'}
              </p>
            </div>
          </div>

          {/* Análisis de Objetivos */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-600" />
              Análisis de Objetivos de Calidad
            </h3>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {revision.analisis_objetivos || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Detalles del Registro</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Fecha de Creación</p>
                <div className="flex items-center gap-2 text-slate-700 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  {new Date(revision.created).toLocaleString('es-ES')}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Estado</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
