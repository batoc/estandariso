import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('calificacion_actual', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}
