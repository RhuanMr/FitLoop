import { Banner } from '../types/Banner';
import supabase from '../services/supabaseService';

// Exemplo de uso
const banners: Banner[] = [
  {
    title: 'Hidrate-se antes de treinar',
    url_image: 'https://placehold.co/800x600?text=Hidrate-se',
    exhibition_order: 1,
    status: true,
  },
  {
    title: 'Postura é essencial',
    url_image: 'https://placehold.co/800x600?text=Postura',
    exhibition_order: 2,
    status: true,
  },
  {
    title: 'Alimente-se bem',
    url_image: 'https://placehold.co/800x600?text=Alimente-se',
    exhibition_order: 3,
    status: true,
  },
  {
    title: 'Não esqueça o alongamento',
    url_image: 'https://placehold.co/800x600?text=Alongue-se',
    exhibition_order: 4,
    status: true,
  },
  {
    title: 'Motivação é tudo!',
    url_image: 'https://placehold.co/800x600?text=Motivação',
    exhibition_order: 5,
    status: true,
  },
];

async function seed() {
  console.log('🔁 Inserindo banners de teste...');

  const { data, error } = await supabase
    .from('banners')
    .insert(banners)
    .select(); // Adicione esta linha

  if (error) {
    console.error('❌ Erro ao inserir banners:', error);
  } else {
    console.log('✅ Banners inseridos com sucesso:', data);
  }
}

seed();