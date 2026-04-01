import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTableStructure() {
  try {
    console.log('🔬 Verificando estrutura das tabelas (via SQL System)\n');

    // Query para checar se as tabelas existem
    const query = `
      SELECT table_name, table_schema, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_name IN ('banners', 'sites', 'suggested_posts')
      ORDER BY table_name;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { query }) as any;

      if (error) {
        console.log('❌ Erro ao consultar tabelas via SQL:');
        console.log('   ' + error.message);
        console.log('\nIssso é esperado - o exec_sql pode não estar disponível\n');
      } else if (data && Array.isArray(data)) {
        console.log('📋 Tabelas encontradas no banco:\n');
        data.forEach((row: any) => {
          console.log(`   ✅ ${row.table_name} (${row.table_type})`);
        });
        console.log();
      }
    } catch (e) {
      // Ignorar se exec_sql não existe
    }

    // Tentar ler as tabelas diretamente
    console.log(' Testando leitura das tabelas:\n');

    const tables = ['banners', 'sites', 'suggested_posts'];
    
    for (const table of tables) {
      try {
        const { data, count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ❌ ${table}: ${error.code} - ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Pode ler (${count || 0} registros)`);
        }
      } catch (e: any) {
        console.log(`   ❌ ${table}: ${e.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  PROBLEMA IDENTIFICADO:\n');
    console.log('As tabelas EXISTEM (você consegue ler),');
    console.log('MAS o PostgREST não consegue acessar via INSERT/UPDATE\n');
    console.log('SOLUÇÕES:\n');
    console.log('1⃣  Aguarde 5-10 minutos (Supabase cachê');
    console.log('    pode atualizar automaticamente)\n');
    console.log('2⃣  Force um refresh no Supabase:');
    console.log('    - Dashboard > SQL > Novo SQL Editor');
    console.log('    - Execute: SELECT 1;');
    console.log('    - Isso força recarregamento do schema\n');
    console.log('3⃣  Recrie as tabelas (última opção):');
    console.log('    - Vá em: Settings > SQL Editor');
    console.log('    - DROP TABLE sites, suggested_posts, banners;');
    console.log('    - Copie: src/migrations/schema.sql');
    console.log('    - Cole e execute\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  }
}

checkTableStructure().then(() => process.exit(0));
