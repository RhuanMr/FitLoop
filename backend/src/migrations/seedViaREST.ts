import dotenv from 'dotenv';

dotenv.config();

async function seedViaREST() {
  try {
    console.log('🌱 Inserindo sites via REST API...\n');

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !ANON_KEY) {
      console.error('❌ Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não configurados em .env');
      process.exit(1);
    }

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
        const response = await fetch(`${SUPABASE_URL}/rest/v1/sites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ANON_KEY}`,
            'apikey': ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(site)
        });

        if (response.ok) {
          console.log(`✅ ${site.name} inserido`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`❌ ${site.name}: ${response.status} ${error}`);
        }
      } catch (err: any) {
        console.log(`❌ ${site.name}: ${err.message}`);
      }
    }

    console.log(`\n📊 Resultado: ${successCount}/3 sites inseridos\n`);

    if (successCount === 3) {
      console.log('🎉 Seeding concluído com sucesso!\n');
    } else if (successCount > 0) {
      console.log('⚠️  Apenas alguns sites foram inseridos\n');
    } else {
      console.log('❌ Nenhum site foi inserido\n');
      console.log('Próxima tentativa:');
      console.log('  npm run seed:rest\n');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

seedViaREST().then(() => process.exit(0));
