import { NextRequest, NextResponse } from 'next/server';
import { subirArchivoADrive } from '@/lib/googledrive';

/**
 * API Route: Sube archivos a Google Drive
 * POST /api/googledrive/upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    const carpetaId = formData.get('carpetaId') as string;
    const subcarpeta = (formData.get('subcarpeta') as 'Evidencias' | 'PDFs' | 'Firmas') || 'Evidencias';

    // Validaciones
    if (!archivo || !accessToken || !carpetaId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const tiposPermitidos = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo: PDF, DOCX, XLSX, PNG, JPG' },
        { status: 400 }
      );
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (archivo.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo de 10MB' },
        { status: 400 }
      );
    }

    // Subir archivo
    const resultado = await subirArchivoADrive(
      accessToken,
      archivo,
      carpetaId,
      subcarpeta
    );

    return NextResponse.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error('Error al subir archivo a Google Drive:', error);
    return NextResponse.json(
      { 
        error: 'Error al subir archivo a Google Drive',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
