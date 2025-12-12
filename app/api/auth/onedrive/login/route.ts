import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI;

  if (!clientId || !tenantId || !redirectUri) {
    return NextResponse.json(
      { error: 'Configuración de Microsoft incompleta' },
      { status: 500 }
    );
  }

  // Scopes necesarios para OneDrive
  const scopes = [
    'Files.ReadWrite.All',
    'User.Read',
    'offline_access'
  ].join(' ');

  // URL de autorización de Microsoft
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&prompt=select_account`;

  // Redirigir a Microsoft para autenticación
  return NextResponse.redirect(authUrl);
}
