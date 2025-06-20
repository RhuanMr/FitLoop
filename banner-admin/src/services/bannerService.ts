import axios from 'axios';
import { Banner } from '../types/Banner';

const API_URL = 'http://localhost:4000/banners';

// TODO: Pesquisar componentes para excluir e editar banners

export interface BannerListResponse {
  banners: Banner[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getBanners(): Promise<BannerListResponse> {
  const response = await axios.get<BannerListResponse>(API_URL);
  return response.data;
}

// Agora aceita FormData para upload de arquivo
export async function createBanner(formData: FormData): Promise<Banner> {
  const response = await axios.post<Banner>(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// Deletar banner por id
export async function deleteBanner(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}