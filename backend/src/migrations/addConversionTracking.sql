-- Adiciona coluna para rastrear quando um post foi convertido em banner
ALTER TABLE suggested_posts 
ADD COLUMN IF NOT EXISTS converted_to_banner_at TIMESTAMP;
