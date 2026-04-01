import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnostic() {
  try {
    console.log('🔍 Diagnóstico do banco de dados\n');

    // 1. Testar conexão
    console.log('1️⃣  Testando conexão...');
    try {
      const { error } = await supabase.auth.getSession();
      console.log('   ✅ Conectado ao Supabase\n');
    } catch (e) {
      console.log('   ❌ Erro na conexão\n');
      process.exit(1);
    }

    // 2. Verificar tabelas
    console.log('2️⃣  Verificando tabelas...');
    
    const tables = ['banners', 'sites', 'suggested_posts'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error && error.code === 'PGRST116') {
          console.log(`   ❌ ${table} - NÃO EXISTE`);
        } else if (error) {
          console.log(`   ⚠️  ${table} - Erro: ${error.code}`);
        } else {
          console.log(`   ✅ ${table} - ${count || 0} registros`);
        }
      } catch (e: any) {
        console.log(`   ❌ ${table} - Erro: ${e.message}`);
      }
    }

    console.log('\n3️⃣  Como resolver:\n');

    console.log('Se as tabelas não existem:');
    console.log('   1. Abra: https://supabase.com/dashboard/project/_/sql/new');
    console.log('   2. Copie o arquivo: src/migrations/schema.sql');
    console.log('   3. Cole no SQL Editor e clique em [Run]\n');

    console.log('Se as tabelas existem mas com erro no cache:');
    console.log('   1. Aguarde 2-3 minutos');
    console.log('   2. Execute: npm run seed:refresh\n');

    console.log('Para verificar manualmente no Supabase:');
    console.log('   https://supabase.com/dashboard/project/_/editor\n');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

diagnostic().then(() => process.exit(0));
