import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '@/lib/msalConfig';
import { obtenerInfoUsuario } from '@/lib/onedrive';

/**
 * API Route: Callback de OAuth - Microsoft redirige aquí después de la autenticación
 * GET /api/auth/callback/microsoft?code=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Manejar errores de autenticación
  if (error) {
    console.error('Error de autenticación:', error);
    return NextResponse.redirect(
      new URL(`/?auth=error&message=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validar que llegó el código
  if (!code) {
    return NextResponse.redirect(
      new URL('/?auth=error&message=No se recibió código de autenticación', request.url)
    );
  }

  try {
    // Intercambiar código por token de acceso
    const accessToken = await getTokenFromCode(code);

    // Obtener info del usuario para verificar
    const userInfo = await obtenerInfoUsuario(accessToken);

    // En producción, guardarías el token en una sesión segura o base de datos
    // Por ahora, lo guardamos en localStorage vía redirect
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('token', accessToken); // TEMPORAL - En producción usar cookies httpOnly
    redirectUrl.searchParams.set('user', userInfo.nombre);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error al procesar callback:', error);
    return NextResponse.redirect(
      new URL('/?auth=error&message=Error al procesar autenticación', request.url)
    );
  }
}
