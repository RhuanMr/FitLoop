const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  try {
    console.log('🔄 Iniciando migração da tabela banners...');
    
    // Verificar se a tabela banners existe
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'banners');
    
    if (tableError) {
      console.error('❌ Erro ao verificar tabelas:', tableError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('📋 Criando tabela banners...');
      
      // Criar tabela banners se não existir
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS banners (
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
        return;
      }
      
      console.log('✅ Tabela banners criada com sucesso!');
    } else {
      console.log('📋 Tabela banners já existe. Verificando colunas...');
      
      // Verificar e adicionar colunas se necessário
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'banners' 
                  AND column_name = 'scheduled_start'
              ) THEN
                  ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;
              END IF;
          END $$;
          
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'banners' 
                  AND column_name = 'scheduled_end'
              ) THEN
                  ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;
              END IF;
          END $$;
        `
      });
      
      if (alterError) {
        console.error('❌ Erro ao adicionar colunas:', alterError);
        return;
      }
      
      console.log('✅ Colunas de agendamento adicionadas com sucesso!');
    }
    
    // Verificar estrutura final da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'banners')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }
    
    console.log('📊 Estrutura final da tabela banners:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  }
}

migrate();
