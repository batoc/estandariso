import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/googleAuth';

/**
 * API Route: Inicia el flujo de autenticación OAuth con Google Drive
 * GET /api/auth/google/login
 */
export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl();
    
    return NextResponse.json({ 
      authUrl,
      message: 'Redirige al usuario a esta URL para autenticarse' 
    });
  } catch (error) {
    console.error('Error al generar URL de autenticación:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación con Google' },
      { status: 500 }
    );
  }
}
