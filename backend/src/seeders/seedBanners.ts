import { Banner } from '../types/Banner';
import supabase from '../services/supabaseService';

const banners: Banner[] = [
  {
    title: 'Hidrate-se antes de treinar',
    url_image: 'https://placehold.co/800x600?text=Hidrate-se',
    exhibition_order: 1,
    description: 'Beba água antes do treino para melhor desempenho.',
    status: 'active',
  },
  {
    title: 'Postura é essencial',
    url_image: 'https://placehold.co/800x600?text=Postura',
    exhibition_order: 2,
    description: 'Mantenha a postura correta durante os exercícios.',
    status: 'active',
  },
  {
    title: 'Alimente-se bem',
    url_image: 'https://placehold.co/800x600?text=Alimente-se',
    exhibition_order: 3,
    description: 'Uma boa alimentação é fundamental para resultados.',
    status: 'inactive',
  },
  {
    title: 'Não esqueça o alongamento',
    url_image: 'https://placehold.co/800x600?text=Alongue-se',
    exhibition_order: 4,
    description: 'Alongue-se antes e depois do treino.',
    status: 'archived',
  },
  {
    title: 'Motivação é tudo!',
    url_image: 'https://placehold.co/800x600?text=Motivação',
    exhibition_order: 5,
    description: 'Mantenha-se motivado para alcançar seus objetivos.',
    status: 'active',
  },
];

async function seed() {
  console.log('🔁 Inserindo banners de teste...');

  const { data, error } = await supabase
    .from('banners')
    .insert(banners)
    .select();

  if (error) {
    console.error('❌ Erro ao inserir banners:', error);
  } else {
    console.log('✅ Banners inseridos com sucesso:', data);
  }
}

seed();