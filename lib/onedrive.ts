import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

/**
 * Configuración del cliente de Microsoft Graph
 */
export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Crea la estructura de carpetas para una revisión
 * Estructura: Revisiones_ISO9001/YYYY/Revision_MMMMM_YYYY/
 */
export async function crearCarpetaRevision(
  accessToken: string,
  revisionId: string,
  fechaRevision: string
): Promise<{ carpetaUrl: string; carpetaId: string }> {
  const client = getGraphClient(accessToken);
  const fecha = new Date(fechaRevision);
  const año = fecha.getFullYear();
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  
  const rootFolder = process.env.ONEDRIVE_ROOT_FOLDER || 'Revisiones_ISO9001';
  const carpetaAño = `${rootFolder}/${año}`;
  const carpetaRevision = `${carpetaAño}/Revision_${mesCapitalizado}_${año}_${revisionId.substring(0, 8)}`;

  try {
    // 1. Crear carpeta raíz si no existe
    await crearCarpetaSiNoExiste(client, rootFolder);

    // 2. Crear carpeta del año
    await crearCarpetaSiNoExiste(client, carpetaAño);

    // 3. Crear carpeta de la revisión
    const carpetaFinal = await crearCarpetaSiNoExiste(client, carpetaRevision);

    // 4. Crear subcarpetas
    await crearCarpetaSiNoExiste(client, `${carpetaRevision}/Evidencias`);
    await crearCarpetaSiNoExiste(client, `${carpetaRevision}/PDFs`);
    await crearCarpetaSiNoExiste(client, `${carpetaRevision}/Firmas`);

    // 5. Obtener link compartible
    const sharingLink = await client
      .api(`/me/drive/items/${carpetaFinal.id}/createLink`)
      .post({
        type: 'view',
        scope: 'organization',
      });

    return {
      carpetaUrl: sharingLink.link.webUrl,
      carpetaId: carpetaFinal.id,
    };
  } catch (error) {
    console.error('Error al crear estructura de carpetas:', error);
    throw new Error('No se pudo crear la carpeta en OneDrive');
  }
}

/**
 * Tipo para respuesta de carpeta de OneDrive
 */
interface OneDriveFolder {
  id: string;
  name: string;
  webUrl: string;
}

/**
 * Crea una carpeta si no existe (helper)
 */
async function crearCarpetaSiNoExiste(client: Client, rutaCarpeta: string): Promise<OneDriveFolder> {
  try {
    // Intentar obtener la carpeta
    const folder = await client.api(`/me/drive/root:/${rutaCarpeta}`).get();
    return folder as OneDriveFolder;
  } catch (error: unknown) {
    const graphError = error as { statusCode?: number };
    if (graphError.statusCode === 404) {
      // La carpeta no existe, crearla
      const pathParts = rutaCarpeta.split('/');
      const folderName = pathParts.pop();
      const parentPath = pathParts.join('/') || '';

      const parentApi = parentPath
        ? `/me/drive/root:/${parentPath}:/children`
        : '/me/drive/root/children';

      const newFolder = await client.api(parentApi).post({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      });

      return newFolder;
    }
    throw error;
  }
}

/**
 * Sube un archivo a OneDrive
 */
export async function subirArchivoAOneDrive(
  accessToken: string,
  archivo: File,
  revisionId: string,
  subcarpeta: 'Evidencias' | 'PDFs' | 'Firmas' = 'Evidencias'
): Promise<{ url: string; nombre: string; tamaño: number }> {
  const client = getGraphClient(accessToken);
  
  try {
    // Leer el archivo como ArrayBuffer
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Construir la ruta
    const rootFolder = process.env.ONEDRIVE_ROOT_FOLDER || 'Revisiones_ISO9001';
    const fileName = sanitizeFileName(archivo.name);
    
    // Buscar la carpeta de la revisión (simplificado - en producción buscar por metadata)
    const uploadPath = `/me/drive/root:/${rootFolder}/**/${subcarpeta}/${fileName}:/content`;

    // Subir archivo
    const uploadedFile = await client.api(uploadPath).put(buffer);

    // Crear link compartible
    const sharingLink = await client
      .api(`/me/drive/items/${uploadedFile.id}/createLink`)
      .post({
        type: 'view',
        scope: 'organization',
      });

    return {
      url: sharingLink.link.webUrl,
      nombre: fileName,
      tamaño: archivo.size,
    };
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw new Error(`No se pudo subir el archivo: ${archivo.name}`);
  }
}

/**
 * Sube un Buffer (para PDFs generados)
 */
export async function subirBufferAOneDrive(
  accessToken: string,
  buffer: Buffer,
  nombreArchivo: string,
  carpetaId: string
): Promise<string> {
  const client = getGraphClient(accessToken);

  try {
    const fileName = sanitizeFileName(nombreArchivo);
    const uploadPath = `/me/drive/items/${carpetaId}:/PDFs/${fileName}:/content`;

    const uploadedFile = await client.api(uploadPath).put(buffer);

    // Crear link compartible
    const sharingLink = await client
      .api(`/me/drive/items/${uploadedFile.id}/createLink`)
      .post({
        type: 'view',
        scope: 'organization',
      });

    return sharingLink.link.webUrl;
  } catch (error) {
    console.error('Error al subir PDF:', error);
    throw new Error('No se pudo subir el PDF a OneDrive');
  }
}

/**
 * Obtiene información del usuario (para verificar conexión)
 */
export async function obtenerInfoUsuario(accessToken: string): Promise<{
  nombre: string;
  email: string;
}> {
  const client = getGraphClient(accessToken);

  try {
    const user = await client.api('/me').get();
    return {
      nombre: user.displayName,
      email: user.userPrincipalName || user.mail,
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
    .replace(/[<>:"/\\|?*]/g, '_') // Caracteres no permitidos
    .replace(/\s+/g, '_') // Espacios
    .substring(0, 255); // Longitud máxima
}
