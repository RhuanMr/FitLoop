import { Request, Response } from 'express';
import supabase from '../services/supabaseService';

// DELETE /banners/:id
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
      
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from(process.env.BUCKET_NAME!)
          .remove([fileName]);
          
        if (storageError) {
          console.log('Erro ao remover arquivo:', storageError);
          // Não impede a deleção do registro se falhar em remover o arquivo
        }
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
