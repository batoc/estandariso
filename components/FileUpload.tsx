'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, FileText, X, ExternalLink, Trash2 } from 'lucide-react';

interface ArchivoSubido {
  nombre: string;
  url: string;
  tamaño: number;
  fecha: string;
}

interface FileUploadProps {
  accessToken: string | null;
  revisionId: string | null;
  onFilesUploaded: (archivos: ArchivoSubido[]) => void;
}

export default function FileUpload({ accessToken, revisionId, onFilesUploaded }: FileUploadProps) {
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mover handleFiles primero
  const handleFiles = useCallback(async (files: File[]) => {
    if (!accessToken || !revisionId) {
      setError('Debes conectarte a OneDrive primero');
      return;
    }

    setUploading(true);
    setError(null);
    const archivosSubidos: ArchivoSubido[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accessToken', accessToken);
        formData.append('revisionId', revisionId);
        formData.append('subcarpeta', 'Evidencias');

        const response = await fetch('/api/onedrive/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al subir archivo');
        }

        archivosSubidos.push({
          nombre: data.nombre,
          url: data.url,
          tamaño: data.tamaño,
          fecha: new Date().toISOString(),
        });
      }

      const nuevosArchivos = [...archivos, ...archivosSubidos];
      setArchivos(nuevosArchivos);
      onFilesUploaded(nuevosArchivos);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  }, [accessToken, revisionId, archivos, onFilesUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  }, [handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const removeFile = (index: number) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    onFilesUploaded(nuevosArchivos);
  };

  if (!accessToken) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <p className="text-slate-500">
          Conecta con OneDrive para poder subir archivos adjuntos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zona de Drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleChange}
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          disabled={uploading || !revisionId}
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
          <p className="text-lg font-semibold text-slate-700 mb-2">
            {uploading ? 'Subiendo archivos...' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            o click para seleccionar
          </p>
          <p className="text-xs text-slate-400">
            Formatos: PDF, DOCX, XLSX, PNG, JPG (Máx. 10MB)
          </p>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Lista de archivos subidos */}
      {archivos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h4 className="font-semibold text-slate-800">
              Archivos Adjuntos ({archivos.length})
            </h4>
          </div>
          <ul className="divide-y divide-slate-200">
            {archivos.map((archivo, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {archivo.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(archivo.tamaño)} • {new Date(archivo.fecha).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm p-1 hover:bg-blue-50 rounded"
                    title="Ver en OneDrive"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm ml-3 p-1 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
