import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixBannerSchema() {
  try {
    console.log('🔄 Verificando e corrigindo schema da tabela banners...');

    // Tentar adicionar a coluna via SQL raw
    const query = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'banners' 
          AND column_name = 'from_suggested_post'
        ) THEN 
          ALTER TABLE banners 
          ADD COLUMN from_suggested_post BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `;

    const { error } = await supabase.rpc('exec_sql', { query });

    if (error) {
      if (error.message.includes('exec_sql')) {
        console.log('❌ Função exec_sql não encontrada. Tentando alternativa...');
        // Tentativa alternativa usando insert
        const { error: insertError } = await supabase
          .from('banners')
          .insert({
            title: '_temp_migration_',
            url_image: '_temp_migration_',
            exhibition_order: 0,
            status: 'inactive',
            from_suggested_post: false
          });

        if (insertError && !insertError.message.includes('column')) {
          throw insertError;
        }

        // Se chegou aqui, vamos limpar o registro temporário
        await supabase
          .from('banners')
          .delete()
          .eq('title', '_temp_migration_');
      } else {
        throw error;
      }
    }

    console.log('✅ Schema verificado e corrigido com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a correção do schema:', error);
  }
}

fixBannerSchema();
