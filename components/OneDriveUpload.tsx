'use client';

import { useState, useCallback } from 'react';
import { ArchivoSubido } from '@/lib/types';

interface OneDriveUploadProps {
  token: string;
  onArchivosSubidos: (archivos: ArchivoSubido[]) => void;
  carpetaId?: string;
}

const TIPOS_ARCHIVO_PERMITIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg'
];

const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10MB

export default function OneDriveUpload({ token, onArchivosSubidos, carpetaId }: OneDriveUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);

  const validarArchivo = (file: File): string | null => {
    if (!TIPOS_ARCHIVO_PERMITIDOS.includes(file.type)) {
      return `${file.name}: Tipo de archivo no permitido. Solo se permiten PDF, DOCX, XLSX, PNG, JPG.`;
    }
    if (file.size > TAMANO_MAXIMO) {
      return `${file.name}: El archivo excede el tamaño máximo de 10MB.`;
    }
    return null;
  };

  const subirArchivos = async (files: FileList | File[]) => {
    const archivosArray = Array.from(files);
    
    // Validar archivos
    for (const file of archivosArray) {
      const error = validarArchivo(file);
      if (error) {
        alert(error);
        return;
      }
    }

    if (!carpetaId) {
      alert('Primero debes crear la carpeta en OneDrive. Completa los datos generales y guarda.');
      return;
    }

    setIsUploading(true);

    try {
      const archivosSubidos: ArchivoSubido[] = [];

      for (const file of archivosArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('token', token);
        formData.append('folderId', carpetaId);

        const response = await fetch('/api/onedrive/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al subir archivo');
        }

        const data = await response.json();
        archivosSubidos.push({
          nombre: file.name,
          url: data.webUrl,
          tipo: file.type,
          tamano: file.size,
          fecha: new Date().toISOString(),
        });
      }

      const nuevosArchivos = [...archivos, ...archivosSubidos];
      setArchivos(nuevosArchivos);
      onArchivosSubidos(nuevosArchivos);
      
      alert(`${archivosSubidos.length} archivo(s) subido(s) exitosamente a OneDrive`);
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      alert(`Error al subir archivos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      subirArchivos(e.dataTransfer.files);
    }
  }, [token, carpetaId, archivos]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      subirArchivos(e.target.files);
    }
  };

  const eliminarArchivo = (index: number) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    onArchivosSubidos(nuevosArchivos);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${!carpetaId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          id="onedrive-file-upload"
          multiple
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          disabled={!carpetaId || isUploading}
          className="hidden"
        />
        <label
          htmlFor="onedrive-file-upload"
          className={`cursor-pointer ${!carpetaId ? 'cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-600 mb-2">
            {isUploading ? 'Subiendo archivos...' : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="text-sm text-gray-500">
            PDF, DOCX, XLSX, PNG, JPG (máx. 10MB)
          </p>
          {!carpetaId && (
            <p className="text-sm text-amber-600 mt-2">
              Guarda primero para crear la carpeta en OneDrive
            </p>
          )}
        </label>
      </div>

      {archivos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Archivos subidos:</h4>
          {archivos.map((archivo, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{archivo.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {(archivo.tamano / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ver en OneDrive
                </a>
                <button
                  onClick={() => eliminarArchivo(index)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
