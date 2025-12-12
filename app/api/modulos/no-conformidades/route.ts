import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('no_conformidades')
      .select('*')
      .order('fecha_deteccion', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo no conformidades:', error);
    return NextResponse.json(
      { error: 'Error al obtener no conformidades' },
      { status: 500 }
    );
  }
}
