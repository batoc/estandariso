'use client';

import { useState, useCallback } from 'react';

interface ArchivoSubido {
  nombre: string;
  url: string;
  tamaño: number;
  fecha: string;
}

interface GoogleDriveUploadProps {
  accessToken: string | null;
  carpetaId: string | null;
  onFilesUploaded: (archivos: ArchivoSubido[]) => void;
}

export default function GoogleDriveUpload({ accessToken, carpetaId, onFilesUploaded }: GoogleDriveUploadProps) {
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!accessToken || !carpetaId) {
      setError('Debes conectarte a Google Drive primero y debe existir una carpeta');
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
        formData.append('carpetaId', carpetaId);
        formData.append('subcarpeta', 'Evidencias');

        const response = await fetch('/api/googledrive/upload', {
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
  }, [accessToken, carpetaId, archivos, onFilesUploaded]);

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
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          Conecta con Google Drive para poder subir archivos adjuntos
        </p>
      </div>
    );
  }

  if (!carpetaId) {
    return (
      <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
        <p className="text-yellow-700">
          Guarda la revisión primero para crear la carpeta en Drive, luego podrás subir archivos
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
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="file-upload-drive"
          multiple
          onChange={handleChange}
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          disabled={uploading}
        />
        
        <label
          htmlFor="file-upload-drive"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="text-5xl mb-3">📎</div>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {uploading ? 'Subiendo archivos...' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            o click para seleccionar
          </p>
          <p className="text-xs text-gray-400">
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
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-gray-800">
              Archivos Adjuntos ({archivos.length})
            </h4>
          </div>
          <ul className="divide-y divide-gray-200">
            {archivos.map((archivo, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {archivo.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(archivo.tamaño)} • {new Date(archivo.fecha).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver en Drive
                  </a>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm ml-3"
                  >
                    Eliminar
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
