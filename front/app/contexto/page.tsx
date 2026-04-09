'use client';

import { useState, useEffect, useMemo } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import type { AreaContexto, DofaElemento, EstrategiaContexto, PilarEstrategico, TipoProyecto } from '@/lib/types';
import {
  ArrowLeft, Plus, Save, X, Loader2, Edit, Trash2, Filter,
  Shield, TrendingUp, AlertTriangle, Target, Eye, Layers,
  Settings, BarChart3, Zap, Users, Lightbulb, CheckCircle2
} from 'lucide-react';

// ─── Labels & Colors ────────────────────────────────────────
const DOFA_CONFIG = {
  fortaleza:   { label: 'Fortaleza',   color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: Shield },
  oportunidad: { label: 'Oportunidad', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: TrendingUp },
  debilidad:   { label: 'Debilidad',   color: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertTriangle },
  amenaza:     { label: 'Amenaza',     color: 'bg-red-100 text-red-700 border-red-300', icon: Zap },
};

const PILAR_LABELS: Record<PilarEstrategico, string> = {
  eficiencia_integral: 'Eficiencia Integral',
  experiencia_cliente: 'Experiencia del Cliente',
  cultura_innovadora: 'Cultura Innovadora',
  gestion_talento_humano: 'Gestión Integral del Talento Humano',
};

const TIPO_PROY_LABELS: Record<TipoProyecto, string> = {
  mejoramiento: 'Mejoramiento',
  extension: 'Extensión',
  transformacion: 'Transformación',
};

const ESTRATEGIA_LABELS: Record<string, string> = {
  FO: 'FO (Fortaleza–Oportunidad)',
  FA: 'FA (Fortaleza–Amenaza)',
  DO: 'DO (Debilidad–Oportunidad)',
  DA: 'DA (Debilidad–Amenaza)',
};

// ─── Bubble colors by dificultad × recursos ─────────────────
function getBubbleColor(dificultad: string, recursos: string) {
  if (dificultad === 'alta' && recursos === 'alto') return '#ef4444';   // rojo grande
  if (dificultad === 'alta' && recursos === 'bajo') return '#ef4444';   // rojo chico
  if (dificultad === 'media' && recursos === 'alto') return '#eab308';  // amarillo grande
  if (dificultad === 'media' && recursos === 'bajo') return '#eab308';  // amarillo chico
  if (dificultad === 'baja' && recursos === 'alto') return '#22c55e';   // verde grande
  return '#22c55e'; // baja+bajo = verde chico
}

function getBubbleSize(recursos: string) {
  return recursos === 'alto' ? 48 : 28;
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function ContextoPage() {
  const [tab, setTab] = useState<'dofa' | 'estrategias' | 'canvas' | 'areas'>('dofa');
  const [areas, setAreas] = useState<AreaContexto[]>([]);
  const [elementos, setElementos] = useState<DofaElemento[]>([]);
  const [estrategias, setEstrategias] = useState<EstrategiaContexto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarTodo(); }, []);

  async function cargarTodo() {
    try {
      const [a, e, s] = await Promise.all([
        pb.collection('areas_contexto').getFullList({ sort: 'orden' }),
        pb.collection('dofa_elementos').getFullList({ sort: '-created', expand: 'area_id' }),
        pb.collection('estrategias_contexto').getFullList({ sort: '-created', expand: 'elementos_dofa' }),
      ]);
      setAreas(a as unknown as AreaContexto[]);
      setElementos(e as unknown as DofaElemento[]);
      setEstrategias(s as unknown as EstrategiaContexto[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">4.1 Contexto de la Organización</h1>
          </div>
          <p className="text-slate-500 ml-7">Análisis DOFA, estrategias y canvas de portafolio</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {([
          { key: 'dofa', label: 'Elementos DOFA', icon: Layers },
          { key: 'estrategias', label: 'Estrategias', icon: Target },
          { key: 'canvas', label: 'Canvas Portafolio', icon: BarChart3 },
          { key: 'areas', label: 'Áreas', icon: Settings },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dofa' && <TabDOFA elementos={elementos} areas={areas} onReload={cargarTodo} />}
      {tab === 'estrategias' && <TabEstrategias estrategias={estrategias} elementos={elementos} areas={areas} onReload={cargarTodo} />}
      {tab === 'canvas' && <TabCanvas estrategias={estrategias} />}
      {tab === 'areas' && <TabAreas areas={areas} onReload={cargarTodo} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TAB: ELEMENTOS DOFA (brainstorm)
// ═════════════════════════════════════════════════════════════
function TabDOFA({ elementos, areas, onReload }: { elementos: DofaElemento[]; areas: AreaContexto[]; onReload: () => Promise<void> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterArea, setFilterArea] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tipo_dofa: 'fortaleza' as DofaElemento['tipo_dofa'],
    descripcion: '',
    area_id: '',
    identificado_por: '',
    fecha_identificacion: new Date().toISOString().split('T')[0],
    contexto: 'interno' as 'interno' | 'externo',
    observaciones: '',
  });

  const filtered = elementos.filter(e => {
    if (filterTipo && e.tipo_dofa !== filterTipo) return false;
    if (filterArea && e.area_id !== filterArea) return false;
    return true;
  });

  // Group by tipo
  const grouped = useMemo(() => {
    const g: Record<string, DofaElemento[]> = { fortaleza: [], oportunidad: [], debilidad: [], amenaza: [] };
    filtered.forEach(e => g[e.tipo_dofa]?.push(e));
    return g;
  }, [filtered]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, area_id: form.area_id || null, fecha_identificacion: form.fecha_identificacion || null };
      if (editingId) {
        await pb.collection('dofa_elementos').update(editingId, data);
      } else {
        await pb.collection('dofa_elementos').create(data);
      }
      await onReload();
      resetForm();
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setSaving(false); }
  }

  function handleEdit(el: DofaElemento) {
    setEditingId(el.id);
    setForm({
      tipo_dofa: el.tipo_dofa,
      descripcion: el.descripcion,
      area_id: el.area_id || '',
      identificado_por: el.identificado_por || '',
      fecha_identificacion: el.fecha_identificacion?.split('T')[0] || '',
      contexto: el.contexto || 'interno',
      observaciones: el.observaciones || '',
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este elemento DOFA?')) return;
    try { await pb.collection('dofa_elementos').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  async function toggleConsolidado(el: DofaElemento) {
    try { await pb.collection('dofa_elementos').update(el.id, { consolidado: !el.consolidado }); await onReload(); } catch (err) { console.error(err); }
  }

  function resetForm() {
    setForm({ tipo_dofa: 'fortaleza', descripcion: '', area_id: '', identificado_por: '', fecha_identificacion: new Date().toISOString().split('T')[0], contexto: 'interno', observaciones: '' });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(Object.entries(DOFA_CONFIG) as [DofaElemento['tipo_dofa'], typeof DOFA_CONFIG.fortaleza][]).map(([key, cfg]) => {
          const count = elementos.filter(e => e.tipo_dofa === key).length;
          const Icon = cfg.icon;
          return (
            <div key={key} className={`card p-4 border-l-4 ${key === 'fortaleza' ? 'border-emerald-500' : key === 'oportunidad' ? 'border-blue-500' : key === 'debilidad' ? 'border-amber-500' : 'border-red-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{cfg.label}s</p>
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                </div>
                <Icon size={24} className={key === 'fortaleza' ? 'text-emerald-600' : key === 'oportunidad' ? 'text-blue-600' : key === 'debilidad' ? 'text-amber-600' : 'text-red-600'} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Elemento
        </button>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="input-field !w-auto">
          <option value="">Todos los tipos</option>
          {Object.entries(DOFA_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="input-field !w-auto">
          <option value="">Todas las áreas</option>
          {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Editar' : 'Nuevo'} Elemento DOFA</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo DOFA *</label>
              <select value={form.tipo_dofa} onChange={e => setForm({ ...form, tipo_dofa: e.target.value as DofaElemento['tipo_dofa'] })} className="input-field" required>
                {Object.entries(DOFA_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Área</label>
              <select value={form.area_id} onChange={e => setForm({ ...form, area_id: e.target.value })} className="input-field">
                <option value="">Sin área</option>
                {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción *</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={3} required placeholder="Describe el elemento DOFA..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contexto</label>
              <select value={form.contexto} onChange={e => setForm({ ...form, contexto: e.target.value as 'interno' | 'externo' })} className="input-field">
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Identificado por</label>
              <input type="text" value={form.identificado_por} onChange={e => setForm({ ...form, identificado_por: e.target.value })} className="input-field" placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
              <input type="date" value={form.fecha_identificacion} onChange={e => setForm({ ...form, fecha_identificacion: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
              <input type="text" value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-2"><X size={16} /> Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOFA Grid (4 cuadrantes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(DOFA_CONFIG) as [DofaElemento['tipo_dofa'], typeof DOFA_CONFIG.fortaleza][]).map(([tipo, cfg]) => {
          const items = grouped[tipo] || [];
          const Icon = cfg.icon;
          return (
            <div key={tipo} className="card overflow-hidden">
              <div className={`px-4 py-3 ${cfg.color} border-b flex items-center gap-2`}>
                <Icon size={18} />
                <span className="font-bold">{cfg.label}s ({items.length})</span>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Sin elementos registrados</p>
                ) : items.map(el => {
                  const areaName = el.expand?.area_id?.nombre || '';
                  const areaColor = el.expand?.area_id?.color || '#94a3b8';
                  return (
                    <div key={el.id} className={`p-3 mb-2 rounded-lg border ${el.consolidado ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'} group relative`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 leading-relaxed">{el.descripcion}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {areaName && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: areaColor }}>{areaName}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${el.contexto === 'externo' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                              {el.contexto === 'externo' ? 'Externo' : 'Interno'}
                            </span>
                            {el.consolidado && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Consolidado</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleConsolidado(el)} title={el.consolidado ? 'Desmarcar' : 'Marcar consolidado'} className="p-1 rounded hover:bg-slate-100">
                            <CheckCircle2 size={14} className={el.consolidado ? 'text-green-600' : 'text-slate-400'} />
                          </button>
                          <button onClick={() => handleEdit(el)} className="p-1 rounded hover:bg-blue-50"><Edit size={14} className="text-blue-600" /></button>
                          <button onClick={() => handleDelete(el.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-600" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// TAB: ESTRATEGIAS
// ═════════════════════════════════════════════════════════════
function TabEstrategias({ estrategias, elementos, areas, onReload }: {
  estrategias: EstrategiaContexto[]; elementos: DofaElemento[]; areas: AreaContexto[]; onReload: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo_estrategia: 'FO' as EstrategiaContexto['tipo_estrategia'],
    elementos_dofa: [] as string[],
    pilar_estrategico: 'eficiencia_integral' as PilarEstrategico,
    tipo_proyecto: 'mejoramiento' as TipoProyecto,
    nivel_recursos: 'bajo' as 'alto' | 'bajo',
    dificultad_implementacion: 'baja' as 'alta' | 'media' | 'baja',
    responsable: '',
    fecha_inicio: '',
    fecha_meta: '',
    estado: 'propuesta' as EstrategiaContexto['estado'],
    porcentaje_avance: 0,
    observaciones: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        fecha_inicio: form.fecha_inicio || null,
        fecha_meta: form.fecha_meta || null,
        elementos_dofa: form.elementos_dofa.length ? form.elementos_dofa : [],
      };
      if (editingId) {
        await pb.collection('estrategias_contexto').update(editingId, data);
      } else {
        await pb.collection('estrategias_contexto').create(data);
      }
      await onReload();
      resetForm();
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setSaving(false); }
  }

  function handleEdit(s: EstrategiaContexto) {
    setEditingId(s.id);
    setForm({
      titulo: s.titulo,
      descripcion: s.descripcion,
      tipo_estrategia: s.tipo_estrategia,
      elementos_dofa: s.elementos_dofa || [],
      pilar_estrategico: s.pilar_estrategico,
      tipo_proyecto: s.tipo_proyecto,
      nivel_recursos: s.nivel_recursos,
      dificultad_implementacion: s.dificultad_implementacion,
      responsable: s.responsable || '',
      fecha_inicio: s.fecha_inicio?.split('T')[0] || '',
      fecha_meta: s.fecha_meta?.split('T')[0] || '',
      estado: s.estado,
      porcentaje_avance: s.porcentaje_avance || 0,
      observaciones: s.observaciones || '',
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta estrategia?')) return;
    try { await pb.collection('estrategias_contexto').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  function resetForm() {
    setForm({ titulo: '', descripcion: '', tipo_estrategia: 'FO', elementos_dofa: [], pilar_estrategico: 'eficiencia_integral', tipo_proyecto: 'mejoramiento', nivel_recursos: 'bajo', dificultad_implementacion: 'baja', responsable: '', fecha_inicio: '', fecha_meta: '', estado: 'propuesta', porcentaje_avance: 0, observaciones: '' });
    setEditingId(null);
    setShowForm(false);
  }

  function toggleElemento(id: string) {
    setForm(f => ({
      ...f,
      elementos_dofa: f.elementos_dofa.includes(id) ? f.elementos_dofa.filter(x => x !== id) : [...f.elementos_dofa, id],
    }));
  }

  // Consolidado elements for linking
  const consolidados = elementos.filter(e => e.consolidado);

  return (
    <>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Estrategia
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Lightbulb size={16} /> {estrategias.length} estrategias registradas
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Editar' : 'Nueva'} Estrategia</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título *</label>
                <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="input-field" required placeholder="Nombre de la estrategia..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción *</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Estrategia DOFA *</label>
                <select value={form.tipo_estrategia} onChange={e => setForm({ ...form, tipo_estrategia: e.target.value as EstrategiaContexto['tipo_estrategia'] })} className="input-field" required>
                  {Object.entries(ESTRATEGIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pilar Estratégico *</label>
                <select value={form.pilar_estrategico} onChange={e => setForm({ ...form, pilar_estrategico: e.target.value as PilarEstrategico })} className="input-field" required>
                  {Object.entries(PILAR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Proyecto *</label>
                <select value={form.tipo_proyecto} onChange={e => setForm({ ...form, tipo_proyecto: e.target.value as TipoProyecto })} className="input-field" required>
                  {Object.entries(TIPO_PROY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nivel de Recursos *</label>
                <select value={form.nivel_recursos} onChange={e => setForm({ ...form, nivel_recursos: e.target.value as 'alto' | 'bajo' })} className="input-field" required>
                  <option value="alto">Alto</option>
                  <option value="bajo">Bajo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dificultad Implementación *</label>
                <select value={form.dificultad_implementacion} onChange={e => setForm({ ...form, dificultad_implementacion: e.target.value as 'alta' | 'media' | 'baja' })} className="input-field" required>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Estado *</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as EstrategiaContexto['estado'] })} className="input-field" required>
                  <option value="propuesta">Propuesta</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="en_ejecucion">En Ejecución</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Responsable</label>
                <input type="text" value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha meta</label>
                <input type="date" value={form.fecha_meta} onChange={e => setForm({ ...form, fecha_meta: e.target.value })} className="input-field" />
              </div>
            </div>

            {/* Elementos DOFA vinculados */}
            {consolidados.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Elementos DOFA (consolidados) vinculados</label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {consolidados.map(el => (
                    <label key={el.id} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${form.elementos_dofa.includes(el.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'}`}>
                      <input type="checkbox" checked={form.elementos_dofa.includes(el.id)} onChange={() => toggleElemento(el.id)} className="mt-1" />
                      <div className="text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-bold mr-1 ${DOFA_CONFIG[el.tipo_dofa].color}`}>
                          {el.tipo_dofa.charAt(0).toUpperCase()}
                        </span>
                        {el.descripcion.substring(0, 80)}{el.descripcion.length > 80 ? '…' : ''}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-2"><X size={16} /> Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strategies list */}
      <div className="space-y-3">
        {estrategias.length === 0 && <p className="text-center text-slate-400 py-12">No hay estrategias registradas. Crea la primera.</p>}
        {estrategias.map(s => (
          <div key={s.id} className="card p-5 group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-bold text-slate-800">{s.titulo}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">{s.tipo_estrategia}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{s.descripcion}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{PILAR_LABELS[s.pilar_estrategico]}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">{TIPO_PROY_LABELS[s.tipo_proyecto]}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                    backgroundColor: getBubbleColor(s.dificultad_implementacion, s.nivel_recursos) + '20',
                    color: getBubbleColor(s.dificultad_implementacion, s.nivel_recursos),
                  }}>
                    Recursos: {s.nivel_recursos} · Dificultad: {s.dificultad_implementacion}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    s.estado === 'completada' ? 'bg-green-100 text-green-700' :
                    s.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-700' :
                    s.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{s.estado.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => handleEdit(s)} className="p-2 rounded-lg hover:bg-blue-50"><Edit size={16} className="text-blue-600" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-600" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// TAB: CANVAS PORTAFOLIO (bubble chart)
// ═════════════════════════════════════════════════════════════
function TabCanvas({ estrategias }: { estrategias: EstrategiaContexto[] }) {
  const pilares: PilarEstrategico[] = ['gestion_talento_humano', 'cultura_innovadora', 'experiencia_cliente', 'eficiencia_integral'];
  const tipos: TipoProyecto[] = ['mejoramiento', 'extension', 'transformacion'];

  const cellWidth = 220;
  const cellHeight = 130;
  const leftMargin = 180;
  const topMargin = 50;
  const svgWidth = leftMargin + tipos.length * cellWidth + 40;
  const svgHeight = topMargin + pilares.length * cellHeight + 50;

  // Group strategies by cell
  const cells: Record<string, EstrategiaContexto[]> = {};
  estrategias.forEach(s => {
    const key = `${s.pilar_estrategico}__${s.tipo_proyecto}`;
    if (!cells[key]) cells[key] = [];
    cells[key].push(s);
  });

  return (
    <div>
      {/* Legend */}
      <div className="card p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { color: '#ef4444', size: 20, label: 'Alta dificultad / Altos recursos' },
            { color: '#ef4444', size: 12, label: 'Alta dificultad / Bajos recursos' },
            { color: '#eab308', size: 20, label: 'Media dificultad / Altos recursos' },
            { color: '#eab308', size: 12, label: 'Media dificultad / Bajos recursos' },
            { color: '#22c55e', size: 20, label: 'Baja dificultad / Altos recursos' },
            { color: '#22c55e', size: 12, label: 'Baja dificultad / Bajos recursos' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg width={24} height={24}><circle cx={12} cy={12} r={l.size / 2} fill={l.color} opacity={0.85} /></svg>
              <span className="text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Chart */}
      <div className="card p-4 overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Canvas: Portafolio de Estrategias</h3>
        <svg width={svgWidth} height={svgHeight} className="mx-auto" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Grid lines */}
          {pilares.map((_, ri) => (
            <line key={`h${ri}`} x1={leftMargin} y1={topMargin + ri * cellHeight} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + ri * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          <line x1={leftMargin} y1={topMargin + pilares.length * cellHeight} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + pilares.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          {tipos.map((_, ci) => (
            <line key={`v${ci}`} x1={leftMargin + ci * cellWidth} y1={topMargin} x2={leftMargin + ci * cellWidth} y2={topMargin + pilares.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          <line x1={leftMargin + tipos.length * cellWidth} y1={topMargin} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + pilares.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />

          {/* Y-axis labels (pilares) */}
          {pilares.map((p, ri) => (
            <text key={p} x={leftMargin - 10} y={topMargin + ri * cellHeight + cellHeight / 2} textAnchor="end" dominantBaseline="middle" fontSize={11} fontWeight={600} fill="#334155">
              {PILAR_LABELS[p].split(' ').map((w, wi) => (
                <tspan key={wi} x={leftMargin - 10} dy={wi === 0 ? -(PILAR_LABELS[p].split(' ').length - 1) * 7 : 14}>{w}</tspan>
              ))}
            </text>
          ))}

          {/* X-axis labels (tipos) */}
          {tipos.map((t, ci) => (
            <text key={t} x={leftMargin + ci * cellWidth + cellWidth / 2} y={topMargin + pilares.length * cellHeight + 25} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155">
              {TIPO_PROY_LABELS[t]}
            </text>
          ))}

          {/* Axis titles */}
          <text x={10} y={topMargin + (pilares.length * cellHeight) / 2} textAnchor="middle" transform={`rotate(-90, 10, ${topMargin + (pilares.length * cellHeight) / 2})`} fontSize={12} fontWeight={700} fill="#1e40af">
            Prioridad estratégica
          </text>
          <text x={leftMargin + (tipos.length * cellWidth) / 2} y={svgHeight - 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1e40af">
            Proyectos
          </text>

          {/* Bubbles */}
          {pilares.map((p, ri) => tipos.map((t, ci) => {
            const key = `${p}__${t}`;
            const items = cells[key] || [];
            return items.map((s, si) => {
              const r = getBubbleSize(s.nivel_recursos) / 2;
              const cx = leftMargin + ci * cellWidth + cellWidth / 2 + (si - (items.length - 1) / 2) * (r * 2.5);
              const cy = topMargin + ri * cellHeight + cellHeight / 2;
              const fill = getBubbleColor(s.dificultad_implementacion, s.nivel_recursos);
              return (
                <g key={s.id}>
                  <circle cx={cx} cy={cy} r={r} fill={fill} opacity={0.8} stroke="#fff" strokeWidth={2} />
                  <title>{s.titulo} — {s.dificultad_implementacion} dif. / {s.nivel_recursos} rec.</title>
                </g>
              );
            });
          }))}
        </svg>
      </div>

      {/* Table below chart */}
      {estrategias.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left p-3 font-semibold text-slate-700">Estrategia</th>
                <th className="text-left p-3 font-semibold text-slate-700">Pilar</th>
                <th className="text-left p-3 font-semibold text-slate-700">Tipo</th>
                <th className="text-center p-3 font-semibold text-slate-700">Recursos</th>
                <th className="text-center p-3 font-semibold text-slate-700">Dificultad</th>
                <th className="text-center p-3 font-semibold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {estrategias.map(s => (
                <tr key={s.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{s.titulo}</td>
                  <td className="p-3 text-slate-600">{PILAR_LABELS[s.pilar_estrategico]}</td>
                  <td className="p-3 text-slate-600">{TIPO_PROY_LABELS[s.tipo_proyecto]}</td>
                  <td className="p-3 text-center">
                    <svg width={20} height={20} className="inline">
                      <circle cx={10} cy={10} r={s.nivel_recursos === 'alto' ? 9 : 5} fill={getBubbleColor(s.dificultad_implementacion, s.nivel_recursos)} opacity={0.85} />
                    </svg>
                  </td>
                  <td className="p-3 text-center text-xs font-medium">{s.dificultad_implementacion}</td>
                  <td className="p-3 text-center text-xs font-medium">{s.estado.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TAB: ÁREAS (editable)
// ═════════════════════════════════════════════════════════════
function TabAreas({ areas, onReload }: { areas: AreaContexto[]; onReload: () => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '#2563eb', orden: 0 });
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSaveNew(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await pb.collection('areas_contexto').create({ ...form, activa: true });
      await onReload();
      setForm({ nombre: '', descripcion: '', color: '#2563eb', orden: 0 });
      setShowNew(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await pb.collection('areas_contexto').update(id, form);
      await onReload();
      setEditingId(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function toggleActiva(a: AreaContexto) {
    try { await pb.collection('areas_contexto').update(a.id, { activa: !a.activa }); await onReload(); } catch (err) { console.error(err); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta área?')) return;
    try { await pb.collection('areas_contexto').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  function startEdit(a: AreaContexto) {
    setEditingId(a.id);
    setForm({ nombre: a.nombre, descripcion: a.descripcion || '', color: a.color || '#2563eb', orden: a.orden || 0 });
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva Área</button>
        <p className="text-sm text-slate-500 flex items-center gap-1"><Settings size={14} /> Edita los nombres y colores de las áreas para categorizar los elementos DOFA</p>
      </div>

      {showNew && (
        <form onSubmit={handleSaveNew} className="card p-4 mb-4 border-2 border-blue-200 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Color</label>
            <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Orden</label>
            <input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} className="input-field !w-20" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1"><Save size={14} /> Crear</button>
          <button type="button" onClick={() => setShowNew(false)} className="btn-secondary"><X size={14} /></button>
        </form>
      )}

      <div className="space-y-2">
        {areas.map(a => (
          <div key={a.id} className={`card p-4 flex items-center justify-between gap-4 ${!a.activa ? 'opacity-50' : ''}`}>
            {editingId === a.id ? (
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field !w-auto" />
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                <input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} className="input-field !w-16" />
                <button onClick={() => handleUpdate(a.id)} className="btn-primary text-xs"><Save size={14} /></button>
                <button onClick={() => setEditingId(null)} className="btn-secondary text-xs"><X size={14} /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: a.color || '#94a3b8' }} />
                  <span className="font-semibold text-slate-800">{a.nombre}</span>
                  {!a.activa && <span className="text-xs text-slate-400">(inactiva)</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActiva(a)} className={`p-1.5 rounded-lg text-xs ${a.activa ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                    {a.activa ? <Eye size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg hover:bg-blue-50"><Edit size={14} className="text-blue-600" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-600" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
