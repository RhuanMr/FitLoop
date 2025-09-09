import { Request, Response } from 'express';
import supabase from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { Banner, BannerStatus } from '../types/Banner';

// Função auxiliar para validar status
function isValidStatus(status: any): status is BannerStatus {
  return ['active', 'inactive', 'archived', 'expired'].includes(status);
}



export async function uploadBanner(req: Request, res: Response) {
  try {
    console.log('=== UPLOAD BANNER DEBUG ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const file = req.file;
    const { title, exhibition_order, description, status, scheduled_start, scheduled_end } = req.body;

    if (!title || !exhibition_order) {
      console.log('Erro: title ou exhibition_order não fornecidos');
      return res.status(400).json({ error: 'title e exhibition_order são obrigatórios' });
    }
    if (status && !isValidStatus(status)) {
      console.log('Erro: status inválido:', status);
      return res.status(400).json({ error: 'status inválido' });
    }

    let publicUrl = '';
    if (file) {
      console.log('Fazendo upload do arquivo...');
      console.log('Bucket name:', process.env.BUCKET_NAME);
      console.log('File name:', file.originalname);
      console.log('File size:', file.size);
      
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from(process.env.BUCKET_NAME!)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
      
      if (error) {
        console.log('Erro no upload do arquivo:', error);
        return res.status(500).json({ error: `Erro no upload: ${error.message}` });
      }

      publicUrl = supabase.storage
        .from(process.env.BUCKET_NAME!)
        .getPublicUrl(fileName).data.publicUrl;
        
      console.log('Upload realizado com sucesso. URL:', publicUrl);
    } else {
      console.log('Erro: Arquivo não enviado');
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    console.log('Inserindo banner no banco de dados...');
    // Preparar dados para inserção
    const bannerData: any = {
      title,
      url_image: publicUrl,
      exhibition_order: Number(exhibition_order),
      description,
      status: status || 'active'
    };
    
    // Adicionar campos de agendamento apenas se existirem
    if (scheduled_start) {
      bannerData.scheduled_start = scheduled_start;
    }
    if (scheduled_end) {
      bannerData.scheduled_end = scheduled_end;
    }
    
    console.log('Dados para inserção:', bannerData);
    
    const { data, error: insertError } = await supabase
      .from('banners')
      .insert([bannerData])
      .select();

    if (insertError) {
      console.log('Erro ao inserir no banco:', insertError);
      return res.status(500).json({ error: `Erro no banco: ${insertError.message}` });
    }

    console.log('Banner inserido com sucesso:', data);
    return res.json({ success: true, data });
    
  } catch (error) {
    console.log('Erro geral no uploadBanner:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
}

// PUT /banners/:id
export async function updateBanner(req: Request, res: Response) {
  const { id } = req.params;
  const { title, exhibition_order, description, status, scheduled_start, scheduled_end } = req.body;
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
  if (scheduled_start !== undefined) updateObj.scheduled_start = scheduled_start || null;
  if (scheduled_end !== undefined) updateObj.scheduled_end = scheduled_end || null;

  const { data, error } = await supabase
    .from('banners')
    .update(updateObj)
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error });

  return res.json({ success: true, data });
}

// GET /banners?page=1&limit=10&status=active&include_scheduled=true&include_expired=false
export const getBanners = async (req: Request, res: Response) => {
  try {
    console.log('=== GET BANNERS DEBUG ===');
    console.log('Query params:', req.query);
    
    const { page = 1, limit = 10, status, include_scheduled } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    const now = new Date().toISOString();

    let query = supabase
      .from('banners')
      .select('*', { count: 'exact' })
      .order('exhibition_order', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (status === 'active') {
      query = query
        .eq('status', 'active')
        .or(`scheduled_start.is.null,scheduled_start.lte.${now}`)
        .or(`scheduled_end.is.null,scheduled_end.gt.${now}`);
    } else if (status && isValidStatus(status)) {
      query = query.eq('status', status);
    }

    const { include_expired } = req.query;
    if (include_expired !== 'true') {
      query = query.neq('status', 'expired');
    }

    // Se include_scheduled for false, filtra apenas banners que estão no período de exibição
    if (include_scheduled === 'false') {
      // Por enquanto, vamos buscar todos os banners e filtrar no código
      // TODO: Implementar filtro mais complexo no Supabase
      console.log('Filtro de agendamento será aplicado no código');
    }

    console.log('Executando query...');
    const { data, error, count } = await query;

    if (error) {
      console.log('Erro na query:', error);
      return res.status(500).json({ error: `Erro na consulta: ${error.message}` });
    }

    let filteredData = data || [];
    
    // Aplicar filtro de agendamento se necessário
    if (include_scheduled === 'false') {
      filteredData = filteredData.filter(banner => {
        const nowDate = new Date(now);
        const startDate = banner.scheduled_start ? new Date(banner.scheduled_start) : null;
        const endDate = banner.scheduled_end ? new Date(banner.scheduled_end) : null;
        
        // Banner está no período se:
        // - Não tem data de início OU data de início já passou
        // - E não tem data de fim OU data de fim ainda não chegou
        const isAfterStart = !startDate || nowDate >= startDate;
        const isBeforeEnd = !endDate || nowDate <= endDate;
        
        const isInPeriod = isAfterStart && isBeforeEnd;
        
        console.log(`Banner "${banner.title}":`, {
          scheduled_start: banner.scheduled_start,
          scheduled_end: banner.scheduled_end,
          isAfterStart,
          isBeforeEnd,
          isInPeriod
        });
        
        return isInPeriod;
      });
    }

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limitNum);

    console.log('Query executada com sucesso. Banners encontrados:', filteredData.length);
    return res.json({
      banners: filteredData,
      total,
      page: pageNum,
    });
  } catch (error) {
    console.log('Erro ao buscar banners:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Função para deletar um banner
export async function deleteBanner(req: Request, res: Response) {
  try {
    console.log('=== DELETE BANNER DEBUG ===');
    const { id } = req.params;
    console.log('Banner ID:', id);
    
    if (!id) {
      console.log('ID não fornecido');
      return res.status(400).json({ error: 'ID não fornecido' });
    }

    // Verifica se o banner existe
    const { data: banner, error: findError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !banner) {
      console.log('Banner não encontrado:', findError);
      return res.status(404).json({ error: 'Banner não encontrado' });
    }

    console.log('Banner encontrado:', banner);

    // Se tem imagem, remove do storage
    if (banner.url_image) {
      const fileName = banner.url_image.split('/').pop();
      console.log('Removendo arquivo:', fileName);
      
      const { error: storageError } = await supabase.storage
        .from(process.env.BUCKET_NAME!)
        .remove([fileName]);
        
      if (storageError) {
        console.log('Erro ao remover arquivo:', storageError);
        // Não impede a deleção do registro se falhar em remover o arquivo
      }
    }

    // Delete o banner
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.log('Erro ao deletar banner:', deleteError);
      return res.status(500).json({ error: `Erro ao deletar banner: ${deleteError.message}` });
    }

    console.log('Banner deletado com sucesso');
    return res.status(204).send();
  } catch (error) {
    console.log('Erro ao deletar banner:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

