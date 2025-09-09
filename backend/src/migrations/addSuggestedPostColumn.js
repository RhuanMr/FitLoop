const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSuggestedPostColumn() {
  try {
    console.log('🔄 Adicionando coluna from_suggested_post...');
    
    const { error } = await supabase
      .from('banners')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Erro ao acessar o banco: ${error.message}`);
    }

    // Se chegou aqui, temos conexão. Agora vamos adicionar a coluna
    const { error: alterError } = await supabase
      .from('banners')
      .update({ from_suggested_post: false })
      .is('from_suggested_post', null);
    
    if (error) {
      console.error('❌ Erro ao adicionar coluna:', error);
      return;
    }
    
    console.log('✅ Coluna adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

addSuggestedPostColumn();
