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
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  UserPlus,
  FileBadge
} from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function GestionSocialPage() {
  const [activeTab, setActiveTab] = useState<'eventos' | 'lideres' | 'boletas' | 'escanear'>('eventos');
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(false);
  
  // Eventos
  const [eventos, setEventos] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ nombre: '', lugar: '', fecha: '', hora: '' });
  const [fondoFile, setFondoFile] = useState<File | null>(null);

  // Líderes
  const [lideres, setLideres] = useState<any[]>([]);
  const [newLider, setNewLider] = useState({ nombre: '', documento: '', telefono: '' });
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // Boletas
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedLider, setSelectedLider] = useState('');
  const [cantidadBoletas, setCantidadBoletas] = useState(10);

  // Escáner
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; type?: 'boleta' | 'lider' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchEventos();
    fetchLideres();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase.from('social_eventos').select('*').order('created_at', { ascending: false });
    if (data) setEventos(data);
  };

  const fetchLideres = async () => {
    const { data } = await supabase.from('social_lideres').select('*').order('nombre');
    if (data) setLideres(data);
  };

  // --- 1. GESTIÓN DE EVENTOS ---
  const handleCreateEvent = async () => {
    if (!newEvent.nombre || !newEvent.fecha) return alert('Nombre y fecha requeridos');
    setLoading(true);

    try {
      let fondoUrl = null;
      if (fondoFile) {
        const fileName = `fondo_${Date.now()}_${fondoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gestion-social')
          .upload(fileName, fondoFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrl } = supabase.storage.from('gestion-social').getPublicUrl(fileName);
        fondoUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from('social_eventos').insert([{
        ...newEvent,
        fondo_url: fondoUrl
      }]);

      if (error) throw error;

      alert('Evento creado exitosamente');
      setNewEvent({ nombre: '', lugar: '', fecha: '', hora: '' });
      setFondoFile(null);
      fetchEventos();
    } catch (error: any) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GESTIÓN DE LÍDERES (CARNETIZACIÓN) ---
  const handleCreateLider = async () => {
    if (!newLider.nombre || !newLider.documento) return alert('Nombre y documento requeridos');
    setLoading(true);

    try {
      let fotoUrl = null;
      if (fotoFile) {
        const fileName = `foto_${newLider.documento}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('gestion-social')
          .upload(fileName, fotoFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrl } = supabase.storage.from('gestion-social').getPublicUrl(fileName);
        fotoUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from('social_lideres').insert([{
        ...newLider,
        foto_url: fotoUrl
      }]);

      if (error) throw error;

      alert('Líder registrado exitosamente');
      setNewLider({ nombre: '', documento: '', telefono: '' });
      setFotoFile(null);
      fetchLideres();
    } catch (error: any) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCarnet = async (lider: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [55, 85] // Tamaño tarjeta de crédito estándar
    });

    // Fondo / Diseño
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 55, 85, 'F');
    
    // Encabezado
    doc.setFillColor(37, 99, 235); // Azul
    doc.rect(0, 0, 55, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LÍDER SOCIAL', 27.5, 10, { align: 'center' });

    // Foto
    if (lider.foto_url) {
      try {
        // Intentar cargar imagen (puede fallar por CORS si no está configurado)
        // Para demo usamos un placeholder si falla o si no hay foto
        doc.addImage(lider.foto_url, 'JPEG', 12.5, 20, 30, 30);
      } catch (e) {
        doc.setDrawColor(200);
        doc.rect(12.5, 20, 30, 30);
        doc.setTextColor(150);
        doc.text('Sin Foto', 27.5, 35, { align: 'center' });
      }
    } else {
      doc.setDrawColor(200);
      doc.rect(12.5, 20, 30, 30);
    }

    // Datos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(lider.nombre, 27.5, 55, { align: 'center', maxWidth: 50 });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`CC: ${lider.documento}`, 27.5, 60, { align: 'center' });

    // QR Personal
    try {
      const qrDataUrl = await QRCode.toDataURL(`LIDER:${lider.codigo_qr_personal}`);
      doc.addImage(qrDataUrl, 'PNG', 17.5, 63, 20, 20);
    } catch (e) {
      console.error(e);
    }

    doc.save(`Carnet_${lider.nombre}.pdf`);
  };

  // --- 3. GENERACIÓN DE BOLETAS ---
  const handleGenerateBoletas = async () => {
    if (!selectedEvento || !selectedLider) return alert('Selecciona evento y líder');
    setLoading(true);

    try {
      const evento = eventos.find(e => e.id == selectedEvento);
      const lider = lideres.find(l => l.id == selectedLider);

      // Crear registros
      const boletasData = [];
      for (let i = 1; i <= cantidadBoletas; i++) {
        boletasData.push({
          evento_id: selectedEvento,
          lider_id: selectedLider,
          consecutivo: i, // Esto podría ser un consecutivo global si se prefiere
          estado: 'generada'
        });
      }

      const { data: boletas, error } = await supabase
        .from('social_boletas')
        .insert(boletasData)
        .select();

      if (error) throw error;

      // Generar PDF con fondo
      await generateBoletasPDF(evento, boletas);
      
      alert('Boletas generadas correctamente');
    } catch (error: any) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBoletasPDF = async (evento: any, boletas: any[]) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [150, 60] // Formato boleta alargada
    });

    for (let i = 0; i < boletas.length; i++) {
      if (i > 0) doc.addPage();
      const boleta = boletas[i];

      // Fondo
      if (evento.fondo_url) {
        try {
          doc.addImage(evento.fondo_url, 'JPEG', 0, 0, 150, 60);
        } catch (e) {
          // Fallback si falla imagen
          doc.setFillColor(240, 240, 240);
          doc.rect(0, 0, 150, 60, 'F');
        }
      }

      // Contenido (Texto sobrepuesto)
      // Usamos un fondo blanco semitransparente para el texto si hay imagen
      doc.setFillColor(255, 255, 255);
      doc.rect(5, 5, 90, 50, 'F'); // Área de texto

      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(evento.nombre, 10, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${evento.fecha} - Hora: ${evento.hora}`, 10, 22);
      doc.text(`Lugar: ${evento.lugar}`, 10, 28);

      // Consecutivo destacado
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38); // Rojo
      doc.text(`No. ${String(boleta.consecutivo).padStart(4, '0')}`, 10, 45);

      // QR (Lado derecho)
      try {
        const qrDataUrl = await QRCode.toDataURL(boleta.codigo_qr);
        doc.addImage(qrDataUrl, 'PNG', 105, 5, 40, 40);
      } catch (e) {}
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(boleta.codigo_qr.substring(0, 8), 110, 50);
    }

    doc.save(`Boletas_${evento.nombre}_${Date.now()}.pdf`);
  };

  // --- 4. ESCÁNER UNIFICADO ---
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
    }
  };

  const processScan = async (code: string) => {
    // Detectar si es Líder o Boleta
    if (code.startsWith('LIDER:')) {
      // Es un carnet de líder
      const liderId = code.replace('LIDER:', '');
      const { data: lider } = await supabase
        .from('social_lideres')
        .select('*')
        .eq('codigo_qr_personal', liderId)
        .single();
      
      if (lider) {
        setScanResult({
          success: true,
          message: `LÍDER AUTORIZADO\n${lider.nombre}\nCC: ${lider.documento}`,
          type: 'lider'
        });
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setScanResult({ success: false, message: 'Carnet de Líder NO VÁLIDO' });
      }
    } else {
      // Asumimos que es una boleta
      const { data: boleta, error } = await supabase
        .from('social_boletas')
        .select('*, social_eventos(nombre), social_lideres(nombre)')
        .eq('codigo_qr', code)
        .single();

      if (error || !boleta) {
        setScanResult({ success: false, message: 'Código NO encontrado en el sistema' });
        return;
      }

      if (boleta.estado === 'usada') {
        setScanResult({ 
          success: false, 
          message: `BOLETA YA USADA\nEvento: ${boleta.social_eventos.nombre}\nLíder: ${boleta.social_lideres.nombre}` 
        });
        return;
      }

      // Marcar uso
      await supabase
        .from('social_boletas')
        .update({ estado: 'usada', used_at: new Date().toISOString() })
        .eq('id', boleta.id);

      setScanResult({
        success: true,
        message: `ACCESO CONCEDIDO\nBoleta #${boleta.consecutivo}\nLíder: ${boleta.social_lideres.nombre}`,
        type: 'boleta'
      });
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-blue-600">
          <Home size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Gestión Social & Eventos</h1>
      </div>

      {/* Navegación */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6 pb-2">
        {[
          { id: 'eventos', icon: Calendar, label: '1. Eventos' },
          { id: 'lideres', icon: Users, label: '2. Líderes (Carnets)' },
          { id: 'boletas', icon: Ticket, label: '3. Boletas' },
          { id: 'escanear', icon: QrCode, label: '4. Control Acceso' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB: EVENTOS --- */}
      {activeTab === 'eventos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Crear Nuevo Evento</h2>
            <div className="space-y-4">
              <input 
                className="input-field w-full p-2 border rounded" 
                placeholder="Nombre del Evento"
                value={newEvent.nombre}
                onChange={e => setNewEvent({...newEvent, nombre: e.target.value})}
              />
              <input 
                className="input-field w-full p-2 border rounded" 
                placeholder="Lugar / Ubicación"
                value={newEvent.lugar}
                onChange={e => setNewEvent({...newEvent, lugar: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="input-field w-full p-2 border rounded"
                  value={newEvent.fecha}
                  onChange={e => setNewEvent({...newEvent, fecha: e.target.value})}
                />
                <input 
                  type="time" 
                  className="input-field w-full p-2 border rounded"
                  value={newEvent.hora}
                  onChange={e => setNewEvent({...newEvent, hora: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen de Fondo (Boleta)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFondoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-slate-400 mt-1">Se usará como fondo en el PDF de las boletas.</p>
              </div>

              <button 
                onClick={handleCreateEvent}
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <PlusIcon />} Crear Evento
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Eventos Activos</h2>
            <div className="space-y-3">
              {eventos.map(ev => (
                <div key={ev.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <h3 className="font-bold">{ev.nombre}</h3>
                  <p className="text-sm text-slate-500 flex gap-2">
                    <Calendar size={14} /> {ev.fecha} <Clock size={14} /> {ev.hora}
                  </p>
                  <p className="text-sm text-slate-500 flex gap-2">
                    <MapPin size={14} /> {ev.lugar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: LÍDERES --- */}
      {activeTab === 'lideres' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Registrar Líder</h2>
            <div className="space-y-4">
              <input 
                className="input-field w-full p-2 border rounded" 
                placeholder="Nombre Completo"
                value={newLider.nombre}
                onChange={e => setNewLider({...newLider, nombre: e.target.value})}
              />
              <input 
                className="input-field w-full p-2 border rounded" 
                placeholder="Documento (CC)"
                value={newLider.documento}
                onChange={e => setNewLider({...newLider, documento: e.target.value})}
              />
              <input 
                className="input-field w-full p-2 border rounded" 
                placeholder="Teléfono"
                value={newLider.telefono}
                onChange={e => setNewLider({...newLider, telefono: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Foto del Líder</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFotoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button 
                onClick={handleCreateLider}
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <UserPlus />} Registrar Líder
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Directorio de Líderes</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {lideres.map(lid => (
                <div key={lid.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {lid.foto_url ? (
                      <img src={lid.foto_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <Users size={20} className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm">{lid.nombre}</h3>
                      <p className="text-xs text-slate-500">CC: {lid.documento}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateCarnet(lid)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                    title="Descargar Carnet"
                  >
                    <FileBadge size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: BOLETAS --- */}
      {activeTab === 'boletas' && (
        <div className="card p-6 max-w-lg mx-auto">
          <h2 className="font-bold text-lg mb-6 text-center">Generar Boletas para Evento</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">1. Selecciona el Evento</label>
              <select 
                className="w-full p-3 border rounded-lg bg-white"
                value={selectedEvento}
                onChange={e => setSelectedEvento(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">2. Selecciona el Líder Responsable</label>
              <select 
                className="w-full p-3 border rounded-lg bg-white"
                value={selectedLider}
                onChange={e => setSelectedLider(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">3. Cantidad de Boletas</label>
              <input 
                type="number"
                min="1"
                max="500"
                className="w-full p-3 border rounded-lg"
                value={cantidadBoletas}
                onChange={e => setCantidadBoletas(Number(e.target.value))}
              />
            </div>

            <button 
              onClick={handleGenerateBoletas}
              disabled={loading || !selectedEvento || !selectedLider}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Download />}
              Generar PDF de Boletas
            </button>
            
            <p className="text-xs text-slate-500 text-center">
              Se generará un PDF con el fondo del evento y los códigos QR únicos vinculados al líder seleccionado.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB: ESCÁNER --- */}
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
                <p className="mt-4 text-sm text-slate-400">Lee Boletas y Carnets de Líderes</p>
              </div>
            )}

            <video ref={videoRef} className="w-full h-full object-cover" />
            
            {scanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <button onClick={() => {
                  if (controlsRef.current) controlsRef.current.stop();
                  setScanning(false);
                }} className="px-4 py-2 bg-red-600/80 text-white rounded-full text-sm">
                  Detener
                </button>
              </div>
            )}
          </div>

          {scanResult && (
            <div className={`card p-6 text-center border-l-8 ${scanResult.success ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex justify-center mb-4">
                {scanResult.success ? <CheckCircle size={64} className="text-emerald-500" /> : <XCircle size={64} className="text-red-500" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{scanResult.success ? 'Acceso Permitido' : 'Acceso Denegado'}</h3>
              <p className="whitespace-pre-line text-slate-700 font-medium">{scanResult.message}</p>
              <button onClick={() => { setScanResult(null); startScanning(); }} className="mt-6 w-full py-3 bg-slate-800 text-white rounded-lg">
                Escanear Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlusIcon() { return <Plus size={20} />; }
import { Plus } from 'lucide-react';
