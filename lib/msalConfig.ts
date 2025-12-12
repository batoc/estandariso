import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

export const SCOPES = [
  'https://graph.microsoft.com/Files.ReadWrite.All',
  'https://graph.microsoft.com/User.Read',
  'offline_access',
];

export async function getAuthUrl(): Promise<string> {
  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!,
  };

  return msalClient.getAuthCodeUrl(authCodeUrlParameters);
}

export async function getTokenFromCode(code: string): Promise<string> {
  const tokenRequest = {
    code,
    scopes: SCOPES,
    redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI!,
  };

  const response = await msalClient.acquireTokenByCode(tokenRequest);
  
  if (!response?.accessToken) {
    throw new Error('No se pudo obtener el token de acceso');
  }

  return response.accessToken;
}
