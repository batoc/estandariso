# Módulo Escáner de Cédulas Colombianas (PDF417)

## 🎯 Descripción

Módulo experimental **completamente independiente** del sistema de gestión de calidad ISO 9001:2015. Permite escanear y capturar códigos de barras PDF417 desde cédulas colombianas en tiempo real usando la cámara del dispositivo.

## ✨ Características

- ✅ Escaneo en vivo con acceso a cámara del navegador
- ✅ Detección optimizada de códigos PDF417 (Modo "Try Harder")
- ✅ Guía visual (overlay) para ayudar al posicionamiento
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
- Video en vivo con aspecto 4:3 y guía visual
- Lector PDF417 configurado con `BrowserMultiFormatReader` y hints `TRY_HARDER`
- Detección automática de códigos usando `decodeFromVideoDevice`
- Feedback visual y vibración al detectar

#### 💾 Almacenamiento
- Cuando se detecta un código:
  1. Video se detiene
  2. Texto crudo se muestra en textarea
  3. Botón "Guardar en BD" se habilita
  4. Datos se guardan sin parseo complejo (como solicitado)

#### 📊 Lista de Registros
- Muestra los últimos 5 escaneos
- Permite eliminar registros
- Botón de refresco manual

## 🚀 Cómo Probar

1. Navegar a `/escaner` desde el Dashboard.
2. Dar permisos de cámara.
3. Apuntar la cámara al código de barras trasero de la cédula.
   - **Tip:** Asegurar buena iluminación y que el código esté dentro del recuadro rojo.
   - **Tip:** Mover lentamente la cámara para permitir el enfoque.
4. Al detectar, el código aparecerá en el área de texto.
5. Clic en "Guardar" para enviar a Supabase.

## ⚠️ Notas Técnicas
- El escaneo de PDF417 en navegadores móviles depende mucho de la calidad de la cámara y el enfoque automático.
- Se recomienda usar dispositivos con cámaras de alta resolución (1080p+).
- El modo `TRY_HARDER` consume más CPU pero mejora la tasa de éxito.
