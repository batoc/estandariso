# ✅ GOOGLE DRIVE - LISTO PARA PROBAR

## 📦 TODO EL CÓDIGO YA ESTÁ IMPLEMENTADO

### Archivos creados:
```
lib/
├── googleAuth.ts           ← Autenticación OAuth Google
└── googledrive.ts          ← Servicios completos de Drive

app/api/
├── auth/google/
│   ├── login/route.ts      ← Inicia OAuth
│   └── callback/route.ts   ← Callback OAuth
└── googledrive/
    ├── create-folder/route.ts  ← Crea carpetas
    └── upload/route.ts         ← Sube archivos

components/
├── GoogleDriveAuth.tsx     ← Botón de conexión
└── GoogleDriveUpload.tsx   ← Drag & drop

app/nueva-revision/page.tsx  ← ACTUALIZADO para usar Google Drive
```

---

## 🎯 LO QUE FALTA: Solo configurar en Google Cloud

### Pasos (10 minutos):

1. **Ir a Google Cloud Console**: https://console.cloud.google.com/

2. **Crear proyecto** → `ISO9001-Revisiones`

3. **Habilitar Google Drive API**

4. **Configurar OAuth consent screen** (Externo)
   - Agregar tu email como usuario de prueba

5. **Crear credenciales OAuth 2.0**
   - Tipo: Aplicación web
   - Redirect URI: `http://localhost:3000/api/auth/callback/google`

6. **Copiar credenciales**:
   - Client ID: `123456-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123xyz`

---

## 📝 CUANDO TENGAS LAS CREDENCIALES

**Pégalas aquí y yo actualizo el .env.local**

O manualmente:
```bash
nano .env.local
```

Reemplaza:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_SECRET_AQUI
```

---

## 🚀 LUEGO PRUEBA

```bash
npm run dev
```

Abre: http://localhost:3000/nueva-revision

Click en **"Conectar Google Drive"** → Inicia sesión → Listo!

---

## 📁 ESTRUCTURA QUE SE CREARÁ EN TU DRIVE

```
Mi unidad/
└── Revisiones_ISO9001/
    └── 2025/
        └── Revision_Diciembre_2025_abc123/
            ├── Evidencias/   ← Archivos que subas
            ├── PDFs/         ← PDFs generados
            └── Firmas/       ← Actas firmadas
```

---

## ✨ VENTAJAS DE GOOGLE DRIVE

✅ No requiere permisos de administrador
✅ Configuración más rápida (10 min vs 30 min)
✅ Gratis 15GB de almacenamiento
✅ Acceso desde cualquier dispositivo
✅ Compartir fácil con la junta directiva

---

**Sigue la guía:** `SETUP_GOOGLE_DRIVE.md`

**¿Ya empezaste con Google Cloud Console?** Avísame cuando tengas las credenciales.
