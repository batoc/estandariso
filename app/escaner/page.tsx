'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Camera,
  Plus,
  X,
  Save,
  Loader2,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Home,
  FileText
} from 'lucide-react';
import { BrowserPDF417Reader } from '@zxing/browser';

export default function EscanerPage() {
  const [cedulasDemo, setCedulasDemo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserPDF417Reader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCedulasDemo();
    return () => {
      stopScanning();
    };
  }, []);

  const fetchCedulasDemo = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cedulas_demo')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setCedulasDemo(data);
    }
    setLoading(false);
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setScannedData('');

      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Inicializar el lector PDF417
      readerRef.current = new BrowserPDF417Reader();

      // Configurar escaneo rápido (100ms entre intentos)
      scanningIntervalRef.current = setInterval(async () => {
        if (videoRef.current && readerRef.current) {
          try {
            const result = await readerRef.current.decode(videoRef.current);
            if (result) {
              setScannedData(result.getText());
              setShowSaveForm(true);
              stopScanning();
            }
          } catch (err) {
            // No se encontró código, continuar escaneando
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);

    // Detener el intervalo de escaneo
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
      scanningIntervalRef.current = null;
    }

    // Detener el stream de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleSave = async () => {
    if (!scannedData.trim()) {
      alert('No hay datos para guardar');
      return;
    }

    try {
      const { error } = await supabase
        .from('cedulas_demo')
        .insert([{
          data_cruda: scannedData,
          cedula_parseada: null, // Implementar lógica de parseo más adelante
          estado: 'sin_procesar'
        }]);

      if (error) {
        alert('Error al guardar: ' + error.message);
      } else {
        alert('Datos guardados exitosamente');
        setScannedData('');
        setShowSaveForm(false);
        fetchCedulasDemo();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error inesperado: ' + String(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este registro?')) {
      const { error } = await supabase.from('cedulas_demo').delete().eq('id', id);
      if (!error) {
        fetchCedulasDemo();
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scannedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Home size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Escáner de Cédulas Colombianas</h1>
          </div>
          <p className="text-slate-500 ml-7">Prueba de lectura de códigos PDF417 en tiempo real</p>
        </div>
      </div>

      {/* Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cámara */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Camera size={20} />
            Captura en Vivo
          </h2>

          <div className="bg-slate-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            {scanning ? (
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Cámara desactivada</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={scanning ? stopScanning : startScanning}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              scanning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {scanning ? (
              <>
                <X size={20} />
                Detener Escaneo
              </>
            ) : (
              <>
                <Camera size={20} />
                Activar Cámara
              </>
            )}
          </button>

          {scanning && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
              <Loader2 className="animate-spin" size={18} />
              Escaneando... Apunta el código PDF417 hacia la cámara
            </div>
          )}
        </div>

        {/* Datos Escaneados */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Datos Capturados
          </h2>

          <textarea
            value={scannedData}
            readOnly
            rows={8}
            placeholder="Los datos escaneados aparecerán aquí..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-mono mb-4 focus:outline-none"
          />

          {scannedData && (
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copiar Texto
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} />
                Guardar en BD
              </button>
            </div>
          )}

          {!scannedData && (
            <div className="p-4 bg-slate-100 rounded-lg text-center text-slate-600">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Escanea un código PDF417 para ver los datos</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} />
            Últimos Registros ({cedulasDemo.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            Cargando registros...
          </div>
        ) : cedulasDemo.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros aún. Escanea un código para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Datos Crudos (Primeros 50 caracteres)</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cedulasDemo.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                      {new Date(item.created_at).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-xs text-slate-700 font-mono break-words bg-slate-50 p-2 rounded border border-slate-200">
                          {item.data_cruda.substring(0, 50)}
                          {item.data_cruda.length > 50 ? '...' : ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.estado === 'procesada' ? 'bg-emerald-100 text-emerald-700' :
                        item.estado === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">ℹ️ Información:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>El formato PDF417 es más complejo que QR. La lectura puede tomar unos segundos.</li>
          <li>Asegúrate de tener buena iluminación y que el código esté completamente visible.</li>
          <li>Los datos crudos se guardan tal cual se leen. Lógica de parseo pendiente.</li>
          <li>Este módulo es completamente independiente del sistema de gestión de calidad.</li>
        </ul>
      </div>
    </div>
  );
}
