# 📁 Guía de Integración con OneDrive/Google Drive

## Estrategia Recomendada

Para tu sistema ISO 9001, te recomiendo **OneDrive for Business** por estas razones:
- ✅ Mejor integración con entornos corporativos
- ✅ API más estable y documentada
- ✅ Estructura de carpetas más flexible
- ✅ Mejor control de permisos por organización

---

## 🔧 Opción 1: OneDrive (Recomendado)

### Paso 1: Registrar aplicación en Microsoft Azure

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca **"Azure Active Directory"** → **"App registrations"**
3. Click en **"New registration"**
4. Configura:
   - **Name**: `ISO9001-Sistema-Revisiones`
   - **Supported account types**: "Single tenant" (solo tu organización)
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/onedrive`

5. Guarda el **Application (client) ID**

### Paso 2: Configurar permisos API

En tu aplicación registrada:
1. Ve a **"API permissions"**
2. Click **"Add a permission"** → **"Microsoft Graph"**
3. Selecciona **"Delegated permissions"**:
   - `Files.ReadWrite.All`
   - `offline_access`
   - `User.Read`
4. Click **"Grant admin consent"**

### Paso 3: Crear Client Secret

1. Ve a **"Certificates & secrets"**
2. Click **"New client secret"**
3. Descripción: `ISO9001-Secret`
4. Expira: 24 meses
5. **Copia el valor del secret** (solo se muestra una vez)

### Paso 4: Variables de Entorno

Crea un archivo `.env.local`:

```env
# Microsoft OneDrive
NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=tu_client_id_aqui
ONEDRIVE_CLIENT_SECRET=tu_secret_aqui
ONEDRIVE_REDIRECT_URI=http://localhost:3000/api/auth/callback/onedrive
ONEDRIVE_TENANT_ID=common

# Carpeta raíz para archivos ISO
ONEDRIVE_ROOT_FOLDER=Revisiones_ISO9001
```

### Paso 5: Instalar dependencias

```bash
npm install @microsoft/microsoft-graph-client @azure/msal-node
```

### Paso 6: Crear servicio de OneDrive

**Archivo:** `lib/onedrive.ts`

```typescript
import { Client } from '@microsoft/microsoft-graph-client';

export async function uploadFileToOneDrive(
  accessToken: string,
  fileName: string,
  fileContent: Buffer,
  revisionId: string
): Promise<string> {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  // Crear carpeta específica para la revisión
  const folderPath = `Revisiones_ISO9001/${revisionId}`;
  
  try {
    // Crear carpeta si no existe
    await client
      .api(`/me/drive/root:/${folderPath}`)
      .put({ folder: {} });
  } catch (error) {
    // Carpeta ya existe, continuar
  }

  // Subir archivo
  const uploadPath = `/me/drive/root:/${folderPath}/${fileName}:/content`;
  const uploadedFile = await client.api(uploadPath).put(fileContent);

  // Retornar URL compartible
  const sharingLink = await client
    .api(`/me/drive/items/${uploadedFile.id}/createLink`)
    .post({
      type: 'view',
      scope: 'organization',
    });

  return sharingLink.link.webUrl;
}
```

---

## 🔧 Opción 2: Google Drive

### Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea nuevo proyecto: `ISO9001-Revisiones`
3. Habilita **Google Drive API**
4. Configura pantalla de consentimiento OAuth

### Paso 2: Crear credenciales OAuth

1. Ve a **"Credentials"** → **"Create credentials"** → **"OAuth 2.0 Client ID"**
2. Tipo: **Web application**
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
4. Descarga el JSON de credenciales

### Paso 3: Variables de Entorno

```env
# Google Drive
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Carpeta raíz
GOOGLE_DRIVE_FOLDER_ID=id_de_tu_carpeta_raiz
```

### Paso 4: Instalar dependencias

```bash
npm install googleapis
```

---

## 📋 Estructura de Carpetas Recomendada

```
Revisiones_ISO9001/
├── 2025/
│   ├── Revision_Enero_2025/
│   │   ├── acta_revision.pdf
│   │   ├── evidencias/
│   │   │   ├── auditoria_interna.pdf
│   │   │   ├── encuestas_satisfaccion.xlsx
│   │   │   └── indicadores_calidad.pdf
│   │   └── firmas/
│   │       └── acta_firmada.pdf
│   └── Revision_Junio_2025/
└── 2024/
    └── Revision_Diciembre_2024/
```

---

## 🎯 Flujo de Trabajo Propuesto

### 1. Al crear una revisión:
```typescript
// Crear carpeta en OneDrive/Drive
const carpetaUrl = await crearCarpetaRevision(revisionId, fecha);

// Guardar URL en Supabase
await supabase
  .from('revisiones')
  .update({ carpeta_drive: carpetaUrl })
  .eq('id', revisionId);
```

### 2. Al subir archivos adjuntos:
```typescript
// Subir archivo
const archivoUrl = await subirArchivo(file, revisionId);

// Actualizar array de archivos en Supabase
const archivosActuales = JSON.parse(revision.archivos_adjuntos || '[]');
archivosActuales.push({
  nombre: file.name,
  url: archivoUrl,
  fecha_subida: new Date().toISOString(),
});

await supabase
  .from('revisiones')
  .update({ 
    archivos_adjuntos: JSON.stringify(archivosActuales) 
  })
  .eq('id', revisionId);
```

### 3. Al generar PDF:
```typescript
// Generar PDF
const pdfBuffer = await generarPDFRevision(revisionData);

// Subir a Drive
const pdfUrl = await subirArchivo(pdfBuffer, revisionId, 'acta_revision.pdf');

// Actualizar Supabase
await supabase
  .from('revisiones')
  .update({ pdf_url: pdfUrl })
  .eq('id', revisionId);
```

---

## 🔐 Consideraciones de Seguridad

1. **NUNCA** expongas las credenciales en el frontend
2. Toda comunicación con OneDrive/Drive debe ser desde **API Routes** de Next.js
3. Implementa autenticación de usuarios antes de producción
4. Usa **Server Actions** de Next.js 14 para subir archivos
5. Valida tipos de archivo permitidos (PDF, DOCX, XLSX, PNG, JPG)
6. Limita tamaño máximo de archivos (ej: 10MB)

---

## 📝 Siguiente Paso

**¿Quieres que implemente la integración completa con OneDrive o prefieres Google Drive?**

Una vez elijas, crearé:
1. ✅ API Routes para autenticación
2. ✅ Componente de carga de archivos
3. ✅ Servicio de gestión de carpetas
4. ✅ Actualización del formulario con zona de "drag & drop"

**Dime cuál prefieres y seguimos 🚀**
