import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function refreshSchemaAndSeed() {
  try {
    console.log('🔄 Atualizando schema cache do Supabase...\n');

    // 1. Aguardar um pouco para o cache atualizar
    console.log('⏳ Aguardando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2. Forçar reconexão criando novo cliente
    const supabaseRefresh = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Tentar inserir sites
    console.log('🌱 Inserindo sites de exemplo...\n');

    const sites = [
      {
        name: 'G1',
        url: 'https://g1.globo.com/',
        interval_hours: 6,
        selector_title: '.feed-post-link',
        selector_image: '.feed-post-link img',
        selector_link: '.feed-post-link',
        is_active: true
      },
      {
        name: 'UOL',
        url: 'https://www.uol.com.br/',
        interval_hours: 8,
        selector_title: '.headline',
        selector_image: '.headline img',
        selector_link: '.headline a',
        is_active: true
      },
      {
        name: 'Folha',
        url: 'https://www.folha.uol.com.br/',
        interval_hours: 12,
        selector_title: '.c-headline__title',
        selector_image: '.c-headline__image img',
        selector_link: '.c-headline__title a',
        is_active: true
      }
    ];

    let successCount = 0;

    for (const site of sites) {
      try {
        const { data, error } = await supabaseRefresh
          .from('sites')
          .insert([site])
          .select();

        if (error) {
          console.log(`❌ ${site.name}: ${error.message}`);
        } else if (data && data.length > 0) {
          console.log(`✅ ${site.name} (ID: ${data[0].id})`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`❌ ${site.name}: ${err.message}`);
      }
    }

    console.log(`\n📊 Resultado: ${successCount}/3 sites inseridos\n`);

    if (successCount === 3) {
      console.log('🎉 Seeding concluído com sucesso!\n');
      console.log('Próximos passos:');
      console.log('  npm run dev\n');
    } else if (successCount > 0) {
      console.log('⚠️  Apenas alguns sites foram inseridos.');
      console.log('💡 Tente executar novamente em alguns momentos\n');
    } else {
      console.log('❌ Erro: Nenhum site foi inserido');
      console.log('💡 Soluções:');
      console.log('   1. Aguarde 2-3 minutos e tente novamente');
      console.log('   2. Verifique se a tabela "sites" existe no Supabase Dashboard');
      console.log('   3. Se não existir, crie via: src/migrations/schema.sql\n');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

refreshSchemaAndSeed().then(() => process.exit(0));
