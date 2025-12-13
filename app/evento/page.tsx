'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  Users,
  Ticket,
  QrCode,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  BarChart3,
  Home,
  Camera,
  X
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function EventoPage() {
  const [activeTab, setActiveTab] = useState<'generar' | 'escanear' | 'reporte'>('generar');
  
  // Estados Generación
  const [liderNombre, setLiderNombre] = useState('');
  const [cantidadBoletas, setCantidadBoletas] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Estados Escáner
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  // Estados Reporte
  const [stats, setStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // --- LÓGICA GENERACIÓN ---

  const handleGenerar = async () => {
    if (!liderNombre.trim()) return alert('Ingresa el nombre del líder');
    setGenerating(true);

    try {
      // 1. Crear Líder
      const { data: lider, error: errLider } = await supabase
        .from('eventos_lideres')
        .insert([{ nombre: liderNombre }])
        .select()
        .single();

      if (errLider) throw errLider;

      // 2. Crear Boletas
      const boletasData = [];
      for (let i = 1; i <= cantidadBoletas; i++) {
        boletasData.push({
          lider_id: lider.id,
          consecutivo: i,
          estado: 'generada'
        });
      }

      const { data: boletas, error: errBoletas } = await supabase
        .from('eventos_boletas')
        .insert(boletasData)
        .select();

      if (errBoletas) throw errBoletas;

      // 3. Generar PDF
      await generatePDF(lider.nombre, boletas);

      alert(`¡Éxito! Se generaron ${boletas.length} boletas para ${lider.nombre}.`);
      setLiderNombre('');
      setCantidadBoletas(10);
    } catch (error: any) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async (liderName: string, boletas: any[]) => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 0; i < boletas.length; i++) {
      const boleta = boletas[i];
      
      // Si no cabe en la página, nueva página
      if (yPos + 60 > pageHeight) {
        doc.addPage();
        yPos = 20;
      }

      // Marco de la boleta
      doc.setDrawColor(0);
      doc.rect(20, yPos, 170, 50);

      // Texto
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GRAN EVENTO DE CONVOCATORIA', 30, yPos + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Líder: ${liderName}`, 30, yPos + 25);
      doc.text(`Boleta #: ${boleta.consecutivo}`, 30, yPos + 35);
      doc.text(`ID Único: ${boleta.codigo_qr.substring(0, 8)}...`, 30, yPos + 42);

      // Generar QR
      try {
        const qrDataUrl = await QRCode.toDataURL(boleta.codigo_qr);
        doc.addImage(qrDataUrl, 'PNG', 140, yPos + 2, 45, 45);
      } catch (e) {
        console.error('Error generando QR', e);
      }

      yPos += 60;
    }

    doc.save(`Boletas_${liderName.replace(/\s+/g, '_')}.pdf`);
  };

  // --- LÓGICA ESCÁNER ---

  const startScanning = async () => {
    setScanning(true);
    setScanResult(null);
    
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      
      const codeReader = new BrowserMultiFormatReader(hints);
      
      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, error, controls) => {
          if (result) {
            controls.stop();
            setScanning(false);
            controlsRef.current = null;
            await processScan(result.getText());
          }
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      console.error(e);
      setScanning(false);
      alert('No se pudo iniciar la cámara');
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  };

  const processScan = async (qrCode: string) => {
    try {
      // Buscar boleta
      const { data: boleta, error } = await supabase
        .from('eventos_boletas')
        .select('*, eventos_lideres(nombre)')
        .eq('codigo_qr', qrCode)
        .single();

      if (error || !boleta) {
        setScanResult({ success: false, message: 'Boleta NO válida o no encontrada.' });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
      }

      if (boleta.estado === 'asistio') {
        setScanResult({ 
          success: false, 
          message: `¡CUIDADO! Esta boleta YA FUE USADA.\nLíder: ${boleta.eventos_lideres.nombre}\nIngresó: ${new Date(boleta.attended_at).toLocaleTimeString()}` 
        });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        return;
      }

      // Marcar asistencia
      const { error: updateError } = await supabase
        .from('eventos_boletas')
        .update({ estado: 'asistio', attended_at: new Date().toISOString() })
        .eq('id', boleta.id);

      if (updateError) throw updateError;

      setScanResult({ 
        success: true, 
        message: `¡BIENVENIDO!\nLíder: ${boleta.eventos_lideres.nombre}\nBoleta #${boleta.consecutivo}`,
        data: boleta
      });
      if (navigator.vibrate) navigator.vibrate(200);

    } catch (err: any) {
      setScanResult({ success: false, message: 'Error procesando: ' + err.message });
    }
  };

  // --- LÓGICA REPORTES ---

  const loadStats = async () => {
    setLoadingStats(true);
    // Esta consulta es un poco compleja para Supabase JS directo si no hay vistas,
    // así que haremos algo simple: traer todo y calcular en JS (para prototipo está bien)
    
    const { data: lideres } = await supabase.from('eventos_lideres').select('*');
    const { data: boletas } = await supabase.from('eventos_boletas').select('*');

    if (lideres && boletas) {
      const statsCalc = lideres.map(l => {
        const misBoletas = boletas.filter(b => b.lider_id === l.id);
        const total = misBoletas.length;
        const asistieron = misBoletas.filter(b => b.estado === 'asistio').length;
        const porcentaje = total > 0 ? Math.round((asistieron / total) * 100) : 0;
        
        return {
          ...l,
          total,
          asistieron,
          porcentaje
        };
      });
      
      // Ordenar por mayor asistencia
      statsCalc.sort((a, b) => b.asistieron - a.asistieron);
      setStats(statsCalc);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    if (activeTab === 'reporte') {
      loadStats();
    }
    return () => stopScanning();
  }, [activeTab]);

  return (
    <div className="page-container max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-blue-600">
          <Home size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Evento & Convocatoria</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('generar')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'generar' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ticket size={18} /> Generar Boletas
          </div>
        </button>
        <button
          onClick={() => setActiveTab('escanear')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'escanear' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <QrCode size={18} /> Control Acceso
          </div>
        </button>
        <button
          onClick={() => setActiveTab('reporte')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'reporte' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} /> Reporte Líderes
          </div>
        </button>
      </div>

      {/* CONTENIDO TABS */}
      
      {/* 1. GENERAR */}
      {activeTab === 'generar' && (
        <div className="card p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Nueva Entrega de Boletas</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Líder</label>
              <input
                type="text"
                value={liderNombre}
                onChange={(e) => setLiderNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad de Boletas</label>
              <input
                type="number"
                value={cantidadBoletas}
                onChange={(e) => setCantidadBoletas(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={handleGenerar}
              disabled={generating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Download size={20} /> Generar y Descargar PDF
                </>
              )}
            </button>
            
            <p className="text-xs text-slate-500 text-center mt-4">
              Esto creará el registro en base de datos y descargará un PDF listo para imprimir y recortar.
            </p>
          </div>
        </div>
      )}

      {/* 2. ESCANEAR */}
      {activeTab === 'escanear' && (
        <div className="max-w-md mx-auto">
          <div className="card p-4 mb-4 bg-black text-white overflow-hidden relative rounded-xl aspect-[3/4]">
            {!scanning && !scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/90">
                <QrCode size={64} className="mb-4 opacity-50" />
                <button
                  onClick={startScanning}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold flex items-center gap-2"
                >
                  <Camera size={20} /> Iniciar Escáner
                </button>
              </div>
            )}

            <video ref={videoRef} className="w-full h-full object-cover" />
            
            {scanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <button 
                  onClick={stopScanning}
                  className="px-4 py-2 bg-red-600/80 text-white rounded-full text-sm font-medium backdrop-blur-sm"
                >
                  Detener
                </button>
              </div>
            )}
          </div>

          {/* Resultado del Escaneo */}
          {scanResult && (
            <div className={`card p-6 text-center border-l-8 ${scanResult.success ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex justify-center mb-4">
                {scanResult.success ? (
                  <CheckCircle size={64} className="text-emerald-500" />
                ) : (
                  <XCircle size={64} className="text-red-500" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${scanResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                {scanResult.success ? 'Acceso Permitido' : 'Acceso Denegado'}
              </h3>
              <p className="whitespace-pre-line text-slate-700 font-medium">
                {scanResult.message}
              </p>
              
              <button
                onClick={() => { setScanResult(null); startScanning(); }}
                className="mt-6 w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700"
              >
                Escanear Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. REPORTE */}
      {activeTab === 'reporte' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Ranking de Convocatoria</h2>
            <button onClick={loadStats} className="text-blue-600 text-sm font-medium hover:underline">Actualizar</button>
          </div>
          
          {loadingStats ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="animate-spin mx-auto mb-2" /> Cargando datos...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-3">Líder</th>
                    <th className="px-6 py-3 text-center">Boletas Entregadas</th>
                    <th className="px-6 py-3 text-center">Asistentes (QR)</th>
                    <th className="px-6 py-3 text-center">Efectividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.map((lider) => (
                    <tr key={lider.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{lider.nombre}</td>
                      <td className="px-6 py-4 text-center">{lider.total}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{lider.asistieron}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          lider.porcentaje >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          lider.porcentaje >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {lider.porcentaje}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        No hay datos registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
