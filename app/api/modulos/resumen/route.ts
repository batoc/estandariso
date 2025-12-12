import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Obtener datos de TODOS los módulos ISO 9.3.2 en paralelo
    const [
      cambios,
      encuestas,
      quejas,
      objetivos,
      inspecciones,
      noConformidades,
      indicadores,
      auditorias,
      proveedores,
      recursos,
      riesgos,
      mejoras
    ] = await Promise.all([
      supabase.from('gestion_cambios').select('*').order('fecha_identificacion', { ascending: false }),
      supabase.from('encuestas_satisfaccion').select('*').order('fecha_encuesta', { ascending: false }),
      supabase.from('quejas_reclamos').select('*').order('fecha_recepcion', { ascending: false }),
      supabase.from('objetivos_calidad').select('*').order('fecha_inicio', { ascending: false }),
      supabase.from('inspecciones_verificacion').select('*').order('fecha_inspeccion', { ascending: false }),
      supabase.from('no_conformidades').select('*').order('fecha_deteccion', { ascending: false }),
      supabase.from('indicadores').select('*').order('created_at', { ascending: false }),
      supabase.from('auditorias').select('*').order('fecha_auditoria', { ascending: false }),
      supabase.from('proveedores').select('*').order('calificacion_actual', { ascending: false }),
      supabase.from('recursos').select('*').order('fecha_evaluacion', { ascending: false }),
      supabase.from('riesgos_oportunidades').select('*').order('fecha_identificacion', { ascending: false }),
      supabase.from('oportunidades_mejora').select('*').order('fecha_identificacion', { ascending: false })
    ]);

    // Verificar errores
    if (cambios.error) throw cambios.error;
    if (encuestas.error) throw encuestas.error;
    if (quejas.error) throw quejas.error;
    if (objetivos.error) throw objetivos.error;
    if (inspecciones.error) throw inspecciones.error;
    if (noConformidades.error) throw noConformidades.error;
    if (indicadores.error) throw indicadores.error;
    if (auditorias.error) throw auditorias.error;
    if (proveedores.error) throw proveedores.error;
    if (recursos.error) throw recursos.error;
    if (riesgos.error) throw riesgos.error;
    if (mejoras.error) throw mejoras.error;

    return NextResponse.json({
      // 9.3.2.b - Cambios externos e internos
      gestion_cambios: cambios.data,
      
      // 9.3.2.c.1 - Retroalimentación del cliente
      encuestas_satisfaccion: encuestas.data,
      quejas_reclamos: quejas.data,
      
      // 9.3.2.c.2 - Objetivos de calidad
      objetivos_calidad: objetivos.data,
      
      // 9.3.2.c.3 - Conformidad de productos y servicios
      inspecciones_verificacion: inspecciones.data,
      
      // 9.3.2.c.4 - No conformidades y acciones correctivas
      no_conformidades: noConformidades.data,
      
      // 9.3.2.c.5 - Resultados de seguimiento y medición
      indicadores: indicadores.data,
      
      // 9.3.2.c.6 - Resultados de auditorías
      auditorias: auditorias.data,
      
      // 9.3.2.c.7 - Desempeño de proveedores externos
      proveedores: proveedores.data,
      
      // 9.3.2.d - Adecuación de recursos
      recursos: recursos.data,
      
      // 9.3.2.e - Eficacia de acciones para riesgos y oportunidades
      riesgos_oportunidades: riesgos.data,
      
      // 9.3.2.f - Oportunidades de mejora
      oportunidades_mejora: mejoras.data
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen de módulos' },
      { status: 500 }
    );
  }
}

