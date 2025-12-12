import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokensFromCode } from '@/lib/googleAuth';
import { obtenerInfoUsuarioGoogle } from '@/lib/googledrive';

/**
 * API Route: Callback de OAuth - Google redirige aquí después de la autenticación
 * GET /api/auth/callback/google?code=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Manejar errores de autenticación
  if (error) {
    console.error('Error de autenticación de Google:', error);
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
    // Intercambiar código por tokens de acceso
    const tokens = await getGoogleTokensFromCode(code);

    // Obtener info del usuario para verificar
    const userInfo = await obtenerInfoUsuarioGoogle(tokens.access_token);

    // Redirigir con los datos (TEMPORAL - en producción usar cookies httpOnly)
    const redirectUrl = new URL('/nueva-revision', request.url);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('token', tokens.access_token);
    redirectUrl.searchParams.set('user', userInfo.nombre);
    redirectUrl.searchParams.set('provider', 'google');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error al procesar callback de Google:', error);
    return NextResponse.redirect(
      new URL('/?auth=error&message=Error al procesar autenticación', request.url)
    );
  }
}
