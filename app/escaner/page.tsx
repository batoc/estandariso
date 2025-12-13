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
  FileText,
  RefreshCw
} from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function EscanerPage() {
  const [cedulasDemo, setCedulasDemo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

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
    setScanning(true);
    setScannedData('');
    setCameraError(null);
    setShowSaveForm(false);

    try {
      // Configurar hints para optimizar lectura de PDF417
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);
      hints.set(DecodeHintType.TRY_HARDER, true); // Importante para códigos densos

      const codeReader = new BrowserMultiFormatReader(hints);

      // Iniciar decodificación desde cámara
      // undefined = cámara por defecto (usualmente trasera en móviles si facingMode no se especifica, 
      // pero zxing intenta buscar la trasera)
      const controls = await codeReader.decodeFromVideoDevice(
        undefined, 
        videoRef.current!,
        (result, error, controls) => {
          if (result) {
            // Código detectado exitosamente
            const text = result.getText();
            console.log('Código detectado:', text);
            setScannedData(text);
            setShowSaveForm(true);
            
            // Detener escaneo automáticamente
            controls.stop();
            setScanning(false);
            controlsRef.current = null;
            
            // Feedback vibración (si soportado)
            if (navigator.vibrate) navigator.vibrate(200);
          }
          // Los errores de "NotFoundException" son normales mientras busca, los ignoramos
        }
      );
      
      controlsRef.current = controls;
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      setCameraError('No se pudo acceder a la cámara. Asegúrate de dar permisos y usar HTTPS.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
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
          cedula_parseada: null,
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
            <h1 className="text-2xl font-bold text-slate-800">Escáner de Cédulas</h1>
          </div>
          <p className="text-slate-500 ml-7">Lectura de códigos PDF417 (Cédulas Colombianas)</p>
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

          {cameraError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {cameraError}
            </div>
          )}

          <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-[4/3]">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
            />
            
            {/* Overlay de guía visual */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[30%] border-2 border-red-500/80 rounded-lg relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
                  
                  {/* Línea de escaneo animada */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-scan opacity-50"></div>
                </div>
                <div className="absolute bottom-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  Alinea el código de barras aquí
                </div>
              </div>
            )}

            {!scanning && !scannedData && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-100">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Cámara desactivada</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={scanning ? stopScanning : startScanning}
              className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                scanning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {scanning ? (
                <>
                  <X size={20} />
                  Detener
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Activar Cámara
                </>
              )}
            </button>
          </div>

          {scanning && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700 animate-pulse">
              <Loader2 className="animate-spin" size={18} />
              Buscando código PDF417... Mantén la cédula quieta.
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
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm font-mono mb-4 focus:outline-none resize-none"
          />

          {scannedData ? (
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
                    Copiar
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save size={18} />
                Guardar
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-100 rounded-lg text-center text-slate-600">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Escanea un código para ver los datos</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-700 mb-2 text-sm">Consejos para escanear:</h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Asegúrate de tener <strong>buena iluminación</strong>.</li>
              <li>Evita reflejos o sombras sobre el código.</li>
              <li>Mantén la cédula quieta y paralela a la cámara.</li>
              <li>Acerca o aleja la cámara lentamente hasta que enfoque.</li>
              <li>El código PDF417 es la barra ancha en la parte trasera.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} />
            Últimos Registros
          </h3>
          <button 
            onClick={fetchCedulasDemo}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Actualizar lista"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            Cargando registros...
          </div>
        ) : cedulasDemo.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay registros aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Datos (Inicio)</th>
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
                      <div className="max-w-xs truncate font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.data_cruda}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
