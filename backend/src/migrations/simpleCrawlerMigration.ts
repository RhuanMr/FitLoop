import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração das tabelas do crawler...');
    
    // Verificar se as tabelas já existem
    console.log('🔍 Verificando tabelas existentes...');
    
    const { data: sitesData, error: sitesError } = await supabase
      .from('sites')
      .select('id')
      .limit(1);
    
    if (sitesError && sitesError.code === 'PGRST116') {
      console.log('📋 Tabela sites não existe. Criando...');
      console.log('⚠️ Execute o SQL manualmente no Supabase Dashboard:');
      console.log(`
CREATE TABLE sites (
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

CREATE TABLE suggested_posts (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  article_url TEXT,
  source_site VARCHAR(255) NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);
CREATE INDEX IF NOT EXISTS idx_sites_last_crawled ON sites(last_crawled);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_site_id ON suggested_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_approved ON suggested_posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_suggested_posts_created_at ON suggested_posts(created_at);
      `);
    } else if (sitesError) {
      console.error('❌ Erro ao verificar tabela sites:', sitesError);
      process.exit(1);
    } else {
      console.log('✅ Tabela sites já existe!');
    }
    
    // Verificar tabela suggested_posts
    const { data: postsData, error: postsError } = await supabase
      .from('suggested_posts')
      .select('id')
      .limit(1);
    
    if (postsError && postsError.code === 'PGRST116') {
      console.log('📋 Tabela suggested_posts não existe. Criando...');
      console.log('⚠️ Execute o SQL manualmente no Supabase Dashboard (veja acima)');
    } else if (postsError) {
      console.error('❌ Erro ao verificar tabela suggested_posts:', postsError);
      process.exit(1);
    } else {
      console.log('✅ Tabela suggested_posts já existe!');
    }
    
    // Inserir sites de exemplo se as tabelas existem
    if (!sitesError && !postsError) {
      console.log('🌐 Inserindo sites de exemplo...');
      
      const exampleSites = [
        {
          name: 'G1',
          url: 'https://g1.globo.com/',
          interval_hours: 6,
          selector_title: '.feed-post-link',
          selector_image: '.feed-post-link img',
          selector_link: '.feed-post-link',
          is_active: true
        },
        {
          name: 'UOL',
          url: 'https://www.uol.com.br/',
          interval_hours: 8,
          selector_title: '.headline',
          selector_image: '.headline img',
          selector_link: '.headline a',
          is_active: true
        },
        {
          name: 'Folha',
          url: 'https://www.folha.uol.com.br/',
          interval_hours: 12,
          selector_title: '.c-headline__title',
          selector_image: '.c-headline__image img',
          selector_link: '.c-headline__title a',
          is_active: true
        }
      ];
      
      for (const site of exampleSites) {
        // Verificar se o site já existe
        const { data: existingSite } = await supabase
          .from('sites')
          .select('id')
          .eq('url', site.url)
          .single();
        
        if (existingSite) {
          console.log(`⚠️ Site ${site.name} já existe, pulando...`);
          continue;
        }
        
        const { error: insertError } = await supabase
          .from('sites')
          .insert(site);
        
        if (insertError) {
          console.log(`⚠️ Erro ao inserir site ${site.name}:`, insertError.message);
        } else {
          console.log(`✅ Site ${site.name} inserido com sucesso!`);
        }
      }
      
      console.log('🎉 Migração concluída com sucesso!');
      console.log('📋 Tabelas verificadas:');
      console.log('   - sites (para gerenciar sites de monitoramento)');
      console.log('   - suggested_posts (para posts sugeridos pelo crawler)');
      console.log('🌐 Sites de exemplo adicionados: G1, UOL, Folha');
    } else {
      console.log('⚠️ Execute o SQL manualmente no Supabase Dashboard e rode novamente este script');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

runMigration();
