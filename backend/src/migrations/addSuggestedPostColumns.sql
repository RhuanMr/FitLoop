-- Adiciona coluna para identificar banners que vieram de posts sugeridos
ALTER TABLE banners ADD COLUMN IF NOT EXISTS from_suggested_post BOOLEAN DEFAULT FALSE;
