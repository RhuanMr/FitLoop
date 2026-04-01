import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSites() {
  try {
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

    for (const site of sites) {
      const { data, error } = await supabase
        .from('sites')
        .insert([site])
        .select();

      if (error) {
        console.log(`⚠️  ${site.name}: ${error.message}`);
      } else {
        console.log(`✅ ${site.name} inserido com sucesso (ID: ${data?.[0]?.id})`);
      }
    }

    console.log('\n🎉 Seeding concluído!\n');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

seedSites().then(() => process.exit(0));
