'use client';

import { useState, useEffect, useMemo } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import type { AreaContexto, DofaElemento, EstrategiaContexto, PilarEstrategicoRecord, Colaborador, NivelRecursos } from '@/lib/types';
import {
  ArrowLeft, Plus, Save, X, Loader2, Edit, Trash2, Filter,
  Shield, TrendingUp, AlertTriangle, Target, Eye, Layers,
  Settings, BarChart3, Zap, Users, Lightbulb, CheckCircle2,
  Building2, ExternalLink
} from 'lucide-react';

// ─── Labels & Colors ────────────────────────────────────────
const DOFA_CONFIG = {
  fortaleza:   { label: 'Fortaleza',   color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: Shield, contexto: 'interno' as const },
  oportunidad: { label: 'Oportunidad', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: TrendingUp, contexto: 'externo' as const },
  debilidad:   { label: 'Debilidad',   color: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertTriangle, contexto: 'interno' as const },
  amenaza:     { label: 'Amenaza',     color: 'bg-red-100 text-red-700 border-red-300', icon: Zap, contexto: 'externo' as const },
};

const TIPO_PROY_LABELS: Record<string, string> = {
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

// Map strategy type to the two DOFA types it combines
const ESTRATEGIA_DOFA_MAP: Record<string, [string, string]> = {
  FO: ['fortaleza', 'oportunidad'],
  FA: ['fortaleza', 'amenaza'],
  DO: ['debilidad', 'oportunidad'],
  DA: ['debilidad', 'amenaza'],
};

// ─── Bubble colors by dificultad × recursos ─────────────────
function getBubbleColor(dificultad: string, recursos: string) {
  if (dificultad === 'alta') return '#ef4444';
  if (dificultad === 'media') return '#eab308';
  return '#22c55e';
}

function getBubbleSize(recursos: string) {
  if (recursos === 'alto') return 48;
  if (recursos === 'medio') return 36;
  return 24;
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function ContextoPage() {
  const [tab, setTab] = useState<'dofa' | 'estrategias' | 'canvas'>('dofa');
  const [areas, setAreas] = useState<AreaContexto[]>([]);
  const [elementos, setElementos] = useState<DofaElemento[]>([]);
  const [estrategias, setEstrategias] = useState<EstrategiaContexto[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [pilares, setPilares] = useState<PilarEstrategicoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarTodo(); }, []);

  async function cargarTodo() {
    try {
      const [a, e, s, c, p] = await Promise.all([
        pb.collection('areas_contexto').getFullList({ sort: 'orden' }),
        pb.collection('dofa_elementos').getFullList({ sort: '-created', expand: 'area_id,identificado_por_id' }),
        pb.collection('estrategias_contexto').getFullList({ sort: '-created', expand: 'elementos_dofa' }),
        pb.collection('colaboradores').getFullList({ sort: 'nombre', filter: 'activo=true' }),
        pb.collection('pilares_estrategicos').getFullList({ sort: 'orden', filter: 'activo=true' }),
      ]);
      setAreas(a as unknown as AreaContexto[]);
      setElementos(e as unknown as DofaElemento[]);
      setEstrategias(s as unknown as EstrategiaContexto[]);
      setColaboradores(c as unknown as Colaborador[]);
      setPilares(p as unknown as PilarEstrategicoRecord[]);
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
        <Link href="/organizacion" className="btn-secondary flex items-center gap-2 text-sm">
          <Building2 size={16} /> Organización <ExternalLink size={12} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {([
          { key: 'dofa', label: 'Elementos DOFA', icon: Layers },
          { key: 'estrategias', label: 'Estrategias', icon: Target },
          { key: 'canvas', label: 'Canvas Portafolio', icon: BarChart3 },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dofa' && <TabDOFA elementos={elementos} areas={areas} colaboradores={colaboradores} onReload={cargarTodo} />}
      {tab === 'estrategias' && <TabEstrategias estrategias={estrategias} elementos={elementos} areas={areas} colaboradores={colaboradores} pilares={pilares} onReload={cargarTodo} />}
      {tab === 'canvas' && <TabCanvas estrategias={estrategias} pilares={pilares} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TAB: ELEMENTOS DOFA (brainstorm)
// ═════════════════════════════════════════════════════════════
function TabDOFA({ elementos, areas, colaboradores, onReload }: {
  elementos: DofaElemento[]; areas: AreaContexto[]; colaboradores: Colaborador[]; onReload: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterArea, setFilterArea] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tipo_dofa: 'fortaleza' as DofaElemento['tipo_dofa'],
    descripcion: '',
    area_id: '',
    identificado_por_id: '',
    contexto: 'interno' as 'interno' | 'externo',
  });

  // Auto-set contexto when tipo_dofa changes
  function handleTipoChange(tipo: DofaElemento['tipo_dofa']) {
    const cfg = DOFA_CONFIG[tipo];
    setForm(f => ({ ...f, tipo_dofa: tipo, contexto: cfg.contexto }));
  }

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
      const data = {
        tipo_dofa: form.tipo_dofa,
        descripcion: form.descripcion,
        area_id: form.area_id || null,
        identificado_por_id: form.identificado_por_id || null,
        fecha_identificacion: new Date().toISOString(),
        contexto: form.contexto,
      };
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
      identificado_por_id: el.identificado_por_id || '',
      contexto: el.contexto || DOFA_CONFIG[el.tipo_dofa].contexto,
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
    setForm({ tipo_dofa: 'fortaleza', descripcion: '', area_id: '', identificado_por_id: '', contexto: 'interno' });
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
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
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

      {/* Form — improved visual */}
      {showForm && (
        <div className="card mb-6 overflow-hidden border-2 border-blue-200">
          {/* Form header with color bar */}
          <div className={`px-6 py-3 ${DOFA_CONFIG[form.tipo_dofa].color} flex items-center gap-2`}>
            {(() => { const Icon = DOFA_CONFIG[form.tipo_dofa].icon; return <Icon size={18} />; })()}
            <span className="font-bold">{editingId ? 'Editar' : 'Nuevo'} Elemento — {DOFA_CONFIG[form.tipo_dofa].label}</span>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-white/50">
              Contexto {form.contexto === 'interno' ? '🏢 Interno' : '🌐 Externo'}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Row 1: Tipo DOFA (big selector) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo DOFA *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.entries(DOFA_CONFIG) as [DofaElemento['tipo_dofa'], typeof DOFA_CONFIG.fortaleza][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const selected = form.tipo_dofa === key;
                  return (
                    <button key={key} type="button" onClick={() => handleTipoChange(key)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selected ? cfg.color + ' border-current shadow-md scale-[1.02]' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}>
                      <Icon size={20} className="mx-auto mb-1" />
                      <span className="text-sm font-bold">{cfg.label}</span>
                      <span className={`block text-xs mt-0.5 ${selected ? '' : 'text-slate-400'}`}>
                        {cfg.contexto === 'interno' ? '🏢 Interno' : '🌐 Externo'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Descripción */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción *</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={3} required
                placeholder={`Describe la ${DOFA_CONFIG[form.tipo_dofa].label.toLowerCase()} identificada...`} />
            </div>

            {/* Row 3: Área + Identificado por */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Área</label>
                <select value={form.area_id} onChange={e => setForm({ ...form, area_id: e.target.value })} className="input-field">
                  <option value="">Sin área</option>
                  {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Identificado por</label>
                <select value={form.identificado_por_id} onChange={e => setForm({ ...form, identificado_por_id: e.target.value })} className="input-field">
                  <option value="">Seleccionar colaborador...</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido || ''}{c.cargo ? ` — ${c.cargo}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
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
                <span className="ml-auto text-xs opacity-75">{cfg.contexto === 'interno' ? '🏢 Interno' : '🌐 Externo'}</span>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Sin elementos registrados</p>
                ) : items.map(el => {
                  const areaName = el.expand?.area_id?.nombre || '';
                  const areaColor = el.expand?.area_id?.color || '#94a3b8';
                  const personName = el.expand?.identificado_por_id
                    ? `${el.expand.identificado_por_id.nombre} ${el.expand.identificado_por_id.apellido || ''}`.trim()
                    : el.identificado_por || '';
                  return (
                    <div key={el.id} className={`p-3 mb-2 rounded-lg border ${el.consolidado ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'} group relative`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 leading-relaxed">{el.descripcion}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {areaName && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: areaColor }}>{areaName}</span>
                            )}
                            {personName && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                <Users size={10} className="inline mr-1" />{personName}
                              </span>
                            )}
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
function TabEstrategias({ estrategias, elementos, areas, colaboradores, pilares, onReload }: {
  estrategias: EstrategiaContexto[]; elementos: DofaElemento[]; areas: AreaContexto[];
  colaboradores: Colaborador[]; pilares: PilarEstrategicoRecord[]; onReload: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo_estrategia: 'FO' as EstrategiaContexto['tipo_estrategia'],
    elementos_dofa: [] as string[],
    pilar_estrategico: '' as string,
    tipo_proyecto: 'mejoramiento' as string,
    nivel_recursos: 'medio' as NivelRecursos,
    dificultad_implementacion: 'media' as 'alta' | 'media' | 'baja',
    responsable_id: '',
    area_responsable: '',
    fecha_inicio: '',
    fecha_meta: '',
    estado: 'propuesta' as EstrategiaContexto['estado'],
    porcentaje_avance: 0,
  });

  // Get relevant DOFA elements based on tipo_estrategia
  const [tipoA, tipoB] = ESTRATEGIA_DOFA_MAP[form.tipo_estrategia] || ['fortaleza', 'oportunidad'];
  const elementosTipoA = elementos.filter(e => e.tipo_dofa === tipoA);
  const elementosTipoB = elementos.filter(e => e.tipo_dofa === tipoB);

  // Build pilar labels from DB records
  const pilarLabels = useMemo(() => {
    const m: Record<string, string> = {};
    pilares.forEach(p => { m[p.id] = p.nombre; });
    return m;
  }, [pilares]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo_estrategia: form.tipo_estrategia,
        elementos_dofa: form.elementos_dofa.length ? form.elementos_dofa : [],
        pilar_estrategico: form.pilar_estrategico,
        tipo_proyecto: form.tipo_proyecto,
        nivel_recursos: form.nivel_recursos,
        dificultad_implementacion: form.dificultad_implementacion,
        responsable_id: form.responsable_id || null,
        area_responsable: form.area_responsable || null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_meta: form.fecha_meta || null,
        estado: form.estado,
        porcentaje_avance: form.porcentaje_avance,
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
      pilar_estrategico: s.pilar_estrategico || '',
      tipo_proyecto: s.tipo_proyecto,
      nivel_recursos: s.nivel_recursos,
      dificultad_implementacion: s.dificultad_implementacion,
      responsable_id: s.responsable_id || '',
      area_responsable: s.area_responsable || '',
      fecha_inicio: s.fecha_inicio?.split('T')[0] || '',
      fecha_meta: s.fecha_meta?.split('T')[0] || '',
      estado: s.estado,
      porcentaje_avance: s.porcentaje_avance || 0,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta estrategia?')) return;
    try { await pb.collection('estrategias_contexto').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  function resetForm() {
    setForm({
      titulo: '', descripcion: '', tipo_estrategia: 'FO', elementos_dofa: [],
      pilar_estrategico: pilares[0]?.id || '', tipo_proyecto: 'mejoramiento',
      nivel_recursos: 'medio', dificultad_implementacion: 'media',
      responsable_id: '', area_responsable: '', fecha_inicio: '', fecha_meta: '',
      estado: 'propuesta', porcentaje_avance: 0,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function toggleElemento(id: string) {
    setForm(f => ({
      ...f,
      elementos_dofa: f.elementos_dofa.includes(id) ? f.elementos_dofa.filter(x => x !== id) : [...f.elementos_dofa, id],
    }));
  }

  return (
    <>
      <div className="flex gap-3 mb-6">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Estrategia
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Lightbulb size={16} /> {estrategias.length} estrategias registradas
        </div>
      </div>

      {showForm && (
        <div className="card mb-6 overflow-hidden border-2 border-blue-200">
          <div className="px-6 py-3 bg-indigo-100 text-indigo-700 border-b flex items-center gap-2">
            <Target size={18} />
            <span className="font-bold">{editingId ? 'Editar' : 'Nueva'} Estrategia</span>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded bg-indigo-200">
              {ESTRATEGIA_LABELS[form.tipo_estrategia]}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Step 1: Tipo Estrategia (big visual selector) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">1. Tipo de Estrategia DOFA *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.entries(ESTRATEGIA_LABELS) as [string, string][]).map(([key, label]) => {
                  const selected = form.tipo_estrategia === key;
                  const [tA, tB] = ESTRATEGIA_DOFA_MAP[key];
                  return (
                    <button key={key} type="button"
                      onClick={() => setForm(f => ({ ...f, tipo_estrategia: key as EstrategiaContexto['tipo_estrategia'], elementos_dofa: [] }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selected ? 'bg-indigo-50 border-indigo-400 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}>
                      <span className="text-lg font-bold">{key}</span>
                      <span className="block text-xs mt-1 text-slate-500">
                        {DOFA_CONFIG[tA as keyof typeof DOFA_CONFIG]?.label} + {DOFA_CONFIG[tB as keyof typeof DOFA_CONFIG]?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Link DOFA elements (split by the 2 types) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                2. Seleccionar Elementos DOFA vinculados
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ tipo: tipoA, items: elementosTipoA }, { tipo: tipoB, items: elementosTipoB }].map(({ tipo, items }) => {
                  const cfg = DOFA_CONFIG[tipo as keyof typeof DOFA_CONFIG];
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  return (
                    <div key={tipo} className="border rounded-xl overflow-hidden">
                      <div className={`px-3 py-2 ${cfg.color} flex items-center gap-2 text-sm`}>
                        <Icon size={14} />
                        <span className="font-bold">{cfg.label}s ({items.length})</span>
                      </div>
                      <div className="p-2 max-h-48 overflow-y-auto">
                        {items.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">Sin elementos de tipo {cfg.label.toLowerCase()}</p>
                        ) : items.map(el => (
                          <label key={el.id} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer border mb-1 transition-all ${
                            form.elementos_dofa.includes(el.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}>
                            <input type="checkbox" checked={form.elementos_dofa.includes(el.id)} onChange={() => toggleElemento(el.id)} className="mt-0.5" />
                            <span className="text-xs text-slate-700 leading-relaxed">
                              {el.descripcion.substring(0, 120)}{el.descripcion.length > 120 ? '…' : ''}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Strategy details */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">3. Detalle de la Estrategia</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Título *</label>
                  <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="input-field" required placeholder="Nombre de la estrategia..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción *</label>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={3} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pilar Estratégico *</label>
                    <select value={form.pilar_estrategico} onChange={e => setForm({ ...form, pilar_estrategico: e.target.value })} className="input-field" required>
                      <option value="">Seleccionar...</option>
                      {pilares.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Proyecto *</label>
                    <select value={form.tipo_proyecto} onChange={e => setForm({ ...form, tipo_proyecto: e.target.value })} className="input-field" required>
                      {Object.entries(TIPO_PROY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
                    <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as EstrategiaContexto['estado'] })} className="input-field">
                      <option value="propuesta">Propuesta</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="en_ejecucion">En Ejecución</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel de Recursos</label>
                    <div className="flex gap-1">
                      {(['bajo', 'medio', 'alto'] as NivelRecursos[]).map(nr => (
                        <button key={nr} type="button" onClick={() => setForm({ ...form, nivel_recursos: nr })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            form.nivel_recursos === nr
                              ? nr === 'alto' ? 'bg-red-50 border-red-300 text-red-700' : nr === 'medio' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-green-50 border-green-300 text-green-700'
                              : 'border-slate-200 text-slate-400'
                          }`}>
                          {nr.charAt(0).toUpperCase() + nr.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dificultad</label>
                    <div className="flex gap-1">
                      {(['baja', 'media', 'alta'] as const).map(d => (
                        <button key={d} type="button" onClick={() => setForm({ ...form, dificultad_implementacion: d })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            form.dificultad_implementacion === d
                              ? d === 'alta' ? 'bg-red-50 border-red-300 text-red-700' : d === 'media' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-green-50 border-green-300 text-green-700'
                              : 'border-slate-200 text-slate-400'
                          }`}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Responsable</label>
                    <select value={form.responsable_id} onChange={e => setForm({ ...form, responsable_id: e.target.value })} className="input-field">
                      <option value="">Seleccionar colaborador...</option>
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} {c.apellido || ''}{c.cargo ? ` — ${c.cargo}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Área Responsable</label>
                    <select value={form.area_responsable} onChange={e => setForm({ ...form, area_responsable: e.target.value })} className="input-field">
                      <option value="">Sin área</option>
                      {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha inicio</label>
                    <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha meta</label>
                    <input type="date" value={form.fecha_meta} onChange={e => setForm({ ...form, fecha_meta: e.target.value })} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
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
                  {s.pilar_estrategico && pilarLabels[s.pilar_estrategico] && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{pilarLabels[s.pilar_estrategico]}</span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">{TIPO_PROY_LABELS[s.tipo_proyecto] || s.tipo_proyecto}</span>
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
function TabCanvas({ estrategias, pilares }: { estrategias: EstrategiaContexto[]; pilares: PilarEstrategicoRecord[] }) {
  const pilarIds = pilares.map(p => p.id);
  const tipos = ['mejoramiento', 'extension', 'transformacion'];

  const cellWidth = 220;
  const cellHeight = 130;
  const leftMargin = 180;
  const topMargin = 50;
  const svgWidth = leftMargin + tipos.length * cellWidth + 40;
  const svgHeight = topMargin + pilarIds.length * cellHeight + 50;

  // Build pilar label map
  const pilarMap = useMemo(() => {
    const m: Record<string, PilarEstrategicoRecord> = {};
    pilares.forEach(p => { m[p.id] = p; });
    return m;
  }, [pilares]);

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
            { color: '#ef4444', size: 14, label: 'Alta dificultad / Medios recursos' },
            { color: '#ef4444', size: 10, label: 'Alta dificultad / Bajos recursos' },
            { color: '#eab308', size: 20, label: 'Media dificultad / Altos recursos' },
            { color: '#eab308', size: 14, label: 'Media dificultad / Medios recursos' },
            { color: '#eab308', size: 10, label: 'Media dificultad / Bajos recursos' },
            { color: '#22c55e', size: 20, label: 'Baja dificultad / Altos recursos' },
            { color: '#22c55e', size: 14, label: 'Baja dificultad / Medios recursos' },
            { color: '#22c55e', size: 10, label: 'Baja dificultad / Bajos recursos' },
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
          {pilarIds.map((_, ri) => (
            <line key={`h${ri}`} x1={leftMargin} y1={topMargin + ri * cellHeight} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + ri * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          <line x1={leftMargin} y1={topMargin + pilarIds.length * cellHeight} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + pilarIds.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          {tipos.map((_, ci) => (
            <line key={`v${ci}`} x1={leftMargin + ci * cellWidth} y1={topMargin} x2={leftMargin + ci * cellWidth} y2={topMargin + pilares.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />
          ))}
          <line x1={leftMargin + tipos.length * cellWidth} y1={topMargin} x2={leftMargin + tipos.length * cellWidth} y2={topMargin + pilarIds.length * cellHeight} stroke="#e2e8f0" strokeWidth={1} />

          {/* Y-axis labels (pilares) */}
          {pilarIds.map((pId, ri) => {
            const pilar = pilarMap[pId];
            const label = pilar?.nombre || pId;
            return (
              <text key={pId} x={leftMargin - 10} y={topMargin + ri * cellHeight + cellHeight / 2} textAnchor="end" dominantBaseline="middle" fontSize={11} fontWeight={600} fill="#334155">
                {label.split(' ').map((w, wi) => (
                  <tspan key={wi} x={leftMargin - 10} dy={wi === 0 ? -(label.split(' ').length - 1) * 7 : 14}>{w}</tspan>
                ))}
              </text>
            );
          })}

          {/* X-axis labels (tipos) */}
          {tipos.map((t, ci) => (
            <text key={t} x={leftMargin + ci * cellWidth + cellWidth / 2} y={topMargin + pilarIds.length * cellHeight + 25} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155">
              {TIPO_PROY_LABELS[t]}
            </text>
          ))}

          {/* Axis titles */}
          <text x={10} y={topMargin + (pilarIds.length * cellHeight) / 2} textAnchor="middle" transform={`rotate(-90, 10, ${topMargin + (pilarIds.length * cellHeight) / 2})`} fontSize={12} fontWeight={700} fill="#1e40af">
            Prioridad estratégica
          </text>
          <text x={leftMargin + (tipos.length * cellWidth) / 2} y={svgHeight - 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1e40af">
            Proyectos
          </text>

          {/* Bubbles */}
          {pilarIds.map((pId, ri) => tipos.map((t, ci) => {
            const key = `${pId}__${t}`;
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
                  <td className="p-3 text-slate-600">{pilarMap[s.pilar_estrategico]?.nombre || s.pilar_estrategico}</td>
                  <td className="p-3 text-slate-600">{TIPO_PROY_LABELS[s.tipo_proyecto]}</td>
                  <td className="p-3 text-center">
                    <svg width={20} height={20} className="inline">
                      <circle cx={10} cy={10} r={getBubbleSize(s.nivel_recursos) / 5} fill={getBubbleColor(s.dificultad_implementacion, s.nivel_recursos)} opacity={0.85} />
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
