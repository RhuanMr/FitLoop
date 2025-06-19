import axios from 'axios';
import { Banner } from '../types/Banner';

const API_URL = 'http://localhost:4000/banners';

export async function getBanners(): Promise<Banner[]> {
  const response = await axios.get<Banner[]>(API_URL);
  return response.data;
}

// Exemplo para criar um banner (ajuste conforme seu backend):
export async function createBanner(banner: Omit<Banner, 'id' | 'created_at'>): Promise<Banner> {
  const response = await axios.post<Banner>(`${API_URL}/upload`, banner);
  return response.data;
}