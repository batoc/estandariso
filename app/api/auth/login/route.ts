import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/msalConfig';

/**
 * API Route: Inicia el flujo de autenticación OAuth con Microsoft
 * GET /api/auth/login
 */
export async function GET() {
  try {
    const authUrl = await getAuthUrl();
    
    return NextResponse.json({ 
      authUrl,
      message: 'Redirige al usuario a esta URL para autenticarse' 
    });
  } catch (error) {
    console.error('Error al generar URL de autenticación:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación' },
      { status: 500 }
    );
  }
}
