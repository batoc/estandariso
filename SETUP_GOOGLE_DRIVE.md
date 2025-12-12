# 🚀 CONFIGURACIÓN GOOGLE DRIVE - PASO A PASO

## ⏱️ Tiempo estimado: 10 minutos

---

## 📋 PASO 1: Crear Proyecto en Google Cloud Console (3 minutos)

### A. Acceder a Google Cloud Console
1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta personal de Google

### B. Crear Nuevo Proyecto
1. En la parte superior, haz click en el selector de proyectos
2. Click en **"NUEVO PROYECTO"**
3. Completa:
   ```
   Nombre del proyecto: ISO9001-Revisiones
   Ubicación: Sin organización (está bien)
   ```
4. Click **"CREAR"**
5. Espera 30 segundos a que se cree
6. Asegúrate de seleccionarlo (arriba debe decir "ISO9001-Revisiones")

---

## 🔑 PASO 2: Habilitar Google Drive API (2 minutos)

1. En el menú de hamburguesa (☰) arriba a la izquierda
2. Ve a: **"APIs y servicios"** → **"Biblioteca"**
3. En el buscador escribe: `Google Drive API`
4. Click en **"Google Drive API"**
5. Click en botón azul **"HABILITAR"**
6. Espera que se habilite (30 segundos)

---

## 🔐 PASO 3: Configurar Pantalla de Consentimiento OAuth (2 minutos)

1. En el menú izquierdo: **"Pantalla de consentimiento de OAuth"**
2. Selecciona: **"Externo"** (para uso personal)
3. Click **"CREAR"**

4. Completa el formulario:
   ```
   Nombre de la aplicación: Sistema ISO 9001
   Correo electrónico de asistencia: [tu email]
   Logo de la aplicación: (opcional, puedes omitir)
   Dominio de la aplicación: (dejar en blanco)
   Correo electrónico del desarrollador: [tu email]
   ```
5. Click **"GUARDAR Y CONTINUAR"**

6. En la sección **"Permisos"**:
   - Click **"AGREGAR O QUITAR PERMISOS"**
   - Busca: `Google Drive API`
   - Marca: **`../auth/drive.file`** (Administrar archivos que la app crea o abre)
   - Click **"ACTUALIZAR"**
   - Click **"GUARDAR Y CONTINUAR"**

7. En **"Usuarios de prueba"**:
   - Click **"+ AGREGAR USUARIOS"**
   - Agrega tu email personal
   - Click **"AGREGAR"**
   - Click **"GUARDAR Y CONTINUAR"**

8. Click **"VOLVER AL PANEL"**

---

## 🎟️ PASO 4: Crear Credenciales OAuth 2.0 (2 minutos)

1. En el menú izquierdo: **"Credenciales"**
2. Click **"+ CREAR CREDENCIALES"** (arriba)
3. Selecciona: **"ID de cliente de OAuth 2.0"**

4. Completa:
   ```
   Tipo de aplicación: Aplicación web
   Nombre: ISO9001-Web-Client
   
   URIs de redireccionamiento autorizados:
   - http://localhost:3000/api/auth/callback/google
   - http://localhost:3000
   ```

5. Click **"CREAR"**

6. **⚠️ APARECERÁ UNA VENTANA CON TUS CREDENCIALES:**
   ```
   ID de cliente: algo como 123456-abc.apps.googleusercontent.com
   Secreto del cliente: algo como GOCSPX-abc123xyz
   ```

7. **COPIA AMBOS VALORES** (déjalos en un notepad temporal)

8. También puedes descargar el JSON haciendo click en **"DESCARGAR JSON"**

---

## ✅ CUANDO TENGAS LAS CREDENCIALES

**Pégame aquí:**
1. El **Client ID** (termina en `.apps.googleusercontent.com`)
2. El **Client Secret** (empieza con `GOCSPX-`)

Y yo actualizo tu `.env.local` automáticamente.

---

## 🎯 URLs Importantes

- Google Cloud Console: https://console.cloud.google.com/
- APIs habilitadas: https://console.cloud.google.com/apis/dashboard
- Credenciales: https://console.cloud.google.com/apis/credentials

---

¿Ya creaste el proyecto? Avísame cuando tengas las credenciales y continuamos.
