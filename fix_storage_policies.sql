-- SOLUCIÓN ERROR DE IMÁGENES (STORAGE)
-- Ejecuta este script en el SQL Editor de Supabase para permitir la subida de fotos

-- 1. Asegurar que el bucket 'gestion-social' existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('gestion-social', 'gestion-social', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Public Access Select gestion-social" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Insert gestion-social" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Update gestion-social" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Delete gestion-social" ON storage.objects;

-- 3. Crear nuevas políticas permisivas para este bucket específico
-- Permitir a cualquiera VER archivos en este bucket
CREATE POLICY "Public Access Select gestion-social"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gestion-social' );

-- Permitir a cualquiera SUBIR archivos a este bucket
CREATE POLICY "Public Access Insert gestion-social"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'gestion-social' );

-- Permitir a cualquiera ACTUALIZAR archivos en este bucket
CREATE POLICY "Public Access Update gestion-social"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'gestion-social' );

-- Permitir a cualquiera BORRAR archivos en este bucket
CREATE POLICY "Public Access Delete gestion-social"
ON storage.objects FOR DELETE
USING ( bucket_id = 'gestion-social' );
