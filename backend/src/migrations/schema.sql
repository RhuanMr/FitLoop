-- Esquema do FitLoop Backend
-- Execute no Supabase SQL Editor se o setup automático não funcionar

-- ============================================================
-- Tabela: banners
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  url_image VARCHAR NOT NULL,
  exhibition_order INTEGER NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  from_suggested_post BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- Tabela: sites
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  interval_hours DECIMAL(4,1) NOT NULL CHECK (interval_hours >= 0.5 AND interval_hours <= 168),
  selector_title TEXT NOT NULL,
  selector_image TEXT NOT NULL,
  selector_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_crawled TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- Tabela: suggested_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS suggested_posts (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  article_url TEXT,
  source_site VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_to_banner_at TIMESTAMP
);

-- ============================================================
-- Índices para Performance
-- ============================================================

-- Sites
CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);
CREATE INDEX IF NOT EXISTS idx_sites_last_crawled ON sites(last_crawled);

-- Suggested Posts
CREATE INDEX IF NOT EXISTS idx_suggested_posts_site_id ON suggested_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_approved ON suggested_posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_created_at ON suggested_posts(created_at);

-- Banners
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(exhibition_order);

-- ============================================================
-- Dados de Exemplo
-- ============================================================

INSERT INTO sites (name, url, interval_hours, selector_title, selector_image, selector_link, is_active) VALUES
  ('G1', 'https://g1.globo.com/', 6, '.feed-post-link', '.feed-post-link img', '.feed-post-link', true),
  ('UOL', 'https://www.uol.com.br/', 8, '.headline', '.headline img', '.headline a', true),
  ('Folha', 'https://www.folha.uol.com.br/', 12, '.c-headline__title', '.c-headline__image img', '.c-headline__title a', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Verificação de Estrutura
-- ============================================================

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('banners', 'sites', 'suggested_posts') AND table_schema = 'public'
ORDER BY table_name;

-- Verificar colunas da tabela banners
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'banners'
ORDER BY ordinal_position;

-- Verificar índices
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('banners', 'sites', 'suggested_posts')
ORDER BY tablename, indexname;
