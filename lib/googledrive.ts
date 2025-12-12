import { google } from 'googleapis';
import { getDriveClient } from './googleAuth';
import { Readable } from 'stream';

/**
 * Crea la estructura de carpetas para una revisión en Google Drive
 * Estructura: Revisiones_ISO9001/YYYY/Revision_MMMMM_YYYY/
 */
export async function crearCarpetaRevisionDrive(
  accessToken: string,
  revisionId: string,
  fechaRevision: string
): Promise<{ carpetaUrl: string; carpetaId: string }> {
  const drive = getDriveClient(accessToken);
  const fecha = new Date(fechaRevision);
  const año = fecha.getFullYear();
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

  try {
    // 1. Crear/obtener carpeta raíz
    const rootFolderId = await crearObtenerCarpeta(drive, 'Revisiones_ISO9001', null);

    // 2. Crear/obtener carpeta del año
    const añoFolderId = await crearObtenerCarpeta(drive, String(año), rootFolderId);

    // 3. Crear carpeta de la revisión
    const nombreRevision = `Revision_${mesCapitalizado}_${año}_${revisionId.substring(0, 8)}`;
    const revisionFolderId = await crearObtenerCarpeta(drive, nombreRevision, añoFolderId);

    // 4. Crear subcarpetas
    await Promise.all([
      crearObtenerCarpeta(drive, 'Evidencias', revisionFolderId),
      crearObtenerCarpeta(drive, 'PDFs', revisionFolderId),
      crearObtenerCarpeta(drive, 'Firmas', revisionFolderId),
    ]);

    // 5. Obtener URL compartible
    const carpetaUrl = `https://drive.google.com/drive/folders/${revisionFolderId}`;

    return {
      carpetaUrl,
      carpetaId: revisionFolderId,
    };
  } catch (error) {
    console.error('Error al crear carpeta en Drive:', error);
    throw new Error('No se pudo crear la carpeta en Google Drive');
  }
}

/**
 * Crea o busca una carpeta en Google Drive
 */
async function crearObtenerCarpeta(
  drive: ReturnType<typeof getDriveClient>,
  nombreCarpeta: string,
  parentId: string | null
): Promise<string> {
  try {
    // Buscar si ya existe
    const query = parentId
      ? `name='${nombreCarpeta}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${nombreCarpeta}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    // Si existe, retornar su ID
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Si no existe, crearla
    const fileMetadata: {
      name: string;
      mimeType: string;
      parents?: string[];
    } = {
      name: nombreCarpeta,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return folder.data.id!;
  } catch (error) {
    console.error(`Error al crear/obtener carpeta ${nombreCarpeta}:`, error);
    throw error;
  }
}

/**
 * Sube un archivo a Google Drive
 */
export async function subirArchivoADrive(
  accessToken: string,
  archivo: File,
  carpetaId: string,
  subcarpeta: 'Evidencias' | 'PDFs' | 'Firmas' = 'Evidencias'
): Promise<{ url: string; nombre: string; tamaño: number }> {
  const drive = getDriveClient(accessToken);

  try {
    // Obtener ID de subcarpeta
    const subcarpetaId = await obtenerSubcarpetaId(drive, carpetaId, subcarpeta);

    // Leer archivo como buffer
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Metadata del archivo
    const fileMetadata = {
      name: sanitizeFileName(archivo.name),
      parents: [subcarpetaId],
    };

    // Subir archivo
    const media = {
      mimeType: archivo.type,
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size, webViewLink',
    });

    // Hacer el archivo compartible (lectura para cualquiera con el link)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      url: response.data.webViewLink!,
      nombre: response.data.name!,
      tamaño: parseInt(response.data.size || '0'),
    };
  } catch (error) {
    console.error('Error al subir archivo a Drive:', error);
    throw new Error(`No se pudo subir el archivo: ${archivo.name}`);
  }
}

/**
 * Obtiene el ID de una subcarpeta
 */
async function obtenerSubcarpetaId(
  drive: ReturnType<typeof getDriveClient>,
  parentId: string,
  nombreSubcarpeta: string
): Promise<string> {
  const query = `name='${nombreSubcarpeta}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const response = await drive.files.list({
    q: query,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Si no existe, crearla
  return await crearObtenerCarpeta(drive, nombreSubcarpeta, parentId);
}

/**
 * Sube un Buffer a Google Drive (para PDFs generados)
 */
export async function subirBufferADrive(
  accessToken: string,
  buffer: Buffer,
  nombreArchivo: string,
  carpetaId: string
): Promise<string> {
  const drive = getDriveClient(accessToken);

  try {
    const subcarpetaId = await obtenerSubcarpetaId(drive, carpetaId, 'PDFs');

    const fileMetadata = {
      name: sanitizeFileName(nombreArchivo),
      parents: [subcarpetaId],
    };

    const media = {
      mimeType: 'application/pdf',
      body: Readable.from(buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Hacer compartible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.webViewLink!;
  } catch (error) {
    console.error('Error al subir PDF a Drive:', error);
    throw new Error('No se pudo subir el PDF a Google Drive');
  }
}

/**
 * Obtiene información del usuario de Google
 */
export async function obtenerInfoUsuarioGoogle(accessToken: string): Promise<{
  nombre: string;
  email: string;
}> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

  try {
    const userInfo = await oauth2.userinfo.get();
    return {
      nombre: userInfo.data.name || 'Usuario',
      email: userInfo.data.email || '',
    };
  } catch (error) {
    console.error('Error al obtener info del usuario:', error);
    throw new Error('No se pudo obtener información del usuario');
  }
}

/**
 * Sanitiza nombres de archivo
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}
