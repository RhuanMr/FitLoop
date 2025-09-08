import { Request, Response } from 'express';
import supabase from '../services/supabaseService';
import { CrawlerService } from '../services/crawlerService';
import { Site } from '../types/Site';

const crawlerService = new CrawlerService();

// GET /sites
export const getSites = async (req: Request, res: Response) => {
  try {
    console.log('=== GET SITES DEBUG ===');
    
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Erro ao buscar sites:', error);
      return res.status(500).json({ error: `Erro ao buscar sites: ${error.message}` });
    }

    console.log('Sites encontrados:', data?.length || 0);
    return res.json({ sites: data || [] });
    
  } catch (error) {
    console.log('Erro geral no getSites:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// POST /sites
export const createSite = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE SITE DEBUG ===');
    console.log('Body:', req.body);
    
    const { name, url, interval_hours, selector_title, selector_image, selector_link, is_active = true } = req.body;

    if (!name || !url || !interval_hours || !selector_title || !selector_image) {
      return res.status(400).json({ error: 'name, url, interval_hours, selector_title e selector_image são obrigatórios' });
    }

    if (interval_hours < 0.5 || interval_hours > 168) {
      return res.status(400).json({ error: 'interval_hours deve estar entre 0.5 e 168 horas' });
    }

    const siteData: Omit<Site, 'id' | 'created_at'> = {
      name,
      url,
      interval_hours: Number(interval_hours),
      selector_title,
      selector_image,
      selector_link: selector_link || undefined,
      is_active: Boolean(is_active)
    };

    const { data, error } = await supabase
      .from('sites')
      .insert([siteData])
      .select();

    if (error) {
      console.log('Erro ao criar site:', error);
      return res.status(500).json({ error: `Erro ao criar site: ${error.message}` });
    }

    console.log('Site criado com sucesso:', data);
    return res.json({ success: true, site: data[0] });
    
  } catch (error) {
    console.log('Erro geral no createSite:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// PUT /sites/:id
export const updateSite = async (req: Request, res: Response) => {
  try {
    console.log('=== UPDATE SITE DEBUG ===');
    const { id } = req.params;
    const { name, url, interval_hours, selector_title, selector_image, selector_link, is_active } = req.body;

    const updateData: Partial<Site> = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (interval_hours !== undefined) {
      if (interval_hours < 0.5 || interval_hours > 168) {
        return res.status(400).json({ error: 'interval_hours deve estar entre 0.5 e 168 horas' });
      }
      updateData.interval_hours = Number(interval_hours);
    }
    if (selector_title !== undefined) updateData.selector_title = selector_title;
    if (selector_image !== undefined) updateData.selector_image = selector_image;
    if (selector_link !== undefined) updateData.selector_link = selector_link;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const { data, error } = await supabase
      .from('sites')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.log('Erro ao atualizar site:', error);
      return res.status(500).json({ error: `Erro ao atualizar site: ${error.message}` });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Site não encontrado' });
    }

    console.log('Site atualizado com sucesso:', data);
    return res.json({ success: true, site: data[0] });
    
  } catch (error) {
    console.log('Erro geral no updateSite:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// DELETE /sites/:id
export const deleteSite = async (req: Request, res: Response) => {
  try {
    console.log('=== DELETE SITE DEBUG ===');
    const { id } = req.params;

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Erro ao deletar site:', error);
      return res.status(500).json({ error: `Erro ao deletar site: ${error.message}` });
    }

    console.log('Site deletado com sucesso');
    return res.json({ success: true });
    
  } catch (error) {
    console.log('Erro geral no deleteSite:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};

// POST /sites/:id/test
export const testSite = async (req: Request, res: Response) => {
  try {
    console.log('=== TEST SITE DEBUG ===');
    const { id } = req.params;

    const { data: site, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !site) {
      return res.status(404).json({ error: 'Site não encontrado' });
    }

    console.log('Testando site:', site.name);
    const result = await crawlerService.testSite(site);

    return res.json(result);
    
  } catch (error) {
    console.log('Erro geral no testSite:', error);
    return res.status(500).json({ 
      success: false, 
      posts: [], 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
};

// GET /sites/selectors/:url
export const getSelectorsForUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.params;
    
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const selectors = CrawlerService.getCommonSelectors(url);
    
    return res.json({ selectors });
    
  } catch (error) {
    console.log('Erro geral no getSelectorsForUrl:', error);
    return res.status(500).json({ error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
  }
};
