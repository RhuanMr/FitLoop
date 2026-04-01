import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    console.log('🚀 Verificando setup do banco de dados\n');

    // 1. Testar conexão
    console.log('🔍 Testando conexão com Supabase...');
    try {
      const { error } = await supabase.from('banners').select('id').limit(1);
      if (!error) {
        console.log('   ✅ Banco conectado!\n');
      } else if (error.code === 'PGRST116') {
        console.log('   ⚠️  Tabelas não encontradas\n');
      }
    } catch (e) {
      console.log('   ❌ Erro na conexão\n');
      process.exit(1);
    }

    // 2. Verificar quais tabelas existem
    console.log('📋 Verificando tabelas...\n');
    
    const tables = ['banners', 'sites', 'suggested_posts'];
    const missingTables = [];
    let tablesOk = 0;

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (!error || (error && error.code !== 'PGRST116')) {
          console.log(`   ✅ ${table}`);
          tablesOk++;
        } else {
          missingTables.push(table);
          console.log(`   ❌ ${table}`);
        }
      } catch {
        missingTables.push(table);
        console.log(`   ❌ ${table}`);
      }
    }

    console.log();

    // 3. Se faltam tabelas, mostrar como criar
    if (missingTables.length > 0) {
      console.log('⚠️  Tabelas faltando: ' + missingTables.join(', ') + '\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('📝 PARA CRIAR AS TABELAS:\n');
      console.log('MÉTODO 1: Copiar e colar no Supabase (mais fácil) ⭐\n');
      console.log('   1. Vá em: https://supabase.com/dashboard/project/_/sql/new');
      console.log('   2. Copie o arquivo: src/migrations/schema.sql');
      console.log('   3. Cole no SQL Editor do Supabase');
      console.log('   4. Clique em [Run]\n');
      console.log('MÉTODO 2: Se tiver psql instalado\n');
      console.log('   psql -h SEU_PROJETO.supabase.co -U postgres < src/migrations/schema.sql\n');
      console.log('═══════════════════════════════════════════════════════════\n');
    } else {
      console.log('🎉 Todas as tabelas existem!\n');

      // Se todas as tabelas existem, tentar inserir dados de exemplo
      console.log('🌐 Verificando sites de exemplo...');
      try {
        const { count } = await supabase
          .from('sites')
          .select('*', { count: 'exact', head: true });

        const actualCount = count || 0;
        if (actualCount === 0) {
          console.log('   Inserindo sites padrão...');
          const sitesData = [
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

          const { error } = await supabase.from('sites').insert(sitesData);

          if (error) {
            console.log('   ⚠️  Erro ao inserir (mas pode funcionar depois)');
            console.log('   💡 Tente novamente em 30 segundos');
            console.log('   💡 Ou execute: npm run seed:sites\n');
          } else {
            console.log('   ✅ 3 sites inseridos!\n');
          }
        } else {
          console.log(`   ✅ ${actualCount} site(s) já existem\n`);
        }
      } catch (e) {
        console.log('   ℹ️  Sites serão inseridos depois via: npm run seed:sites\n');
      }
    }

    // 4. Resumo final
    console.log('📊 Próximos passos:\n');
    console.log('   1. npm install          # instalar dependências');
    console.log('   2. npm run dev          # iniciar servidor');
    console.log('   3. npm run seed:sites   # (opcional) inserir dados\n');
    console.log('✅ Pronto! Acesse http://localhost:3333\n');

  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
    console.error('\nDicas:');
    console.error('  - Verifique se SUPABASE_URL está correto em .env');
    console.error('  - Verifique se SUPABASE_SERVICE_ROLE_KEY está correto em .env');
    console.error('  - Crie as tabelas manualmente em:');
    console.error('  - https://supabase.com/dashboard/project/_/sql/new\n');
    process.exit(1);
  }
}

setupDatabase().then(() => process.exit(0));
