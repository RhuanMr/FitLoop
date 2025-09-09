# 🗄️ Criar Tabelas do Sistema de Crawler

## ⚠️ Ação Necessária

As tabelas do sistema de crawler não existem no banco de dados. Execute o SQL abaixo no **Supabase Dashboard**.

## 📋 SQL para Executar

### 1. **Acesse o Supabase Dashboard:**
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto
- Vá para **SQL Editor**

### 2. **Execute este SQL:**

```sql
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

-- Inserir sites de exemplo
INSERT INTO sites (name, url, interval_hours, selector_title, selector_image, selector_link, is_active) VALUES
('G1', 'https://g1.globo.com/', 6, '.feed-post-link', '.feed-post-link img', '.feed-post-link', true),
('UOL', 'https://www.uol.com.br/', 8, '.headline', '.headline img', '.headline a', true),
('Folha', 'https://www.folha.uol.com.br/', 12, '.c-headline__title', '.c-headline__image img', '.c-headline__title a', true)
ON CONFLICT (url) DO NOTHING;
```

### 3. **Após executar o SQL, rode novamente:**

```bash
npm run migrate-crawler
```

## ✅ **Verificação**

Após executar o SQL, você deve ver:

```
🚀 Iniciando migração das tabelas do crawler...
🔍 Verificando tabelas existentes...
✅ Tabela sites já existe!
✅ Tabela suggested_posts já existe!
🌐 Inserindo sites de exemplo...
✅ Site G1 inserido com sucesso!
✅ Site UOL inserido com sucesso!
✅ Site Folha inserido com sucesso!
🎉 Migração concluída com sucesso!
```

## 🎯 **Próximos Passos**

1. ✅ **Execute o SQL** no Supabase Dashboard
2. ✅ **Rode a migração:** `npm run migrate-crawler`
3. ✅ **Inicie o backend:** `npm run dev`
4. ✅ **Inicie o admin:** `npm start`
5. ✅ **Teste as novas abas** no admin

## 📊 **Tabelas Criadas**

### **sites**
- `id` - ID único
- `name` - Nome do site
- `url` - URL do site
- `interval_hours` - Intervalo de crawler (0.5-168h)
- `selector_title` - Seletor CSS para títulos
- `selector_image` - Seletor CSS para imagens
- `selector_link` - Seletor CSS para links
- `is_active` - Site ativo/inativo
- `created_at` - Data de criação
- `last_crawled` - Último crawl

### **suggested_posts**
- `id` - ID único
- `site_id` - Referência ao site
- `title` - Título do post
- `image_url` - URL da imagem
- `article_url` - URL do artigo
- `source_site` - Nome do site fonte
- `is_approved` - Post aprovado/pendente
- `created_at` - Data de criação

**Execute o SQL e teste o sistema!** 🚀
