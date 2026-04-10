'use client';

import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';
import type { Organizacion, PilarEstrategicoRecord, AreaContexto, Colaborador, RolArea, Permiso } from '@/lib/types';
import {
  ArrowLeft, Plus, Save, X, Loader2, Edit, Trash2,
  Building2, Target, Layers, Users, Eye, CheckCircle2,
  Mail, ExternalLink, AlertTriangle, Clock, CalendarCheck
} from 'lucide-react';

// ── Vigencia helper ──────────────────────────────────────────
function VigenciaBadge({ fecha }: { fecha?: string }) {
  if (!fecha) return <span className="text-xs text-slate-400 italic">Sin fecha de vigencia</span>;
  const today = new Date();
  const exp = new Date(fecha);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      <AlertTriangle size={11} /> Vencido · {exp.toLocaleDateString('es-CO')}
    </span>
  );
  if (diffDays <= 30) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      <Clock size={11} /> Vence en {diffDays}d · {exp.toLocaleDateString('es-CO')}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <CalendarCheck size={11} /> Vigente hasta {exp.toLocaleDateString('es-CO')}
    </span>
  );
}

const ROL_LABELS: Record<RolArea, string> = {
  director: 'Director',
  coordinador: 'Coordinador',
  analista: 'Analista',
  operativo: 'Operativo',
  pasante: 'Pasante',
};

const PERMISO_LABELS: Record<Permiso, string> = {
  admin: 'Administrador',
  edicion: 'Edición',
  consulta: 'Consulta',
  cargue: 'Cargue',
};

const PERMISO_COLORS: Record<Permiso, string> = {
  admin: 'bg-red-100 text-red-700',
  edicion: 'bg-blue-100 text-blue-700',
  consulta: 'bg-green-100 text-green-700',
  cargue: 'bg-amber-100 text-amber-700',
};

export default function OrganizacionPage() {
  const [tab, setTab] = useState<'estrategia' | 'areas' | 'colaboradores'>('estrategia');
  const [org, setOrg] = useState<Organizacion | null>(null);
  const [pilares, setPilares] = useState<PilarEstrategicoRecord[]>([]);
  const [areas, setAreas] = useState<AreaContexto[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarTodo(); }, []);

  async function cargarTodo() {
    try {
      const [orgList, p, a, c] = await Promise.all([
        pb.collection('organizacion').getFullList(),
        pb.collection('pilares_estrategicos').getFullList({ sort: 'orden' }),
        pb.collection('areas_contexto').getFullList({ sort: 'orden' }),
        pb.collection('colaboradores').getFullList({ sort: 'nombre', expand: 'area_id' }),
      ]);
      setOrg(orgList.length > 0 ? orgList[0] as unknown as Organizacion : null);
      setPilares(p as unknown as PilarEstrategicoRecord[]);
      setAreas(a as unknown as AreaContexto[]);
      setColaboradores(c as unknown as Colaborador[]);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organización</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-7">Direccionamiento estratégico, pilares, áreas y colaboradores</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {([
          { key: 'estrategia', label: 'Estrategia', icon: Target },
          { key: 'areas', label: 'Áreas', icon: Building2 },
          { key: 'colaboradores', label: 'Colaboradores', icon: Users },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'estrategia' && <TabEstrategia org={org} pilares={pilares} onReload={cargarTodo} />}
      {tab === 'areas' && <TabAreas areas={areas} onReload={cargarTodo} />}
      {tab === 'colaboradores' && <TabColaboradores colaboradores={colaboradores} areas={areas} onReload={cargarTodo} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB COMBINADO: ESTRATEGIA (Direccionamiento + Pilares)
// ═══════════════════════════════════════════════════════
function TabEstrategia({ org, pilares, onReload }: {
  org: Organizacion | null;
  pilares: PilarEstrategicoRecord[];
  onReload: () => Promise<void>;
}) {
  return (
    <div className="space-y-8">
      <SectionDireccionamiento org={org} onReload={onReload} />
      <div className="border-t border-slate-200" />
      <SectionPilares pilares={pilares} onReload={onReload} />
    </div>
  );
}

// ── Sección: Direccionamiento ────────────────────────────
function SectionDireccionamiento({ org, onReload }: { org: Organizacion | null; onReload: () => Promise<void> }) {
  const [editing, setEditing] = useState(!org);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre_empresa: org?.nombre_empresa || '',
    proposito_superior: org?.proposito_superior || '',
    objetivo_estrategico: org?.objetivo_estrategico || '',
    resumen_estrategia: org?.resumen_estrategia || '',
    mision: org?.mision || '',
    vision: org?.vision || '',
    fecha_vigencia: org?.fecha_vigencia?.split('T')[0] || '',
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, fecha_vigencia: form.fecha_vigencia || null };
      if (org) {
        await pb.collection('organizacion').update(org.id, data);
      } else {
        await pb.collection('organizacion').create(data);
      }
      await onReload();
      setEditing(false);
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setSaving(false); }
  }

  if (!editing && org) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Direccionamiento Estratégico</h2>
          </div>
          <div className="flex items-center gap-3">
            <VigenciaBadge fecha={org.fecha_vigencia} />
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors">
              <Edit size={16} />
            </button>
          </div>
        </div>

        {/* Header card */}
        <div className="card p-5 mb-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
          <h3 className="text-xl font-bold">{org.nombre_empresa || 'Mi Organización'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Misión', value: org.mision, icon: '📋' },
            { title: 'Visión', value: org.vision, icon: '🔭' },
            { title: 'Propósito Superior', value: org.proposito_superior, icon: '🎯' },
            { title: 'Objetivo Estratégico', value: org.objetivo_estrategico, icon: '🏆' },
          ].map(item => (
            <div key={item.title} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{item.icon}</span>
                <h4 className="font-semibold text-slate-700 text-sm">{item.title}</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.value || <span className="italic text-slate-400">No definido</span>}
              </p>
            </div>
          ))}
        </div>
        {org.resumen_estrategia && (
          <div className="card p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📊</span>
              <h4 className="font-semibold text-slate-700 text-sm">Resumen de la Estrategia</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{org.resumen_estrategia}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Target size={20} className="text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Direccionamiento Estratégico</h2>
      </div>
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Empresa *</label>
          <input type="text" value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} className="input-field" required placeholder="Nombre de tu organización..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Misión</label>
            <textarea value={form.mision} onChange={e => setForm({ ...form, mision: e.target.value })} className="input-field" rows={3} placeholder="¿Qué hacemos y para quién?" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Visión</label>
            <textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} className="input-field" rows={3} placeholder="¿A dónde queremos llegar?" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Propósito Superior</label>
          <textarea value={form.proposito_superior} onChange={e => setForm({ ...form, proposito_superior: e.target.value })} className="input-field" rows={3} placeholder="El por qué trascendente de la organización..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Objetivo Estratégico</label>
          <textarea value={form.objetivo_estrategico} onChange={e => setForm({ ...form, objetivo_estrategico: e.target.value })} className="input-field" rows={3} placeholder="El objetivo principal que guía la estrategia..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Resumen de la Estrategia</label>
          <textarea value={form.resumen_estrategia} onChange={e => setForm({ ...form, resumen_estrategia: e.target.value })} className="input-field" rows={3} placeholder="Descripción general de la estrategia organizacional..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Vigencia del Direccionamiento Estratégico</label>
          <input type="date" value={form.fecha_vigencia} onChange={e => setForm({ ...form, fecha_vigencia: e.target.value })} className="input-field !w-auto" />
          <p className="text-xs text-slate-400 mt-1">Fecha hasta la que son válidos la misión, visión, propósito, objetivos y pilares estratégicos</p>
        </div>
        <div className="flex gap-3 justify-end">
          {org && <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-2"><X size={16} /> Cancelar</button>}
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sección: Pilares Estratégicos ────────────────────────
function SectionPilares({ pilares, onReload }: { pilares: PilarEstrategicoRecord[]; onReload: () => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '#2563eb', orden: 0 });

  async function handleSaveNew(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await pb.collection('pilares_estrategicos').create({ ...form, activo: true });
      await onReload();
      setForm({ nombre: '', descripcion: '', color: '#2563eb', orden: 0 });
      setShowNew(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await pb.collection('pilares_estrategicos').update(id, form);
      await onReload();
      setEditingId(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function toggleActivo(p: PilarEstrategicoRecord) {
    try { await pb.collection('pilares_estrategicos').update(p.id, { activo: !p.activo }); await onReload(); } catch (err) { console.error(err); }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este pilar estratégico?')) return;
    try { await pb.collection('pilares_estrategicos').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  function startEdit(p: PilarEstrategicoRecord) {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', color: p.color || '#2563eb', orden: p.orden || 0 });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Pilares Estratégicos</h2>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 text-sm py-1.5"><Plus size={15} /> Nuevo Pilar</button>
      </div>

      {showNew && (
        <form onSubmit={handleSaveNew} className="card p-5 mb-4 border-2 border-blue-200 space-y-3">
          <h4 className="font-bold text-slate-800">Nuevo Pilar Estratégico</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
            </div>
            <div className="flex gap-2 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Color</label>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Orden</label>
                <input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} className="input-field !w-20" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex items-center gap-1"><X size={14} /> Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1"><Save size={14} /> Crear</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pilares.map(p => (
          <div key={p.id} className={`card p-4 ${!p.activo ? 'opacity-50' : ''}`}>
            {editingId === p.id ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field flex-1" placeholder="Nombre..." />
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                  <input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} className="input-field !w-16" />
                </div>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="input-field" rows={2} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="btn-secondary text-xs flex items-center gap-1"><X size={13} /> Cancelar</button>
                  <button onClick={() => handleUpdate(p.id)} className="btn-primary text-xs flex items-center gap-1"><Save size={13} /> Guardar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-10 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: p.color || '#94a3b8' }} />
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">{p.nombre}</h4>
                      {p.descripcion && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => toggleActivo(p)} className={`p-1.5 rounded-lg ${p.activo ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'}`}>
                      <Eye size={13} />
                    </button>
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50"><Edit size={13} className="text-blue-600" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={13} className="text-red-600" /></button>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
        {pilares.length === 0 && <p className="col-span-2 text-center text-slate-400 py-8">No hay pilares estratégicos. Crea el primero.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: ÁREAS
// ═══════════════════════════════════════════════════════
function TabAreas({ areas, onReload }: { areas: AreaContexto[]; onReload: () => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: '#2563eb', orden: 0, link_daruma: '' });
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSaveNew(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await pb.collection('areas_contexto').create({ ...form, link_daruma: form.link_daruma || null, activa: true });
      await onReload();
      setForm({ nombre: '', descripcion: '', color: '#2563eb', orden: 0, link_daruma: '' });
      setShowNew(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try { await pb.collection('areas_contexto').update(id, { ...form, link_daruma: form.link_daruma || null }); await onReload(); setEditingId(null); } catch (err) { console.error(err); }
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
    setForm({ nombre: a.nombre, descripcion: a.descripcion || '', color: a.color || '#2563eb', orden: a.orden || 0, link_daruma: a.link_daruma || '' });
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva Área</button>
        <p className="text-sm text-slate-500 flex items-center gap-1"><Building2 size={14} /> Las áreas se usan en DOFA, estrategias y colaboradores</p>
      </div>

      {showNew && (
        <form onSubmit={handleSaveNew} className="card p-5 mb-4 border-2 border-blue-200 space-y-3">
          <h4 className="font-bold text-slate-800">Nueva Área</h4>
          <div className="flex flex-wrap gap-3 items-end">
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
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Link Daruma <span className="font-normal text-slate-400">(caracterización del área)</span>
            </label>
            <input type="url" value={form.link_daruma} onChange={e => setForm({ ...form, link_daruma: e.target.value })} className="input-field" placeholder="https://daruma.app/..." />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex items-center gap-1"><X size={14} /> Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1"><Save size={14} /> Crear</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {areas.map(a => (
          <div key={a.id} className={`card p-4 flex items-center justify-between gap-4 ${!a.activa ? 'opacity-50' : ''}`}>
            {editingId === a.id ? (
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field !w-auto" />
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                  <input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: Number(e.target.value) })} className="input-field !w-16" />
                </div>
                <input type="url" value={form.link_daruma} onChange={e => setForm({ ...form, link_daruma: e.target.value })} className="input-field" placeholder="https://daruma.app/..." />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(a.id)} className="btn-primary text-xs flex items-center gap-1"><Save size={13} /> Guardar</button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary text-xs flex items-center gap-1"><X size={13} /> Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-5 h-5 rounded-full border shrink-0" style={{ backgroundColor: a.color || '#94a3b8' }} />
                  <div className="min-w-0">
                    {a.link_daruma ? (
                      <a href={a.link_daruma} target="_blank" rel="noopener noreferrer"
                        className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                        {a.nombre}
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-indigo-500 shrink-0" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">{a.nombre}</span>
                    )}
                    {a.link_daruma && (
                      <p className="text-xs text-slate-400 truncate max-w-xs">{a.link_daruma}</p>
                    )}
                  </div>
                  {!a.activa && <span className="text-xs text-slate-400">(inactiva)</span>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleActiva(a)} className={`p-1.5 rounded-lg text-xs ${a.activa ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
                    <Eye size={14} />
                  </button>
                  <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg hover:bg-blue-50"><Edit size={14} className="text-blue-600" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-600" /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {areas.length === 0 && <p className="text-center text-slate-400 py-8">No hay áreas registradas.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB: COLABORADORES
// ═══════════════════════════════════════════════════════
function TabColaboradores({ colaboradores, areas, onReload }: {
  colaboradores: Colaborador[]; areas: AreaContexto[]; onReload: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterArea, setFilterArea] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    area_id: '',
    rol_area: 'analista' as RolArea,
    permisos: ['consulta'] as Permiso[],
    fecha_ingreso: '',
  });

  const filtered = colaboradores.filter(c => {
    if (filterArea && c.area_id !== filterArea) return false;
    return true;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        area_id: form.area_id || null,
        fecha_ingreso: form.fecha_ingreso || null,
        activo: true,
      };
      if (editingId) {
        await pb.collection('colaboradores').update(editingId, data);
      } else {
        await pb.collection('colaboradores').create(data);
      }
      await onReload();
      resetForm();
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setSaving(false); }
  }

  function handleEdit(c: Colaborador) {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre,
      apellido: c.apellido || '',
      email: c.email || '',
      telefono: c.telefono || '',
      cargo: c.cargo || '',
      area_id: c.area_id || '',
      rol_area: c.rol_area || 'analista',
      permisos: c.permisos || ['consulta'],
      fecha_ingreso: c.fecha_ingreso?.split('T')[0] || '',
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este colaborador?')) return;
    try { await pb.collection('colaboradores').delete(id); await onReload(); } catch (err) { console.error(err); }
  }

  async function toggleActivo(c: Colaborador) {
    try { await pb.collection('colaboradores').update(c.id, { activo: !c.activo }); await onReload(); } catch (err) { console.error(err); }
  }

  function togglePermiso(p: Permiso) {
    setForm(f => ({
      ...f,
      permisos: f.permisos.includes(p) ? f.permisos.filter(x => x !== p) : [...f.permisos, p],
    }));
  }

  function resetForm() {
    setForm({ nombre: '', apellido: '', email: '', telefono: '', cargo: '', area_id: '', rol_area: 'analista', permisos: ['consulta'], fecha_ingreso: '' });
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo Colaborador</button>
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="input-field !w-auto">
          <option value="">Todas las áreas</option>
          {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <span className="text-sm text-slate-500">{filtered.length} colaboradores</span>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Editar' : 'Nuevo'} Colaborador</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input-field" required placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
              <input type="text" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} className="input-field" placeholder="Apellido..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="correo@empresa.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
              <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="input-field" placeholder="300 123 4567" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cargo</label>
              <input type="text" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="input-field" placeholder="Cargo en la organización..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Área</label>
              <select value={form.area_id} onChange={e => setForm({ ...form, area_id: e.target.value })} className="input-field">
                <option value="">Sin área</option>
                {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rol en el Área</label>
              <select value={form.rol_area} onChange={e => setForm({ ...form, rol_area: e.target.value as RolArea })} className="input-field">
                {Object.entries(ROL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Ingreso</label>
              <input type="date" value={form.fecha_ingreso} onChange={e => setForm({ ...form, fecha_ingreso: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Permisos</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PERMISO_LABELS) as [Permiso, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => togglePermiso(key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.permisos.includes(key) ? PERMISO_COLORS[key] + ' border-current' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                    {form.permisos.includes(key) && <CheckCircle2 size={12} className="inline mr-1" />}
                    {label}
                  </button>
                ))}
              </div>
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

      {/* Colaboradores list */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-slate-400 py-12">No hay colaboradores registrados.</p>}
        {filtered.map(c => {
          const areaName = c.expand?.area_id?.nombre || '';
          const areaColor = c.expand?.area_id?.color || '#94a3b8';
          return (
            <div key={c.id} className={`card p-4 group ${!c.activo ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: areaColor }}>
                    {c.nombre.charAt(0)}{c.apellido ? c.apellido.charAt(0) : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800">{c.nombre} {c.apellido || ''}</h4>
                      {c.cargo && <span className="text-xs text-slate-500">· {c.cargo}</span>}
                      {c.rol_area && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {ROL_LABELS[c.rol_area]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {areaName && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: areaColor }}>
                          {areaName}
                        </span>
                      )}
                      {c.email && (
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {c.email}</span>
                      )}
                      {c.permisos && c.permisos.length > 0 && c.permisos.map(p => (
                        <span key={p} className={`text-xs px-1.5 py-0.5 rounded font-medium ${PERMISO_COLORS[p]}`}>
                          {PERMISO_LABELS[p]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => toggleActivo(c)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <Eye size={14} className={c.activo ? 'text-amber-600' : 'text-green-600'} />
                  </button>
                  <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50"><Edit size={14} className="text-blue-600" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-600" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
