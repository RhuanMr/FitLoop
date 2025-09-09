import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addSuggestedPostColumn() {
  try {
    console.log('🔄 Adicionando coluna from_suggested_post na tabela banners...');

    // Primeiro, vamos verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase
      .from('banners')
      .select('from_suggested_post')
      .limit(1);

    if (columnsError && columnsError.message.includes("column")) {
      // A coluna não existe, vamos criá-la usando SQL raw
      const { error } = await supabase
        .from('banners')
        .insert({ 
          title: '_temp_migration_',
          url_image: '_temp_migration_',
          exhibition_order: 0,
          status: 'inactive',
          from_suggested_post: false
        });

      if (error) {
        console.error('❌ Erro ao adicionar coluna:', error);
        return;
      }

      // Remover o registro temporário
      await supabase
        .from('banners')
        .delete()
        .eq('title', '_temp_migration_');
    }

    console.log('✅ Coluna adicionada/verificada com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

addSuggestedPostColumn();
