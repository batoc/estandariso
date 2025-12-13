# Módulo Escáner de Cédulas Colombianas (PDF417)

## 🎯 Descripción

Módulo experimental **completamente independiente** del sistema de gestión de calidad ISO 9001:2015. Permite escanear y capturar códigos de barras PDF417 desde cédulas colombianas en tiempo real usando la cámara del dispositivo.

## ✨ Características

- ✅ Escaneo en vivo con acceso a cámara del navegador
- ✅ Detección de códigos PDF417
- ✅ Almacenamiento en Supabase (tabla independiente `cedulas_demo`)
- ✅ Tabla de últimos 5 registros
- ✅ Copiar datos al portapapeles
- ✅ Interfaz responsiva (móvil y escritorio)

## 📋 Requisitos Implementados

### 1. Stack Técnico
```
- Next.js 14 (App Router)
- Supabase (cliente configurado)
- Tailwind CSS
- @zxing/browser + @zxing/library
```

### 2. Base de Datos
Tabla `cedulas_demo` creada con:
- `id` (BIGINT, PK, auto-generado)
- `created_at` (TIMESTAMPTZ, default NOW())
- `data_cruda` (TEXT, required)
- `cedula_parseada` (TEXT, opcional)
- `estado` (TEXT, default 'sin_procesar')

### 3. Funcionalidades

#### 🎥 Página de Escaneo (`/escaner/page.tsx`)
- Botón "Activar Cámara" → solicita permisos y abre video en vivo
- Video en vivo con aspecto 4:3
- Lector PDF417 configurado con `timeBetweenScans: 100ms` para detección rápida
- Detección automática de códigos
- Detención automática del video al detectar código

#### 💾 Almacenamiento
- Cuando se detecta un código:
  1. Video se detiene
  2. Texto crudo se muestra en textarea
  3. Botón "Guardar en BD" se habilita
  4. Datos se guardan sin parseo complejo (como solicitado)

#### 📊 Lista de Registros
- Tabla con últimos 5 registros
- Columnas: Fecha, Datos Crudos (primeros 50 caracteres), Estado, Acciones
- Botón para eliminar registros
- Estado: sin_procesar, procesada, error

## 🚀 Cómo Usar

### Instalación
Las librerías ya están instaladas:
```bash
npm install @zxing/browser @zxing/library
```

### Crear la Tabla en Supabase
1. Abre tu proyecto Supabase
2. Ve a SQL Editor
3. Copia el contenido de `cedulas_demo.sql`
4. Ejecuta el SQL

### Acceder al Módulo
1. Desde el dashboard, ve a "Módulos Experimentales"
2. Haz clic en "Escáner de Cédulas"
3. Permite acceso a la cámara
4. Apunta el código PDF417 hacia la cámara
5. Espera a que se detecte (puede tomar 1-3 segundos)
6. Verás el texto crudo en el textarea
7. Haz clic en "Guardar en BD"

## 🔧 Configuración del Escáner

El lector PDF417 está configurado para:
- **timeBetweenScans**: 100ms (intenta cada 100ms)
- **Video**: Cámara trasera (environment)
- **Formato**: PDF417 (formato difícil, requiere buena iluminación)

## 📌 Notas Importantes

- ✅ **Completamente independiente**: No interfiere con módulos ISO 9001
- ✅ **Datos crudos**: Se capturan y guardan sin parseo automático
- ✅ **Sin validación compleja**: Solo lectura y almacenamiento
- ⚠️ **Requiere HTTPS o localhost**: Los navegadores modernos solo permiten acceso a cámara en conexiones seguras
- ⚠️ **Buena iluminación**: PDF417 es difícil, necesita código limpio y bien iluminado

## 📝 Próximas Mejoras (Opcionales)

- [ ] Lógica de parseo de cédulas colombianas
- [ ] Validación de formato
- [ ] Extracción de campos (nombre, número, etc.)
- [ ] OCR para datos adicionales
- [ ] Caché offline

## 🗂️ Estructura de Archivos

```
app/
├── escaner/
│   ├── page.tsx        # Página principal del escáner
│   └── layout.tsx      # Layout independiente
├── dashboard/
│   └── page.tsx        # Actualizado con link al escáner
│
cedulas_demo.sql       # Script para crear tabla
```

## 🔐 Seguridad

- RLS habilitado en tabla `cedulas_demo`
- Política temporal permitiendo acceso total (cambiar en producción)
- No se almacenan datos sensibles en localStorage
- Datos se envían directamente a Supabase

## 📞 Soporte

Para dudas sobre el módulo:
- Verifica que tengas permisos de cámara
- Asegúrate de que el código sea un PDF417 válido
- Revisa la consola del navegador para errores
- Confirma que Supabase esté accesible

---

**Módulo Experimental v1.0** - Diciembre 2024
