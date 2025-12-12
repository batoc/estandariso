import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('quejas_reclamos')
      .select('*')
      .order('fecha_recepcion', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo quejas:', error);
    return NextResponse.json(
      { error: 'Error al obtener quejas y reclamos' },
      { status: 500 }
    );
  }
}
