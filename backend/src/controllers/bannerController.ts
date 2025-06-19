import { Request, Response } from 'express';
import supabase from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { Banner } from '../types/Banner';

export async function uploadBanner(req: Request, res: Response) {
  const file = req.file;
  const title = req.body.title;

  if (!file) return res.status(400).send({ error: 'Arquivo não enviado' });

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(process.env.BUCKET_NAME!)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) return res.status(500).json({ error });

  const publicUrl = supabase.storage
    .from(process.env.BUCKET_NAME!)
    .getPublicUrl(fileName).data.publicUrl;

  const { data, error: insertError } = await supabase
    .from('banners')
    .insert([{ title, url_image: publicUrl, exhibition_order: 0 }])
    .select();

  if (insertError) return res.status(500).json({ error: insertError });

  return res.json({ success: true, data });
}
export const getBanners = async (req: Request, res: Response) => {
  // Exemplo de uso da tipagem Banner
  const banners: Banner[] = []; // ou resultado da consulta
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('exhibition_order', { ascending: true });

  if (error) return res.status(500).json({ error });

  return res.json(data);
}