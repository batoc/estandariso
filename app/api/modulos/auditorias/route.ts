import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('auditorias')
      .select('*')
      .order('fecha_auditoria', { ascending: false })
      .limit(5);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo auditorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener auditorías' },
      { status: 500 }
    );
  }
}
