'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  Camera, 
  X, 
  Save, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  Home, 
  RefreshCw, 
  Loader2,
  Image as ImageIcon,
  Upload,
  ScanLine,
  Search
} from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import Tesseract from 'tesseract.js';

export default function EscanerPage() {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<'live' | 'ocr'>('live');
  
  // Escáner en Vivo
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [parsedData, setParsedData] = useState<{ 
    documento: string; 
    nombre: string;
    rh?: string;
    genero?: string;
    fechaNacimiento?: string;
  } | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  // OCR (Fotos)
  const [cedulaFront, setCedulaFront] = useState<File | null>(null);
  const [cedulaBack, setCedulaBack] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<{ 
    rawText: string; 
    possibleCC: string;
    possibleRH?: string;
    possibleBirth?: string;
  } | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Historial / Guardado
  const [cedulasDemo, setCedulasDemo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCedulasDemo();
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

  const fetchCedulasDemo = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cedulas_demo')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setCedulasDemo(data);
    setLoading(false);
  };

  // --- PARSER CÉDULA COLOMBIANA (PDF417) ---
  const parseColombianID = (raw: string) => {
    try {
      // 1. Identificar inicio de trama válida (PubDSK_1)
      const startIdx = raw.indexOf('PubDSK_1');
      // Si no hay PubDSK_1, intentamos buscar el patrón de Cédula+Apellido directamente
      // (A veces el header no se lee bien)
      
      const workingRaw = startIdx !== -1 ? raw.substring(startIdx) : raw;
      
      // 2. Limpiar caracteres de control
      // Reemplazamos nulos (\0) y otros caracteres no imprimibles por '|'
      const clean = workingRaw.replace(/[\x00-\x1F\x7F-\x9F]+/g, '|');
      
      // 3. Buscar el patrón clave: Cédula (8-10 dígitos) pegada o seguida de Apellido1 (Letras mayúsculas)
      // Ejemplo: ...|1144086542MARTINEZ|...
      // Regex: Busca dígitos seguidos inmediatamente de letras, O dígitos seguidos de separador y letras
      const mainMatch = clean.match(/(\d{7,10})([A-ZÑ]+)/);
      
      if (!mainMatch) return null;

      const documento = mainMatch[1];
      const apellido1 = mainMatch[2]; // En este formato, el apellido1 suele venir pegado
      
      // 4. Buscar el resto de nombres
      // Dividimos por '|' y buscamos el bloque que contiene "Documento+Apellido1"
      const parts = clean.split('|').filter(p => p.trim().length > 0);
      
      // Encontramos el índice del bloque que contiene la cédula
      const docIndex = parts.findIndex(p => p.includes(documento));
      
      if (docIndex === -1) return { documento, nombre: 'Desconocido' };

      // Los siguientes bloques deberían ser Apellido2, Nombre1, Nombre2
      // Validamos que sean solo letras y no sean metadatos (que empiezan por números)
      
      let namesFound = [apellido1];
      
      // Iteramos los siguientes 3 bloques
      for (let i = 1; i <= 3; i++) {
        const part = parts[docIndex + i];
        if (part && /^[A-ZÑ\s]+$/.test(part) && part.length > 1) {
          namesFound.push(part);
        } else {
          // Si encontramos algo que no es nombre (ej: 0M...), paramos
          break;
        }
      }
      
      // Reconstruir nombre (Apellido1 Apellido2 Nombre1 Nombre2)
      // Nota: En la cédula el orden es Ap1 Ap2 Nom1 Nom2
      const nombreCompleto = namesFound.join(' ').trim();

      // 5. Extraer Metadatos (Género, Fecha Nacimiento, RH)
      // Buscamos patrón: 0M o 0F seguido de fecha YYYYMMDD y luego RH
      // Ejemplo: ...|0F19960214310010O+|...
      const metaMatch = clean.match(/(0[MF])(\d{8})\d*([OAB][+-]?)/);
      
      let rh = '';
      let genero = '';
      let fechaNacimiento = '';

      if (metaMatch) {
        genero = metaMatch[1] === '0M' ? 'Masculino' : 'Femenino';
        const f = metaMatch[2]; // YYYYMMDD
        fechaNacimiento = `${f.substring(0,4)}-${f.substring(4,6)}-${f.substring(6,8)}`;
        rh = metaMatch[3];
      }

      return { 
        documento, 
        nombre: nombreCompleto,
        rh,
        genero,
        fechaNacimiento
      };

    } catch (e) {
      console.error("Error parsing ID", e);
      return null;
    }
  };

      if (metaMatch) {
        genero = metaMatch[1] === '0M' ? 'Masculino' : 'Femenino';
        const fechaRaw = metaMatch[2]; // YYYYMMDD
        fechaNacimiento = `${fechaRaw.substring(0,4)}-${fechaRaw.substring(4,6)}-${fechaRaw.substring(6,8)}`;
        rh = metaMatch[3];
      }

      // Reconstruir nombre completo (orden aproximado)
      // En PDF417 suele ser: Apellido1 Apellido2 Nombre1 Nombre2
      // Pero validNames ya los tiene en ese orden si la extracción fue lineal
      const nombreCompleto = validNames.join(' ').trim();
      
      return { 
        documento, 
        nombre: nombreCompleto,
        rh,
        genero,
        fechaNacimiento
      };

    } catch (e) {
      console.error("Error parsing ID", e);
      return null;
    }
  };

  // --- ESCÁNER EN VIVO ---
  const startScanning = async () => {
    setScanning(true);
    setCameraError('');
    setScannedData('');
    setParsedData(null);

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);
      
      const codeReader = new BrowserMultiFormatReader(hints);
      
      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, error, controls) => {
          if (result) {
            controls.stop();
            controlsRef.current = null;
            setScanning(false);
            
            const text = result.getText();
            setScannedData(text);
            
            // Intentar parsear
            const parsed = parseColombianID(text);
            if (parsed) {
              setParsedData(parsed);
              if (navigator.vibrate) navigator.vibrate(200);
            }
          }
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

  // --- OCR (FOTOS) ---
  const handleOcrScan = async () => {
    if (!cedulaFront && !cedulaBack) return alert('Sube al menos una imagen de la cédula');
    setOcrLoading(true);
    setOcrResult(null);

    try {
      let extractedText = '';
      let possibleCC = '';
      let possibleRH = '';
      let possibleBirth = '';
      
      // Procesar Frontal
      if (cedulaFront) {
        const { data: { text } } = await Tesseract.recognize(cedulaFront, 'spa');
        extractedText += '\n--- FRONTAL ---\n' + text;
        
        // Buscar CC en frontal: "NUMERO 1.107.099.984"
        // Mejoras: Espacios opcionales entre letras de NUMERO, manejo de errores OCR (0 por O, I por 1, etc)
        // Regex: Busca algo parecido a "NUMERO" seguido de dígitos con posibles puntos
        const frontCC = text.match(/(?:N\s*U\s*M\s*E\s*R\s*[O0I])\s*[:.]?\s*(\d{1,3}[.]?\d{3}[.]?\d{3})/i);
        
        if (frontCC) {
          possibleCC = frontCC[1].replace(/\./g, '');
        } else {
          // Intento alternativo: Buscar patrón de cédula aislado (ej: 1.144.086.542)
          const isolatedCC = text.match(/\b(\d{1,3}\.\d{3}\.\d{3})\b/);
          if (isolatedCC) possibleCC = isolatedCC[1].replace(/\./g, '');
        }
      }

      // Procesar Trasera
      if (cedulaBack) {
        const { data: { text } } = await Tesseract.recognize(cedulaBack, 'spa');
        extractedText += '\n--- TRASERA ---\n' + text;
        
        // Buscar CC en trasera (zona inferior): ...-M-1107099984-...
        // Patrón: Letra - ID - Fecha
        const backCC = text.match(/-[MF]-(\d{7,10})-/);
        if (backCC && !possibleCC) possibleCC = backCC[1];

        // Buscar Fecha Nacimiento: "15-JUL-1996" o "15 JUL 1996"
        // A veces el OCR lee espacios en lugar de guiones
        const birthMatch = text.match(/(\d{1,2})[\s-]([A-Z]{3})[\s-](\d{4})/);
        if (birthMatch) {
          possibleBirth = `${birthMatch[1]}-${birthMatch[2]}-${birthMatch[3]}`;
        }

        // Buscar RH: "RH O+" o "RH: O+"
        const rhMatch = text.match(/RH\s*[:.]?\s*([OAB][+-]?)/i);
        if (rhMatch) possibleRH = rhMatch[1];
      }

      // Fallback simple para CC si no se encontró con patrones específicos
      // Buscamos el número más largo entre 7 y 10 dígitos que no sea una fecha
      if (!possibleCC) {
        const allNumbers = extractedText.match(/\b\d{7,10}\b/g);
        if (allNumbers) {
          // Filtramos números que parecen fechas (ej: 19960214) o teléfonos
          // Asumimos que la cédula es el número más probable en ese rango
          const candidates = allNumbers.filter(n => !n.startsWith('19') && !n.startsWith('20'));
          if (candidates.length > 0) possibleCC = candidates[0];
        }
      }

      setOcrResult({
        rawText: extractedText,
        possibleCC,
        possibleRH,
        possibleBirth
      });

    } catch (error: any) {
      console.error(error);
      alert('Error al procesar imágenes: ' + error.message);
    } finally {
      setOcrLoading(false);
    }
  };

  // --- GUARDAR ---
  const handleSave = async () => {
    const dataToSave = ocrResult ? ocrResult.rawText : scannedData;
    
    if (!dataToSave.trim()) {
      alert('No hay datos para guardar');
      return;
    }

    try {
      const { error } = await supabase
        .from('cedulas_demo')
        .insert([{
          data_cruda: dataToSave,
          cedula_parseada: parsedData || (ocrResult?.possibleCC ? { documento: ocrResult.possibleCC } : null),
          estado: 'sin_procesar'
        }]);

      if (error) {
        alert('Error al guardar: ' + error.message);
      } else {
        alert('Datos guardados exitosamente');
        setScannedData('');
        setParsedData(null);
        setOcrResult(null);
        setCedulaFront(null);
        setCedulaBack(null);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <Home size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Escáner de Cédulas</h1>
          </div>
          <p className="text-slate-500 ml-7">Lectura de códigos PDF417 y OCR de Documentos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'live' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera size={18} /> Escáner en Vivo (PDF417)
        </button>
        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ocr' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ImageIcon size={18} /> Extracción por Foto (OCR)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* --- COLUMNA IZQUIERDA: INPUT --- */}
        <div className="space-y-6">
          
          {/* MODO VIVO */}
          {activeTab === 'live' && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera size={20} />
                Cámara
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
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-scan opacity-50"></div>
                    </div>
                    <div className="absolute bottom-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      Alinea el código de barras trasero
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

              <button
                onClick={scanning ? stopScanning : startScanning}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  scanning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {scanning ? (
                  <>
                    <X size={20} /> Detener
                  </>
                ) : (
                  <>
                    <Camera size={20} /> Activar Cámara
                  </>
                )}
              </button>
            </div>
          )}

          {/* MODO OCR */}
          {activeTab === 'ocr' && (
            <div className="card p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload size={20} />
                Subir Fotos
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Cara Frontal</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setCedulaFront(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload size={24} />
                      <span className="text-sm">{cedulaFront ? cedulaFront.name : 'Seleccionar archivo...'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Cara Trasera</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setCedulaBack(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload size={24} />
                      <span className="text-sm">{cedulaBack ? cedulaBack.name : 'Seleccionar archivo...'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleOcrScan}
                  disabled={ocrLoading || (!cedulaFront && !cedulaBack)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {ocrLoading ? <Loader2 className="animate-spin" /> : <ScanLine />} 
                  {ocrLoading ? 'Procesando...' : 'Extraer Texto'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- COLUMNA DERECHA: RESULTADOS --- */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Resultados
          </h2>

          {/* Resultado Parseado (PDF417) */}
          {parsedData && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <Check size={18} /> Datos Identificados
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="block text-xs text-emerald-600 font-bold uppercase">Nombre Completo</span>
                  <span className="text-slate-800 font-medium">{parsedData.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-emerald-600 font-bold uppercase">Documento (CC)</span>
                    <span className="text-slate-800 font-medium">{parsedData.documento}</span>
                  </div>
                  {parsedData.rh && (
                    <div>
                      <span className="block text-xs text-emerald-600 font-bold uppercase">RH</span>
                      <span className="text-slate-800 font-medium">{parsedData.rh}</span>
                    </div>
                  )}
                </div>
                {(parsedData.genero || parsedData.fechaNacimiento) && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                    {parsedData.genero && (
                      <div>
                        <span className="block text-xs text-emerald-600 font-bold uppercase">Género</span>
                        <span className="text-slate-800 font-medium">{parsedData.genero}</span>
                      </div>
                    )}
                    {parsedData.fechaNacimiento && (
                      <div>
                        <span className="block text-xs text-emerald-600 font-bold uppercase">Fecha Nacimiento</span>
                        <span className="text-slate-800 font-medium">{parsedData.fechaNacimiento}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resultado OCR */}
          {ocrResult && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                <ScanLine size={18} /> Resultado OCR
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {ocrResult.possibleCC && (
                  <div className="p-2 bg-white rounded border border-indigo-100 text-sm">
                    <span className="block text-xs font-bold text-indigo-600 uppercase">Cédula</span> 
                    {ocrResult.possibleCC}
                  </div>
                )}
                {ocrResult.possibleRH && (
                  <div className="p-2 bg-white rounded border border-indigo-100 text-sm">
                    <span className="block text-xs font-bold text-indigo-600 uppercase">RH</span> 
                    {ocrResult.possibleRH}
                  </div>
                )}
                {ocrResult.possibleBirth && (
                  <div className="p-2 bg-white rounded border border-indigo-100 text-sm col-span-2">
                    <span className="block text-xs font-bold text-indigo-600 uppercase">Fecha Nacimiento</span> 
                    {ocrResult.possibleBirth}
                  </div>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto text-xs font-mono bg-white p-2 rounded border border-indigo-100 text-slate-600 whitespace-pre-wrap">
                {ocrResult.rawText}
              </div>
            </div>
          )}

          {/* Datos Crudos (Textarea) */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Datos Crudos / Log</label>
            <textarea
              value={ocrResult ? ocrResult.rawText : scannedData}
              readOnly
              rows={6}
              placeholder="Esperando datos..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-xs font-mono focus:outline-none resize-none"
            />
          </div>

          {(scannedData || ocrResult) ? (
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(ocrResult ? ocrResult.rawText : scannedData)}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado' : 'Copiar'}
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
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Escanea o sube una foto para ver resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="card">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} />
            Historial de Escaneos
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
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Datos</th>
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
                      {item.cedula_parseada ? (
                        <div className="text-xs">
                          <div className="font-bold text-slate-800">{item.cedula_parseada.nombre}</div>
                          <div className="text-slate-500">CC: {item.cedula_parseada.documento}</div>
                        </div>
                      ) : (
                        <div className="max-w-xs truncate font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                          {item.data_cruda}
                        </div>
                      )}
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
