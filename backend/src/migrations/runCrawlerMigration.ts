import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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
    
    // Criar tabela sites
    console.log('📋 Criando tabela sites...');
    const { error: sitesError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (sitesError) {
      console.log('⚠️ Tabela sites pode já existir ou erro:', sitesError.message);
    } else {
      console.log('✅ Tabela sites criada com sucesso!');
    }
    
    // Criar tabela suggested_posts
    console.log('📋 Criando tabela suggested_posts...');
    const { error: postsError } = await supabase.rpc('exec', {
      sql: `
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
      `
    });
    
    if (postsError) {
      console.log('⚠️ Tabela suggested_posts pode já existir ou erro:', postsError.message);
    } else {
      console.log('✅ Tabela suggested_posts criada com sucesso!');
    }
    
    // Criar índices
    console.log('📊 Criando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_sites_last_crawled ON sites(last_crawled);',
      'CREATE INDEX IF NOT EXISTS idx_suggested_posts_site_id ON suggested_posts(site_id);',
      'CREATE INDEX IF NOT EXISTS idx_suggested_posts_approved ON suggested_posts(is_approved);',
      'CREATE INDEX IF NOT EXISTS idx_suggested_posts_created_at ON suggested_posts(created_at);'
    ];
    
    for (const indexSql of indexes) {
      await supabase.rpc('exec', { sql: indexSql });
    }
    console.log('✅ Índices criados com sucesso!');
    
    // Inserir sites de exemplo
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
      const { error: insertError } = await supabase
        .from('sites')
        .upsert(site, { onConflict: 'url' });
      
      if (insertError) {
        console.log(`⚠️ Erro ao inserir site ${site.name}:`, insertError.message);
      } else {
        console.log(`✅ Site ${site.name} inserido com sucesso!`);
      }
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - sites (para gerenciar sites de monitoramento)');
    console.log('   - suggested_posts (para posts sugeridos pelo crawler)');
    console.log('🌐 Sites de exemplo adicionados: G1, UOL, Folha');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

runMigration();
