import { NextRequest, NextResponse } from 'next/server';
import { crearCarpetaRevision } from '@/lib/onedrive';

/**
 * API Route: Crea la estructura de carpetas en OneDrive para una revisión
 * POST /api/onedrive/create-folder
 * Body: { accessToken, revisionId, fechaRevision }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, revisionId, fechaRevision } = body;

    // Validaciones
    if (!accessToken || !revisionId || !fechaRevision) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Crear estructura de carpetas
    const resultado = await crearCarpetaRevision(
      accessToken,
      revisionId,
      fechaRevision
    );

    return NextResponse.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear carpeta en OneDrive',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
