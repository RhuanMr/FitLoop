import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTablesFromSQL() {
  try {
    console.log('🚀 Criando tabelas via SQL direto\n');

    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Separar em statements individuais
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Total de ${statements.length} statements encontrados\n`);

    // Executar cada statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      const preview = sql.substring(0, 50).replace(/\n/g, ' ');
      
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Tentar via exec_sql RPC
        const { error } = await supabase.rpc('exec_sql', { query: sql }) as any;

        if (error) {
          // Se exec_sql não existe, tentar via fetch REST
          try {
            const response = await fetch(
              `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: sql })
              }
            );

            if (response.ok) {
              console.log('   ✅\n');
              successCount++;
            } else {
              console.log(`   ⚠️  HTTP ${response.status}\n`);
            }
          } catch (e) {
            console.log('   ⚠️  Erro na requisição\n');
          }
        } else {
          console.log('   ✅\n');
          successCount++;
        }
      } catch (err: any) {
        console.log(`   ❌ ${err.message}\n`);
        errorCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Resultado: ${successCount} OK, ${errorCount} Erros\n`);

    // Aguardar o cache atualizar
    console.log('⏳ Aguardando cache atualizar (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...\n');

    const tables = ['banners', 'sites', 'suggested_posts'];
    let allCreated = true;

    for (const table of tables) {
      try {
        const { error, data } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.code === 'PGRST116') {
          console.log(`   ❌ ${table} - NÃO CRIADA`);
          allCreated = false;
        } else if (error) {
          console.log(`   ⚠️  ${table} - Erro: ${error.code}`);
        } else {
          console.log(`   ✅ ${table} - CRIADA COM SUCESSO`);
        }
      } catch (e: any) {
        console.log(`   ❌ ${table} - ${e.message}`);
        allCreated = false;
      }
    }

    console.log();

    if (allCreated) {
      console.log('🎉 Todas as tabelas foram criadas!\n');
      console.log('Próximos passos:');
      console.log('  npm run seed:sites    # inserir dados de exemplo');
      console.log('  npm run dev           # iniciar servidor\n');
    } else {
      console.log('❌ Algumas tabelas não foram criadas.\n');
      console.log('Solução alternativa:');
      console.log('  1. Abra: https://supabase.com/dashboard/project/_/sql/new');
      console.log('  2. Copie o conteúdo de: src/migrations/schema.sql');
      console.log('  3. Cole e execute no SQL Editor\n');
    }

  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

createTablesFromSQL().then(() => process.exit(0));
