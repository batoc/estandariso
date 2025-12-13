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
  UserPlus,
  FileBadge,
  TrendingUp,
  Edit,
  Trash2,
  Trophy,
  Save,
  X
} from 'lucide-react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function GestionSocialPage() {
  const [activeTab, setActiveTab] = useState<'eventos' | 'lideres' | 'boletas' | 'escanear' | 'historial' | 'ranking' | 'cedulas'>('eventos');
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(false);
  
  // Eventos
  const [eventos, setEventos] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ nombre: '', lugar: '', fecha: '', hora: '' });
  const [fondoFile, setFondoFile] = useState<File | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Líderes
  const [lideres, setLideres] = useState<any[]>([]);
  const [newLider, setNewLider] = useState({ nombre: '', documento: '', telefono: '' });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [editingLiderId, setEditingLiderId] = useState<string | null>(null);

  // Boletas
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedLider, setSelectedLider] = useState('');
  const [cantidadBoletas, setCantidadBoletas] = useState(10);

  // Escáner
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; type?: 'boleta' | 'lider' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  // Estadísticas y Ranking
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsLeader, setStatsLeader] = useState<any>(null);
  const [leaderStats, setLeaderStats] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any[]>([]);
  const [rankingData, setRankingData] = useState<any[]>([]);

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchEventos();
    fetchLideres();
  }, []);

  useEffect(() => {
    if (activeTab === 'historial') fetchGlobalStats();
    if (activeTab === 'ranking') fetchRanking();
  }, [activeTab]);

  const fetchEventos = async () => {
    const { data } = await supabase.from('social_eventos').select('*').order('created_at', { ascending: false });
    if (data) setEventos(data);
  };

  const fetchLideres = async () => {
    const { data } = await supabase.from('social_lideres').select('*').order('nombre');
    if (data) setLideres(data);
  };

  const fetchLeaderStats = async (lider: any) => {
    setLoading(true);
    try {
      // 1. Obtener todas las boletas de este líder
      const { data: boletas, error } = await supabase
        .from('social_boletas')
        .select('evento_id, estado, social_eventos(nombre, fecha)')
        .eq('lider_id', lider.id);

      if (error) throw error;

      // 2. Agrupar por evento
      const statsMap = new Map();

      boletas?.forEach((b: any) => {
        const eventId = b.evento_id;
        if (!statsMap.has(eventId)) {
          statsMap.set(eventId, {
            eventId,
            eventName: b.social_eventos?.nombre || 'Evento Desconocido',
            eventDate: b.social_eventos?.fecha,
            total: 0,
            used: 0
          });
        }
        
        const stat = statsMap.get(eventId);
        stat.total++;
        if (b.estado === 'usada') {
          stat.used++;
        }
      });

      const statsArray = Array.from(statsMap.values()).map((s: any) => ({
        ...s,
        percentage: s.total > 0 ? Math.round((s.used / s.total) * 100) : 0
      }));

      setStatsLeader(lider);
      setLeaderStats(statsArray);
      setShowStatsModal(true);
    } catch (error: any) {
      console.error(error);
      alert('Error cargando estadísticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStats = async () => {
    setLoading(true);
    try {
      // 1. Obtener eventos
      const { data: events } = await supabase.from('social_eventos').select('*').order('fecha', { ascending: false });
      if (!events) return;

      // 2. Obtener todas las boletas (para calcular métricas)
      const { data: tickets } = await supabase
        .from('social_boletas')
        .select('evento_id, estado, lider_id, social_lideres(nombre)');

      if (!tickets) return;

      // 3. Procesar datos
      const stats = events.map(ev => {
        const evTickets = tickets.filter((t: any) => t.evento_id === ev.id);
        const total = evTickets.length;
        const used = evTickets.filter((t: any) => t.estado === 'usada').length;
        
        // Calcular líderes top
        const leaderCounts = new Map();
        evTickets.forEach((t: any) => {
          const lid = t.lider_id;
          const lName = t.social_lideres?.nombre || 'Desconocido';
          if (!leaderCounts.has(lid)) {
            leaderCounts.set(lid, { name: lName, total: 0, used: 0 });
          }
          const lStat = leaderCounts.get(lid);
          lStat.total++;
          if (t.estado === 'usada') lStat.used++;
        });

        const topLeaders = Array.from(leaderCounts.values())
          .sort((a: any, b: any) => b.used - a.used)
          .slice(0, 3); // Top 3 líderes por asistencia real

        return {
          ...ev,
          total,
          used,
          percentage: total > 0 ? Math.round((used / total) * 100) : 0,
          topLeaders
        };
      });

      setGlobalStats(stats);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

      if (editingEventId) {
        // ACTUALIZAR
        const updateData: any = { ...newEvent };
        if (fondoUrl) updateData.fondo_url = fondoUrl;

        const { error } = await supabase
          .from('social_eventos')
          .update(updateData)
          .eq('id', editingEventId);
        
        if (error) throw error;
        alert('Evento actualizado exitosamente');
        setEditingEventId(null);
      } else {
        // CREAR
        const { error } = await supabase.from('social_eventos').insert([{
          ...newEvent,
          fondo_url: fondoUrl
        }]);

        if (error) throw error;
        alert('Evento creado exitosamente');
      }

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

  const handleEditEvent = (ev: any) => {
    setEditingEventId(ev.id);
    setNewEvent({
      nombre: ev.nombre,
      lugar: ev.lugar || '',
      fecha: ev.fecha || '',
      hora: ev.hora || ''
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento? Se borrarán todas las boletas asociadas.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('social_eventos').delete().eq('id', id);
      if (error) throw error;
      fetchEventos();
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setNewEvent({ nombre: '', lugar: '', fecha: '', hora: '' });
    setFondoFile(null);
  };

  // --- 2. GESTIÓN DE LÍDERES (CARNETIZACIÓN) ---
  const parseColombianID = (raw: string) => {
    try {
      // Patrón básico para encontrar la cédula y los nombres en el formato PDF417
      // Buscamos la secuencia de dígitos larga (CC) seguida de texto
      // Ejemplo: ...1144086542MARTINEZ...
      
      // Limpiamos caracteres nulos y extraños para facilitar regex
      const clean = raw.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
      
      // Regex aproximada: 
      // (PubDSK_1)? -> Header opcional
      // .*? -> Basura
      // (\d{7,10}) -> Cédula (7 a 10 dígitos)
      // ([A-ZÑ]+) -> Apellido 1
      // ([A-ZÑ]+) -> Apellido 2
      // ([A-ZÑ]+) -> Nombre 1
      // ([A-ZÑ]+)? -> Nombre 2 (opcional)
      
      // Nota: En el raw original, los campos están pegados o separados por nulos.
      // Al limpiar con espacios, quedan separados.
      
      const match = clean.match(/(\d{7,10})\s+([A-ZÑ]+)\s+([A-ZÑ]+)\s+([A-ZÑ]+)(\s+[A-ZÑ]+)?/);
      
      if (match) {
        const documento = match[1];
        const apellido1 = match[2];
        const apellido2 = match[3];
        const nombre1 = match[4];
        const nombre2 = match[5] || '';
        
        const nombreCompleto = `${nombre1} ${nombre2} ${apellido1} ${apellido2}`.replace(/\s+/g, ' ').trim();
        
        return { documento, nombre: nombreCompleto };
      }
      return null;
    } catch (e) {
      console.error("Error parsing ID", e);
      return null;
    }
  };

  const handleScanForRegistration = async () => {
    setScanning(true);
    setScanResult(null);
    
    try {
      const hints = new Map();
      // Añadimos PDF_417 para cédulas
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.PDF_417]);
      
      const codeReader = new BrowserMultiFormatReader(hints);
      
      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, error, controls) => {
          if (result) {
            controls.stop();
            setScanning(false);
            controlsRef.current = null;
            
            const text = result.getText();
            // Intentar parsear cédula
            if (text.includes('PubDSK_1') || text.length > 50) {
              const data = parseColombianID(text);
              if (data) {
                setNewLider(prev => ({
                  ...prev,
                  nombre: data.nombre,
                  documento: data.documento
                }));
                alert(`Cédula Leída:\n${data.nombre}\nCC: ${data.documento}`);
              } else {
                alert('Se detectó un código PDF417 pero no se pudo extraer la información automáticamente. Intenta acercar más la cámara.');
              }
            } else {
               alert('Código escaneado no parece una cédula (PDF417).');
            }
          }
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      console.error(e);
      setScanning(false);
    }
  };

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

      if (editingLiderId) {
        // ACTUALIZAR
        const updateData: any = { ...newLider };
        if (fotoUrl) updateData.foto_url = fotoUrl;

        const { error } = await supabase
          .from('social_lideres')
          .update(updateData)
          .eq('id', editingLiderId);
        
        if (error) throw error;
        alert('Líder actualizado exitosamente');
        setEditingLiderId(null);
      } else {
        // CREAR
        const { error } = await supabase.from('social_lideres').insert([{
          ...newLider,
          foto_url: fotoUrl
        }]);

        if (error) throw error;
        alert('Líder registrado exitosamente');
      }

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

  const handleEditLider = (lid: any) => {
    setEditingLiderId(lid.id);
    setNewLider({
      nombre: lid.nombre,
      documento: lid.documento,
      telefono: lid.telefono || ''
    });
  };

  const handleDeleteLider = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este líder? Se borrarán sus boletas.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('social_lideres').delete().eq('id', id);
      if (error) throw error;
      fetchLideres();
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEditLider = () => {
    setEditingLiderId(null);
    setNewLider({ nombre: '', documento: '', telefono: '' });
    setFotoFile(null);
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
    const zip = new JSZip();
    const folderName = `Boletas_${evento.nombre.replace(/\s+/g, '_')}`;
    const folder = zip.folder(folderName);

    for (let i = 0; i < boletas.length; i++) {
      const boleta = boletas[i];
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [150, 60] // Formato boleta alargada
      });

      // Fondo
      if (evento.fondo_url) {
        try {
          doc.addImage(evento.fondo_url, 'JPEG', 0, 0, 150, 60);
        } catch (e) {
          // Fallback si falla imagen
          doc.setFillColor(240, 240, 240);
          doc.rect(0, 0, 150, 60, 'F');
        }
      } else {
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 0, 150, 60, 'F');
      }

      // Contenido (Texto sobrepuesto)
      // Usamos un fondo blanco semitransparente para el texto si hay imagen
      doc.setFillColor(255, 255, 255);
      doc.rect(5, 5, 90, 50, 'F'); // Área de texto

      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(evento.nombre, 10, 15);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Nueva disposición vertical (un dato por renglón)
      doc.text(`Fecha: ${evento.fecha}`, 10, 25);
      doc.text(`Hora: ${evento.hora}`, 10, 32);
      doc.text(`Lugar: ${evento.lugar}`, 10, 39);

      // QR (Lado derecho)
      try {
        const qrDataUrl = await QRCode.toDataURL(boleta.codigo_qr);
        doc.addImage(qrDataUrl, 'PNG', 105, 5, 40, 40);
      } catch (e) {}
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(boleta.codigo_qr.substring(0, 8), 110, 50);

      // Agregar PDF al ZIP
      const pdfBlob = doc.output('blob');
      folder?.file(`Boleta_${i + 1}.pdf`, pdfBlob);
    }

    // Generar y descargar ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${folderName}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // --- 4. ESCÁNER UNIFICADO ---
  const startScanning = async () => {
    setScanning(true);
    setScanResult(null);
    
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.PDF_417]);
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
    // Detectar si es Cédula (PDF417)
    if (code.includes('PubDSK_1') || (code.length > 50 && !code.startsWith('LIDER:'))) {
       // Es una cédula escaneada en modo control de acceso
       // Intentamos buscar si esa cédula ya está registrada como líder
       const data = parseColombianID(code);
       if (data) {
         const { data: lider } = await supabase
          .from('social_lideres')
          .select('*')
          .eq('documento', data.documento)
          .single();
         
         if (lider) {
            setScanResult({
              success: true,
              message: `LÍDER REGISTRADO\n${lider.nombre}\nCC: ${lider.documento}`,
              type: 'lider'
            });
            if (navigator.vibrate) navigator.vibrate(200);
            return;
         } else {
            setScanResult({
              success: false,
              message: `CÉDULA NO REGISTRADA\n${data.nombre}\nCC: ${data.documento}\n\nDebe registrarse primero.`
            });
            return;
         }
       }
    }

    // Detectar si es Líder (QR Carnet)
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

  const fetchRanking = async () => {
    setLoading(true);
    try {
      // 1. Obtener líderes
      const { data: leaders } = await supabase.from('social_lideres').select('*');
      if (!leaders) return;

      // 2. Obtener boletas
      const { data: tickets } = await supabase.from('social_boletas').select('lider_id, estado, evento_id, social_eventos(nombre)');
      if (!tickets) return;

      // 3. Calcular métricas por líder
      const ranking = leaders.map(l => {
        const myTickets = tickets.filter((t: any) => t.lider_id === l.id);
        const total = myTickets.length;
        const used = myTickets.filter((t: any) => t.estado === 'usada').length;
        
        // Eventos únicos
        const events = new Set(myTickets.map((t: any) => t.social_eventos?.nombre)).size;

        return {
          ...l,
          total,
          used,
          eventsCount: events,
          percentage: total > 0 ? Math.round((used / total) * 100) : 0
        };
      });

      // Ordenar por asistencia real (used) descendente
      ranking.sort((a, b) => b.used - a.used);

      setRankingData(ranking);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
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
          { id: 'lideres', icon: Users, label: '2. Líderes' },
          { id: 'boletas', icon: Ticket, label: '3. Boletas' },
          { id: 'escanear', icon: QrCode, label: '4. Control Acceso' },
          { id: 'historial', icon: TrendingUp, label: '5. Historial' },
          { id: 'ranking', icon: Trophy, label: '6. Ranking' },
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
            <h2 className="font-bold text-lg mb-4">{editingEventId ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
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

              <div className="flex gap-2">
                {editingEventId && (
                  <button 
                    onClick={cancelEditEvent}
                    className="w-1/3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  onClick={handleCreateEvent}
                  disabled={loading}
                  className="btn-primary flex-1 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (editingEventId ? <Save size={20} /> : <PlusIcon />)} 
                  {editingEventId ? 'Actualizar' : 'Crear Evento'}
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Eventos Activos</h2>
            <div className="space-y-3">
              {eventos.map(ev => (
                <div key={ev.id} className="p-3 border rounded-lg hover:bg-slate-50 flex justify-between items-start group">
                  <div>
                    <h3 className="font-bold">{ev.nombre}</h3>
                    <p className="text-sm text-slate-500 flex gap-2">
                      <Calendar size={14} /> {ev.fecha} <Clock size={14} /> {ev.hora}
                    </p>
                    <p className="text-sm text-slate-500 flex gap-2">
                      <MapPin size={14} /> {ev.lugar}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditEvent(ev)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
            <h2 className="font-bold text-lg mb-4">{editingLiderId ? 'Editar Líder' : 'Registrar Líder'}</h2>
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

              {/* Botón Escanear Cédula */}
              {!editingLiderId && (
                <button
                  onClick={() => {
                    setActiveTab('escanear'); // Usamos el UI del tab escanear pero con lógica diferente? 
                    // Mejor mostramos el modal de escaneo aquí mismo o redirigimos
                    // Para simplificar, añadiremos un modo de escaneo en este formulario
                    handleScanForRegistration();
                  }}
                  className="w-full py-2 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700"
                >
                  <QrCode size={18} /> Escanear Cédula (Autocompletar)
                </button>
              )}

              {/* Area de video para registro */}
              {scanning && !activeTab.includes('escanear') && (
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => {
                      if (controlsRef.current) controlsRef.current.stop();
                      setScanning(false);
                    }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {editingLiderId && (
                  <button 
                    onClick={cancelEditLider}
                    className="w-1/3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  onClick={handleCreateLider}
                  disabled={loading}
                  className="btn-primary flex-1 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (editingLiderId ? <Save size={20} /> : <UserPlus />)} 
                  {editingLiderId ? 'Actualizar' : 'Registrar Líder'}
                </button>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Directorio de Líderes</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {lideres.map(lid => (
                <div key={lid.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-slate-50 group">
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
                  <div className="flex gap-1">
                    <button 
                      onClick={() => generateCarnet(lid)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                      title="Descargar Carnet"
                    >
                      <FileBadge size={20} />
                    </button>
                    <button 
                      onClick={() => handleEditLider(lid)}
                      className="text-slate-500 hover:bg-slate-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteLider(lid.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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

      {/* --- TAB: HISTORIAL GLOBAL --- */}
      {activeTab === 'historial' && (
        <div className="space-y-6">
          <h2 className="font-bold text-xl text-slate-800 mb-4">Historial y Métricas de Eventos</h2>
          
          {loading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /> Cargando métricas...</div>}
          
          {!loading && globalStats.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Calendar className="mx-auto text-slate-300 mb-2" size={48} />
              <p className="text-slate-500">No hay eventos registrados aún.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {globalStats.map((stat) => (
              <div key={stat.id} className="card p-6 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Info Evento */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-slate-800">{stat.nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        stat.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        stat.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {stat.percentage}% Éxito
                      </span>
                    </div>
                    <p className="text-slate-500 flex gap-4 text-sm mb-4">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {stat.fecha}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> {stat.lugar}</span>
                    </p>

                    {/* Métricas Principales */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-slate-700">{stat.total}</span>
                        <span className="text-xs text-slate-500 uppercase font-bold">Boletas</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-blue-600">{stat.used}</span>
                        <span className="text-xs text-blue-600 uppercase font-bold">Asistentes</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-slate-400">{stat.total - stat.used}</span>
                        <span className="text-xs text-slate-400 uppercase font-bold">Ausentes</span>
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          stat.percentage >= 80 ? 'bg-emerald-500' :
                          stat.percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right text-slate-400">Poder de Convocatoria</p>
                  </div>

                  {/* Top Líderes */}
                  <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <Users size={16} /> Top Líderes (Asistencia)
                    </h4>
                    {stat.topLeaders.length > 0 ? (
                      <div className="space-y-3">
                        {stat.topLeaders.map((l: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                idx === 1 ? 'bg-slate-100 text-slate-700' : 
                                'bg-orange-50 text-orange-700'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="truncate max-w-[120px]" title={l.name}>{l.name}</span>
                            </div>
                            <span className="font-bold text-blue-600">{l.used} <span className="text-xs font-normal text-slate-400">/ {l.total}</span></span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sin datos de asistencia aún.</p>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: RANKING LÍDERES --- */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <h2 className="font-bold text-xl text-slate-800 mb-4">Ranking y Desempeño de Líderes</h2>
          
          {loading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /> Calculando ranking...</div>}

          {/* Top 3 Podium */}
          {!loading && rankingData.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-300 overflow-hidden mb-2">
                  {rankingData[1].foto_url ? <img src={rankingData[1].foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                </div>
                <div className="bg-slate-100 w-24 h-32 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-slate-400">
                  <span className="text-2xl font-bold text-slate-400">2</span>
                  <span className="text-xs font-bold text-slate-600 text-center px-1 truncate w-full">{rankingData[1].nombre}</span>
                  <span className="text-sm font-bold text-blue-600">{rankingData[1].used}</span>
                </div>
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative">
                  <Trophy size={24} className="absolute top-0 right-0 text-yellow-500 bg-white rounded-full p-1" />
                  {rankingData[0].foto_url ? <img src={rankingData[0].foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-yellow-100" />}
                </div>
                <div className="bg-yellow-50 w-28 h-40 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-yellow-400 shadow-lg">
                  <span className="text-3xl font-bold text-yellow-600">1</span>
                  <span className="text-xs font-bold text-slate-800 text-center px-1 truncate w-full">{rankingData[0].nombre}</span>
                  <span className="text-lg font-bold text-blue-700">{rankingData[0].used}</span>
                  <span className="text-[10px] text-slate-500">Asistentes</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-orange-300 overflow-hidden mb-2">
                  {rankingData[2].foto_url ? <img src={rankingData[2].foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-100" />}
                </div>
                <div className="bg-orange-50 w-24 h-24 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-orange-400">
                  <span className="text-2xl font-bold text-orange-500">3</span>
                  <span className="text-xs font-bold text-slate-600 text-center px-1 truncate w-full">{rankingData[2].nombre}</span>
                  <span className="text-sm font-bold text-blue-600">{rankingData[2].used}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tabla Completa */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Líder</th>
                  <th className="p-4 text-center">Eventos</th>
                  <th className="p-4 text-center">Boletas</th>
                  <th className="p-4 text-center">Asistentes</th>
                  <th className="p-4 text-center">Efectividad</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankingData.map((leader, idx) => (
                  <tr key={leader.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {leader.foto_url ? (
                          <img src={leader.foto_url} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400"><Users size={14} /></div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{leader.nombre}</div>
                          <div className="text-xs text-slate-500">{leader.documento}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium">{leader.eventsCount}</td>
                    <td className="p-4 text-center text-slate-500">{leader.total}</td>
                    <td className="p-4 text-center font-bold text-blue-600 text-lg">{leader.used}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              leader.percentage >= 80 ? 'bg-emerald-500' :
                              leader.percentage >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} 
                            style={{ width: `${leader.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold">{leader.percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => fetchLeaderStats(leader)}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL ESTADÍSTICAS --- */}
      {showStatsModal && statsLeader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                {statsLeader.foto_url ? (
                  <img src={statsLeader.foto_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <Users size={24} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">{statsLeader.nombre}</h3>
                  <p className="text-sm text-slate-500">CC: {statsLeader.documento}</p>
                </div>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Rendimiento por Evento
              </h4>
              
              {leaderStats.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Este líder no tiene boletas asignadas aún.</p>
              ) : (
                <div className="space-y-4">
                  {leaderStats.map((stat: any) => (
                    <div key={stat.eventId} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-slate-800">{stat.eventName}</h5>
                          <p className="text-xs text-slate-500">{stat.eventDate}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          stat.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          stat.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {stat.percentage}% Efectividad
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-sm mb-3">
                        <div className="bg-slate-100 p-2 rounded">
                          <span className="block font-bold text-slate-700">{stat.total}</span>
                          <span className="text-xs text-slate-500">Boletas</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="block font-bold text-blue-700">{stat.used}</span>
                          <span className="text-xs text-blue-600">Asistentes</span>
                        </div>
                        <div className="bg-slate-100 p-2 rounded">
                          <span className="block font-bold text-slate-700">{stat.total - stat.used}</span>
                          <span className="text-xs text-slate-500">Ausentes</span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            stat.percentage >= 80 ? 'bg-emerald-500' :
                            stat.percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} 
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-slate-50 text-right">
              <button 
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() { return <Plus size={20} />; }
import { Plus } from 'lucide-react';
