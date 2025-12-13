-- CORRECCIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
-- Ejecuta todo este código en el Editor SQL de Supabase para solucionar el error "new row violates row-level security policy"

-- 1. Eventos
ALTER TABLE social_eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public events" ON social_eventos;
DROP POLICY IF EXISTS "Public events insert" ON social_eventos;
DROP POLICY IF EXISTS "Public events select" ON social_eventos;
DROP POLICY IF EXISTS "Public events update" ON social_eventos;
DROP POLICY IF EXISTS "Public events delete" ON social_eventos;

CREATE POLICY "Public events insert" ON social_eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public events select" ON social_eventos FOR SELECT USING (true);
CREATE POLICY "Public events update" ON social_eventos FOR UPDATE USING (true);
CREATE POLICY "Public events delete" ON social_eventos FOR DELETE USING (true);

-- 2. Líderes
ALTER TABLE social_lideres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public leaders" ON social_lideres;
DROP POLICY IF EXISTS "Public leaders insert" ON social_lideres;
DROP POLICY IF EXISTS "Public leaders select" ON social_lideres;
DROP POLICY IF EXISTS "Public leaders update" ON social_lideres;
DROP POLICY IF EXISTS "Public leaders delete" ON social_lideres;

CREATE POLICY "Public leaders insert" ON social_lideres FOR INSERT WITH CHECK (true);
CREATE POLICY "Public leaders select" ON social_lideres FOR SELECT USING (true);
CREATE POLICY "Public leaders update" ON social_lideres FOR UPDATE USING (true);
CREATE POLICY "Public leaders delete" ON social_lideres FOR DELETE USING (true);

-- 3. Boletas
ALTER TABLE social_boletas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public tickets" ON social_boletas;
DROP POLICY IF EXISTS "Public tickets insert" ON social_boletas;
DROP POLICY IF EXISTS "Public tickets select" ON social_boletas;
DROP POLICY IF EXISTS "Public tickets update" ON social_boletas;
DROP POLICY IF EXISTS "Public tickets delete" ON social_boletas;

CREATE POLICY "Public tickets insert" ON social_boletas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public tickets select" ON social_boletas FOR SELECT USING (true);
CREATE POLICY "Public tickets update" ON social_boletas FOR UPDATE USING (true);
CREATE POLICY "Public tickets delete" ON social_boletas FOR DELETE USING (true);
