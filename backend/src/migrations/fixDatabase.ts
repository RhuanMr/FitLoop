import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixDatabase() {
  try {
    console.log('🔍 Verificando e corrigindo banco de dados...');
    
    // 1. Verificar se a tabela banners existe
    console.log('📋 Verificando se a tabela banners existe...');
    
    const { data: tableExists, error: tableError } = await supabase
      .from('banners')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('❌ Tabela banners não existe. Criando...');
      
      // Criar tabela usando RPC
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE banners (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            url_image VARCHAR NOT NULL,
            exhibition_order INTEGER NOT NULL,
            description TEXT,
            status VARCHAR DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW(),
            scheduled_start TIMESTAMP,
            scheduled_end TIMESTAMP
          );
        `
      });
      
      if (createError) {
        console.error('❌ Erro ao criar tabela:', createError);
        console.log('💡 Execute manualmente no SQL Editor do Supabase:');
        console.log(`
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  url_image VARCHAR NOT NULL,
  exhibition_order INTEGER NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP
);
        `);
        return false;
      }
      
      console.log('✅ Tabela banners criada com sucesso!');
    } else if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return false;
    } else {
      console.log('✅ Tabela banners existe.');
    }
    
    // 2. Verificar colunas existentes
    console.log('📊 Verificando colunas existentes...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'banners');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return false;
    }
    
    const columnNames = columns?.map(col => col.column_name) || [];
    console.log('Colunas existentes:', columnNames);
    
    // 3. Adicionar colunas que estão faltando
    const missingColumns = [];
    
    if (!columnNames.includes('scheduled_start')) {
      missingColumns.push('scheduled_start');
    }
    
    if (!columnNames.includes('scheduled_end')) {
      missingColumns.push('scheduled_end');
    }
    
    if (missingColumns.length > 0) {
      console.log(`🔧 Adicionando colunas faltantes: ${missingColumns.join(', ')}`);
      
      for (const column of missingColumns) {
        const { error: alterError } = await supabase.rpc('exec', {
          sql: `ALTER TABLE banners ADD COLUMN ${column} TIMESTAMP;`
        });
        
        if (alterError) {
          console.error(`❌ Erro ao adicionar coluna ${column}:`, alterError);
          console.log(`💡 Execute manualmente no SQL Editor: ALTER TABLE banners ADD COLUMN ${column} TIMESTAMP;`);
        } else {
          console.log(`✅ Coluna ${column} adicionada com sucesso!`);
        }
      }
    } else {
      console.log('✅ Todas as colunas necessárias já existem.');
    }
    
    // 4. Testar inserção
    console.log('🧪 Testando inserção de banner...');
    
    const testBanner = {
      title: 'Teste de Schema - ' + new Date().toISOString(),
      url_image: 'https://example.com/test.jpg',
      exhibition_order: 999,
      description: 'Banner de teste para verificar schema',
      status: 'inactive',
      scheduled_start: null,
      scheduled_end: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('banners')
      .insert([testBanner])
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir banner de teste:', insertError);
      return false;
    }
    
    console.log('✅ Inserção de teste bem-sucedida!');
    
    // 5. Limpar banner de teste
    if (insertData && insertData[0]) {
      await supabase
        .from('banners')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Banner de teste removido.');
    }
    
    console.log('🎉 Banco de dados corrigido com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixDatabase().then(success => {
    if (success) {
      console.log('✅ Correção concluída com sucesso!');
      process.exit(0);
    } else {
      console.log('❌ Correção falhou. Verifique os logs acima.');
      process.exit(1);
    }
  });
}

export default fixDatabase;
