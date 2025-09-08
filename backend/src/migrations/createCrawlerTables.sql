-- Criar tabela de sites para monitoramento
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

-- Criar tabela de posts sugeridos
CREATE TABLE IF NOT EXISTS suggested_posts (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  article_url TEXT,
  source_site VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);
CREATE INDEX IF NOT EXISTS idx_sites_last_crawled ON sites(last_crawled);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_site_id ON suggested_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_approved ON suggested_posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_created_at ON suggested_posts(created_at);

-- Inserir alguns sites de exemplo
INSERT INTO sites (name, url, interval_hours, selector_title, selector_image, selector_link, is_active) VALUES
('G1', 'https://g1.globo.com/', 6, '.feed-post-link', '.feed-post-link img', '.feed-post-link', true),
('UOL', 'https://www.uol.com.br/', 8, '.headline', '.headline img', '.headline a', true),
('Folha', 'https://www.folha.uol.com.br/', 12, '.c-headline__title', '.c-headline__image img', '.c-headline__title a', true)
ON CONFLICT DO NOTHING;
