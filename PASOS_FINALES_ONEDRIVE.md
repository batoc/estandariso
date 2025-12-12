# ✅ INTEGRACIÓN ONEDRIVE - PASOS FINALES

## 🎯 Estado Actual
Código completamente implementado. Solo falta configurar credenciales.

---

## 🔐 PASO 1: Configurar Aplicación en Azure (5 minutos)

### A. Registrar la Aplicación

1. Ve a: https://portal.azure.com/
2. Busca **"Microsoft Entra ID"** (barra superior)
3. Menú izquierdo → **"App registrations"**
4. Click **"+ New registration"**
5. Completa el formulario:

```
Name: ISO9001-Sistema-Revisiones
Supported account types: Accounts in this organizational directory only (Single tenant)
Redirect URI: 
  - Tipo: Web
  - URL: http://localhost:3000/api/auth/callback/microsoft
```

6. Click **"Register"**

### B. Copiar Credenciales

Una vez registrada, verás la página **"Overview"**:

**COPIA ESTOS VALORES:**
```
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID:   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### C. Crear Client Secret

1. Menú izquierdo → **"Certificates & secrets"**
2. Tab **"Client secrets"**
3. Click **"+ New client secret"**
4. Descripción: `ISO9001-Secret`
5. Expires: **24 months**
6. Click **"Add"**

**⚠️ IMPORTANTE: COPIA EL "VALUE" AHORA (solo se muestra una vez)**
```
Value: xxxx~xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### D. Configurar Permisos API

1. Menú izquierdo → **"API permissions"**
2. Click **"+ Add a permission"**
3. Selecciona **"Microsoft Graph"**
4. Selecciona **"Delegated permissions"**
5. Busca y marca estos 3 permisos:
   - ✅ `Files.ReadWrite.All`
   - ✅ `offline_access`
   - ✅ `User.Read`
6. Click **"Add permissions"**
7. **CRUCIAL:** Click el botón **"Grant admin consent for [tu organización]"**
8. Confirma haciendo click en **"Yes"**

---

## 📝 PASO 2: Configurar Variables de Entorno

### A. Crear archivo `.env.local`

En la raíz del proyecto (`/home/batoc/Desktop/estandariso/`):

```bash
# Microsoft OneDrive
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=TU_CLIENT_ID_AQUI
MICROSOFT_CLIENT_SECRET=TU_SECRET_VALUE_AQUI
MICROSOFT_TENANT_ID=TU_TENANT_ID_AQUI
NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft
ONEDRIVE_ROOT_FOLDER=Revisiones_ISO9001

# Supabase (ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### B. Reemplazar valores

Reemplaza:
- `TU_CLIENT_ID_AQUI` → Application (client) ID
- `TU_SECRET_VALUE_AQUI` → Client secret VALUE
- `TU_TENANT_ID_AQUI` → Directory (tenant) ID

---

## 🚀 PASO 3: Iniciar el Sistema

### Reiniciar el servidor de desarrollo:

```bash
cd /home/batoc/Desktop/estandariso
npm run dev
```

---

## 🧪 PASO 4: Probar la Integración

### 1. Ve a Nueva Revisión
```
http://localhost:3000/nueva-revision
```

### 2. Conectar con OneDrive
- Click en botón **"Conectar OneDrive"**
- Se abrirá ventana de Microsoft
- Inicia sesión con tu cuenta empresarial
- Acepta los permisos
- Serás redirigido de vuelta a la aplicación
- Verás: ✅ **"Conectado a OneDrive"** con tu nombre

### 3. Probar Carga de Archivos
- Arrastra un PDF de prueba a la zona de carga
- Debe subirse a OneDrive
- Verás el archivo listado con link "Ver en OneDrive"

### 4. Crear una Revisión
- Llena el formulario básico (Título, Fecha, Responsable, Conclusiones, Objetivos)
- Click **"Guardar Revisión"**
- El sistema:
  1. ✅ Guarda datos en Supabase
  2. ✅ Crea estructura de carpetas en OneDrive
  3. ✅ Vincula los archivos a la revisión
  4. ✅ Redirige al Dashboard

---

## 📁 Estructura de Carpetas en OneDrive

Automáticamente se creará:

```
📁 Revisiones_ISO9001/
  └── 📁 2025/
      └── 📁 Revision_Diciembre_2025_abc12345/
          ├── 📁 Evidencias/      ← Archivos que subiste
          ├── 📁 PDFs/            ← Aquí irán los PDFs generados
          └── 📁 Firmas/          ← Para actas firmadas
```

---

## 🔍 Verificar en OneDrive

1. Abre OneDrive en el navegador
2. Ve a **"Mi Contenido"** o **"My files"**
3. Busca la carpeta **"Revisiones_ISO9001"**
4. Deberías ver la estructura de carpetas creada

---

## ⚠️ Solución de Problemas

### Error: "Invalid client secret"
- Verifica que copiaste el **VALUE** del secret (no el ID)
- El secret NO debe tener espacios al inicio/final

### Error: "Redirect URI mismatch"
- En Azure Portal, verifica que la Redirect URI sea exactamente:
  `http://localhost:3000/api/auth/callback/microsoft`
- NO debe tener `/` al final

### Error: "Admin consent required"
- Ve a Azure Portal → API permissions
- Click "Grant admin consent"
- Si no tienes permisos de admin, pide al admin de IT que lo haga

### No se crea la carpeta en OneDrive
- Abre la consola del navegador (F12)
- Revisa errores en la pestaña "Console" o "Network"
- Verifica que el token de acceso sea válido

---

## 🎉 Siguiente Fase: Generador de PDF

Una vez que OneDrive funcione, implementaremos:

1. ✅ Generación automática de PDF con formato oficial
2. ✅ Subida automática del PDF a la carpeta de OneDrive
3. ✅ Botón "Descargar PDF" en página de detalles
4. ✅ Template personalizado con logo/membrete

---

## 📊 Actualización Necesaria en Supabase

Para que funcione completo, agrega estos campos a tu tabla `revisiones`:

```sql
ALTER TABLE revisiones
ADD COLUMN IF NOT EXISTS participantes TEXT,
ADD COLUMN IF NOT EXISTS resultados_auditorias TEXT,
ADD COLUMN IF NOT EXISTS retroalimentacion_cliente TEXT,
ADD COLUMN IF NOT EXISTS desempeno_procesos TEXT,
ADD COLUMN IF NOT EXISTS estado_acciones_previas TEXT,
ADD COLUMN IF NOT EXISTS cambios_externos TEXT,
ADD COLUMN IF NOT EXISTS desempeno_proveedores TEXT,
ADD COLUMN IF NOT EXISTS adecuacion_recursos TEXT,
ADD COLUMN IF NOT EXISTS eficacia_acciones_riesgos TEXT,
ADD COLUMN IF NOT EXISTS oportunidades_mejora TEXT,
ADD COLUMN IF NOT EXISTS mejora_sgc TEXT,
ADD COLUMN IF NOT EXISTS mejora_productos TEXT,
ADD COLUMN IF NOT EXISTS necesidades_recursos TEXT,
ADD COLUMN IF NOT EXISTS acciones_seguimiento TEXT,
ADD COLUMN IF NOT EXISTS archivos_adjuntos TEXT,
ADD COLUMN IF NOT EXISTS carpeta_drive TEXT;
```

O puedes ejecutarlo desde el panel de Supabase:
1. Ve a **SQL Editor**
2. Pega el código anterior
3. Click **"Run"**

---

## 🎯 ¿Listo?

**Ejecuta estos comandos para verificar:**

```bash
# Ver variables de entorno configuradas
cat .env.local | grep MICROSOFT

# Reiniciar servidor
npm run dev
```

**Luego ve a:** http://localhost:3000/nueva-revision

**Si ves el botón "Conectar OneDrive", estás listo para probar! 🚀**
