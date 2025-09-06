import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAndFixSchema() {
  try {
    console.log('🔍 Verificando estrutura da tabela banners...');
    
    // Testar se conseguimos inserir um banner com as novas colunas
    const testBanner = {
      title: 'Teste de Schema',
      url_image: 'https://example.com/test.jpg',
      exhibition_order: 999,
      description: 'Banner de teste para verificar schema',
      status: 'inactive',
      scheduled_start: null,
      scheduled_end: null
    };
    
    const { data, error } = await supabase
      .from('banners')
      .insert([testBanner])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir banner de teste:', error);
      console.log('💡 Isso indica que as colunas scheduled_start e/ou scheduled_end não existem.');
      console.log('📋 Execute o script SQL no Supabase Dashboard:');
      console.log(`
-- Adicionar colunas de agendamento
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP;
      `);
      return false;
    }
    
    console.log('✅ Schema da tabela está correto!');
    
    // Remover o banner de teste
    if (data && data[0]) {
      await supabase
        .from('banners')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Banner de teste removido.');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkAndFixSchema().then(success => {
    if (success) {
      console.log('🎉 Schema verificado com sucesso!');
    } else {
      console.log('⚠️  Schema precisa ser corrigido. Execute o SQL no Supabase.');
    }
  });
}

export default checkAndFixSchema;
