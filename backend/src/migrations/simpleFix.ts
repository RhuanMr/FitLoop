import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simpleFix() {
  try {
    console.log('🔍 Testando inserção com campos de agendamento...');
    
    // Teste 1: Inserir banner sem campos de agendamento
    console.log('📋 Teste 1: Inserindo banner básico...');
    
    const basicBanner = {
      title: 'Teste Básico - ' + new Date().toISOString(),
      url_image: 'https://example.com/test.jpg',
      exhibition_order: 998,
      description: 'Banner básico sem agendamento',
      status: 'inactive'
    };
    
    const { data: basicData, error: basicError } = await supabase
      .from('banners')
      .insert([basicBanner])
      .select();
    
    if (basicError) {
      console.error('❌ Erro no teste básico:', basicError);
      return false;
    }
    
    console.log('✅ Teste básico passou!');
    
    // Limpar teste básico
    if (basicData && basicData[0]) {
      await supabase.from('banners').delete().eq('id', basicData[0].id);
    }
    
    // Teste 2: Inserir banner com campos de agendamento
    console.log('📋 Teste 2: Inserindo banner com agendamento...');
    
    const scheduledBanner = {
      title: 'Teste Agendamento - ' + new Date().toISOString(),
      url_image: 'https://example.com/test.jpg',
      exhibition_order: 999,
      description: 'Banner com agendamento',
      status: 'inactive',
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: scheduledData, error: scheduledError } = await supabase
      .from('banners')
      .insert([scheduledBanner])
      .select();
    
    if (scheduledError) {
      console.error('❌ Erro no teste de agendamento:', scheduledError);
      console.log('💡 As colunas scheduled_start e scheduled_end não existem!');
      console.log('📋 Execute este SQL no Supabase Dashboard:');
      console.log(`
ALTER TABLE banners ADD COLUMN scheduled_start TIMESTAMP;
ALTER TABLE banners ADD COLUMN scheduled_end TIMESTAMP;
      `);
      return false;
    }
    
    console.log('✅ Teste de agendamento passou!');
    
    // Limpar teste de agendamento
    if (scheduledData && scheduledData[0]) {
      await supabase.from('banners').delete().eq('id', scheduledData[0].id);
    }
    
    console.log('🎉 Todos os testes passaram! O banco está correto.');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  simpleFix().then(success => {
    if (success) {
      console.log('✅ Banco de dados está funcionando corretamente!');
      process.exit(0);
    } else {
      console.log('❌ Banco precisa ser corrigido. Execute o SQL mostrado acima.');
      process.exit(1);
    }
  });
}

export default simpleFix;
