import { Banner } from '../types/Banner';
import supabase from './supabaseService';

export async function getBanners(includeExpired: boolean = false): Promise<Banner[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from('banners')
    .select('*')
    .order('exhibition_order', { ascending: true });

  if (!includeExpired) {
    query = query
      .not('status', 'eq', 'expired')
      .or(`scheduled_start.is.null,and(scheduled_start.lte.${now},scheduled_end.gt.${now})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar banners: ${error.message}`);
  }

  return data || [];
}

export async function checkAndUpdateExpiredBanners(): Promise<void> {
  const now = new Date();

  // Buscar todos os banners ativos com scheduled_end no passado
  const { data: expiredBanners, error } = await supabase
    .from('banners')
    .select('*')
    .eq('status', 'active')
    .lt('scheduled_end', now.toISOString());

  if (error) {
    throw new Error(`Erro ao verificar banners expirados: ${error.message}`);
  }

  // Atualizar status para expirado
  for (const banner of expiredBanners || []) {
    await supabase
      .from('banners')
      .update({ status: 'expired' })
      .eq('id', banner.id);
  }
}

// Função para reativar um banner expirado
export async function reactivateBanner(id: number, durationHours: number = 24): Promise<Banner> {
  const now = new Date();
  const scheduledEnd = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('banners')
    .update({
      status: 'active',
      scheduled_start: now.toISOString(),
      scheduled_end: scheduledEnd.toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao reativar banner: ${error.message}`);
  }

  return data;
}