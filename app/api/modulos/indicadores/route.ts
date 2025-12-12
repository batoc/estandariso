import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('indicadores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo indicadores:', error);
    return NextResponse.json(
      { error: 'Error al obtener indicadores' },
      { status: 500 }
    );
  }
}
