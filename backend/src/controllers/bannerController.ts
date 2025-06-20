import { Request, Response } from 'express';
import supabase from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { Banner, BannerStatus } from '../types/Banner';

// Função auxiliar para validar status
function isValidStatus(status: any): status is BannerStatus {
  return ['active', 'inactive', 'archived'].includes(status);
}

export async function uploadBanner(req: Request, res: Response) {
  const file = req.file;
  const { title, exhibition_order, description, status } = req.body;

  if (!title || !exhibition_order) {
    return res.status(400).json({ error: 'title e exhibition_order são obrigatórios' });
  }
  if (status && !isValidStatus(status)) {
    return res.status(400).json({ error: 'status inválido' });
  }

  let publicUrl = '';
  if (file) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage
      .from(process.env.BUCKET_NAME!)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    if (error) return res.status(500).json({ error });

    publicUrl = supabase.storage
      .from(process.env.BUCKET_NAME!)
      .getPublicUrl(fileName).data.publicUrl;
  } else {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  const { data, error: insertError } = await supabase
    .from('banners')
    .insert([{
      title,
      url_image: publicUrl,
      exhibition_order: Number(exhibition_order),
      description,
      status: status || 'active'
    }])
    .select();

  if (insertError) return res.status(500).json({ error: insertError });

  return res.json({ success: true, data });
}

// PUT /banners/:id
export async function updateBanner(req: Request, res: Response) {
  const { id } = req.params;
  const { title, exhibition_order, description, status } = req.body;
  const file = req.file;

  if (status && !isValidStatus(status)) {
    return res.status(400).json({ error: 'status inválido' });
  }

  // Busca o banner atual
  const { data: currentData, error: findError } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !currentData) {
    return res.status(404).json({ error: 'Banner não encontrado' });
  }

  let url_image = currentData.url_image;

  // Se enviou nova imagem, faz upload e remove a antiga
  if (file) {
    // Remove imagem antiga do storage
    const oldPath = url_image.split('/').pop();
    await supabase.storage.from(process.env.BUCKET_NAME!).remove([oldPath]);

    // Faz upload da nova imagem
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(process.env.BUCKET_NAME!)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    if (uploadError) return res.status(500).json({ error: uploadError });

    url_image = supabase.storage
      .from(process.env.BUCKET_NAME!)
      .getPublicUrl(fileName).data.publicUrl;
  }

  const updateObj: Partial<Banner> = {};
  if (title !== undefined) updateObj.title = title;
  if (exhibition_order !== undefined) updateObj.exhibition_order = Number(exhibition_order);
  if (description !== undefined) updateObj.description = description;
  if (status !== undefined) updateObj.status = status;
  if (url_image !== undefined) updateObj.url_image = url_image;

  const { data, error } = await supabase
    .from('banners')
    .update(updateObj)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error });

  return res.json({ success: true, data });
}

// GET /banners?page=1&limit=10&status=active
export const getBanners = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from('banners')
    .select('*', { count: 'exact' })
    .order('exhibition_order', { ascending: true })
    .range(offset, offset + limitNum - 1);

  if (status && isValidStatus(status)) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error });

  const total = count || 0;
  const totalPages = Math.ceil(total / limitNum);

  return res.json({
    banners: data,
    total,
    page: pageNum,
    totalPages
  });
}

// DELETE /banners/:id
export async function deleteBanner(req: Request, res: Response) {
  const { id } = req.params;

  // Busca o banner atual para remover a imagem do storage
  const { data: banner, error: findError } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !banner) {
    return res.status(404).json({ error: 'Banner não encontrado' });
  }

  // Remove imagem do storage, se existir
  if (banner.url_image) {
    const fileName = banner.url_image.split('/').pop();
    if (fileName) {
      await supabase.storage.from(process.env.BUCKET_NAME!).remove([fileName]);
    }
  }

  // Remove o registro do banco
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error });
  }

  return res.json({ success: true });
}