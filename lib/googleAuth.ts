import { google } from 'googleapis';

/**
 * Configuración del cliente OAuth2 de Google
 */
export function getGoogleOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  return oauth2Client;
}

/**
 * Genera URL de autenticación de Google
 */
export function getGoogleAuthUrl(): string {
  const oauth2Client = getGoogleOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return url;
}

/**
 * Obtiene tokens de acceso desde el código de autorización
 */
export async function getGoogleTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  const oauth2Client = getGoogleOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token || undefined,
  };
}

/**
 * Configura el cliente de Google Drive con el token de acceso
 */
export function getDriveClient(accessToken: string) {
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}
