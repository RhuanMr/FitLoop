import axios from 'axios';

export type BannerStatus = 'active' | 'inactive' | 'archived';

export interface Banner {
  id?: number;
  title: string;
  url_image: string;
  exhibition_order: number;
  description?: string;
  status?: BannerStatus;
  created_at?: string;
}

export interface BannerListResponse {
  banners: Banner[];
  total: number;
  page: number;
  totalPages: number;
}

const API_URL = 'http://localhost:4000/banners';

// Listar banners paginados e/ou filtrados por status
export async function getBanners(params?: { page?: number; limit?: number; status?: BannerStatus }): Promise<BannerListResponse> {
  const response = await axios.get<BannerListResponse>(API_URL, { params });
  return response.data;
}

// Criar banner (apenas para integração, normalmente usado no admin)
export async function createBanner(formData: FormData): Promise<Banner> {
  const response = await axios.post<Banner>(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}