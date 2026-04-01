import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function forceCreateTables() {
  try {
    console.log('🔨 Forçando criação de tabelas\n');

    // SQL statements diretos
    const createBanners = `
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
    `;

    const createSites = `
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
    `;

    const createSuggestedPosts = `
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
    `;

    const createIndexes = [
      `CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);`,
      `CREATE INDEX IF NOT EXISTS idx_sites_last_crawled ON sites(last_crawled);`,
      `CREATE INDEX IF NOT EXISTS idx_suggested_posts_site_id ON suggested_posts(site_id);`,
      `CREATE INDEX IF NOT EXISTS idx_suggested_posts_approved ON suggested_posts(is_approved);`,
      `CREATE INDEX IF NOT EXISTS idx_suggested_posts_created_at ON suggested_posts(created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);`,
      `CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(exhibition_order);`
    ];

    // 1. Tentar criar tabelas via RPC
    console.log('1️⃣  Criando tabela "banners"...');
    try {
      const { error } = await supabase.rpc('exec_sql', { query: createBanners }) as any;
      if (!error) {
        console.log('   ✅ Sucesso via RPC\n');
      } else {
        console.log('   ⚠️  RPC falhou, tentando alternativa...\n');
      }
    } catch (e) {
      console.log('   ⚠️  RPC não disponível\n');
    }

    console.log('2️⃣  Criando tabela "sites"...');
    try {
      const { error } = await supabase.rpc('exec_sql', { query: createSites }) as any;
      if (!error) {
        console.log('   ✅ Sucesso via RPC\n');
      } else {
        console.log('   ⚠️  RPC falhou\n');
      }
    } catch (e) {
      console.log('   ⚠️  RPC não disponível\n');
    }

    console.log('3️⃣  Criando tabela "suggested_posts"...');
    try {
      const { error } = await supabase.rpc('exec_sql', { query: createSuggestedPosts }) as any;
      if (!error) {
        console.log('   ✅ Sucesso via RPC\n');
      } else {
        console.log('   ⚠️  RPC falhou\n');
      }
    } catch (e) {
      console.log('   ⚠️  RPC não disponível\n');
    }

    // 2. Tentar criar índices
    console.log('4️⃣  Criando índices...');
    for (const indexSql of createIndexes) {
      try {
        await supabase.rpc('exec_sql', { query: indexSql });
      } catch (e) {
        // Ignorar erros de índices
      }
    }
    console.log('   ✅ Índices processados\n');

    // 3. Aguardar cache
    console.log('⏳ Aguardando cache atualizar (15 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 4. Verificar resultado
    console.log('\n🔍 Verificando tabelas...\n');

    const tables = ['banners', 'sites', 'suggested_posts'];
    let allOk = true;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error?.code === 'PGRST116') {
          console.log(`   ❌ ${table} - NÃO EXISTE`);
          allOk = false;
        } else if (error) {
          console.log(`   ⚠️  ${table} - Erro: ${error.code} ${error.message}`);
          allOk = false;
        } else {
          console.log(`   ✅ ${table} - OK`);
        }
      } catch (e: any) {
        console.log(`   ❌ ${table} - ${e.message}`);
        allOk = false;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allOk) {
      console.log('🎉 Todas as tabelas foram criadas com sucesso!\n');
      console.log('Próximos passos:');
      console.log('  npm run seed:sites    # inserir dados');
      console.log('  npm run dev           # iniciar servidor\n');
    } else {
      console.log('⚠️  Ainda há problemas com as tabelas\n');
      console.log('Solução em 3 passos:\n');
      console.log('1. Abra: https://supabase.com/dashboard/project/_/sql/new');
      console.log('2. Cole este SQL:');
      console.log(`
-- Droprar tabelas antigas (se existirem)
DROP TABLE IF EXISTS suggested_posts CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS banners CASCADE;

-- Criar tabelas novas - banners
CREATE TABLE banners (
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

-- Criar tabelas novas - sites
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

-- Criar tabelas novas - suggested_posts
CREATE TABLE suggested_posts (
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

-- Criar índices
CREATE INDEX idx_sites_active ON sites(is_active);
CREATE INDEX idx_sites_last_crawled ON sites(last_crawled);
CREATE INDEX idx_suggested_posts_site_id ON suggested_posts(site_id);
CREATE INDEX idx_suggested_posts_approved ON suggested_posts(is_approved);
CREATE INDEX idx_suggested_posts_created_at ON suggested_posts(created_at);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_order ON banners(exhibition_order);
`);
      console.log('3. Clique em [Run]\n');
      console.log('Depois volte aqui e execute: npm run diagnostic\n');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

forceCreateTables().then(() => process.exit(0));
