import { Request, Response } from 'express';
import supabase from '../services/supabaseService';
import { SuggestedPost } from '../types/Site';

// GET /suggested-posts
export const getSuggestedPosts = async (req: Request, res: Response) => {
  try {
    console.log('=== GET SUGGESTED POSTS DEBUG ===');
    
    const { page = 1, limit = 20, is_approved } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('suggested_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (is_approved !== undefined) {
      query = query.eq('is_approved', is_approved === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.log('Erro ao buscar posts sugeridos:', error);
      return res.status(500).json({ error: `Erro ao buscar posts: ${error.message}` });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limitNum);

    console.log('Posts sugeridos encontrados:', data?.length || 0);
    return res.json({
      posts: data || [],
      total,
      page: pageNum,
      totalPages
    });
    
  } catch (error) {
    console.log('Erro geral no getSuggestedPosts:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// PUT /suggested-posts/:id/approve
export const approvePost = async (req: Request, res: Response) => {
  try {
    console.log('=== APPROVE POST DEBUG ===');
    const { id } = req.params;

    const { data: post, error: findError } = await supabase
      .from('suggested_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !post) {
      return res.status(404).json({ error: 'Post sugerido não encontrado' });
    }

    const { error } = await supabase
      .from('suggested_posts')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      console.log('Erro ao aprovar post:', error);
      return res.status(500).json({ error: `Erro ao aprovar post: ${error.message}` });
    }

    console.log('Post aprovado com sucesso');
    return res.json({ success: true });
    
  } catch (error) {
    console.log('Erro geral no approvePost:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// PUT /suggested-posts/:id/reject
export const rejectPost = async (req: Request, res: Response) => {
  try {
    console.log('=== REJECT POST DEBUG ===');
    const { id } = req.params;

    const { data: post, error: findError } = await supabase
      .from('suggested_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !post) {
      return res.status(404).json({ error: 'Post sugerido não encontrado' });
    }

    const { error } = await supabase
      .from('suggested_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Erro ao rejeitar post:', error);
      return res.status(500).json({ error: `Erro ao rejeitar post: ${error.message}` });
    }

    console.log('Post rejeitado com sucesso');
    return res.json({ success: true });
    
  } catch (error) {
    console.log('Erro geral no rejectPost:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// POST /suggested-posts/:id/convert-to-banner
export const convertToBanner = async (req: Request, res: Response) => {
  try {
    console.log('=== CONVERT TO BANNER DEBUG ===');
    const { id } = req.params;
    const { exhibition_order = 1, status = 'active' } = req.body;

    const { data: post, error: findError } = await supabase
      .from('suggested_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !post) {
      return res.status(404).json({ error: 'Post sugerido não encontrado' });
    }

    // Criar banner baseado no post sugerido
    const bannerData = {
      title: post.title,
      url_image: post.image_url,
      exhibition_order: Number(exhibition_order),
      description: `Fonte: ${post.source_site}`,
      status: status,
      scheduled_start: null,
      scheduled_end: null
    };

    const { data: banner, error: bannerError } = await supabase
      .from('banners')
      .insert([bannerData])
      .select();

    if (bannerError) {
      console.log('Erro ao criar banner:', bannerError);
      return res.status(500).json({ error: `Erro ao criar banner: ${bannerError.message}` });
    }

    // Marcar post como aprovado
    await supabase
      .from('suggested_posts')
      .update({ is_approved: true })
      .eq('id', id);

    console.log('Post convertido para banner com sucesso');
    return res.json({ success: true, banner: banner[0] });
    
  } catch (error) {
    console.log('Erro geral no convertToBanner:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// DELETE /suggested-posts/:id
export const deleteSuggestedPost = async (req: Request, res: Response) => {
  try {
    console.log('=== DELETE SUGGESTED POST DEBUG ===');
    const { id } = req.params;

    const { error } = await supabase
      .from('suggested_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Erro ao deletar post sugerido:', error);
      return res.status(500).json({ error: `Erro ao deletar post: ${error.message}` });
    }

    console.log('Post sugerido deletado com sucesso');
    return res.json({ success: true });
    
  } catch (error) {
    console.log('Erro geral no deleteSuggestedPost:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};
