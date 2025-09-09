import axios from 'axios';
import { Site, SuggestedPost } from '../types/Site';

const API_URL = 'http://localhost:4000';

// Sites
export async function getSites(): Promise<Site[]> {
  const response = await axios.get<{ sites: Site[] }>(`${API_URL}/sites`);
  return response.data.sites;
}

export async function createSite(site: Omit<Site, 'id' | 'created_at'>): Promise<Site> {
  const response = await axios.post<{ site: Site }>(`${API_URL}/sites`, site);
  return response.data.site;
}

export async function updateSite(id: number, site: Partial<Site>): Promise<Site> {
  const response = await axios.put<{ site: Site }>(`${API_URL}/sites/${id}`, site);
  return response.data.site;
}

export async function deleteSite(id: number): Promise<void> {
  await axios.delete(`${API_URL}/sites/${id}`);
}

export async function testSite(id: number): Promise<{ success: boolean; posts: SuggestedPost[]; error?: string }> {
  const response = await axios.post<{ success: boolean; posts: SuggestedPost[]; error?: string }>(`${API_URL}/sites/${id}/test`);
  return response.data;
}

export async function getSelectorsForUrl(url: string): Promise<{ selectors: { title: string; image: string; link?: string } }> {
  const response = await axios.get<{ selectors: { title: string; image: string; link?: string } }>(`${API_URL}/sites/selectors/${encodeURIComponent(url)}`);
  return response.data;
}

// Suggested Posts
export async function getSuggestedPosts(params?: { page?: number; limit?: number; is_approved?: boolean }): Promise<{ posts: SuggestedPost[]; total: number; page: number; totalPages: number }> {
  const response = await axios.get<{ posts: SuggestedPost[]; total: number; page: number; totalPages: number }>(`${API_URL}/suggested-posts`, { params });
  return response.data;
}

export async function approvePost(id: number): Promise<void> {
  await axios.put(`${API_URL}/suggested-posts/${id}/approve`);
}

export async function rejectPost(id: number): Promise<void> {
  await axios.put(`${API_URL}/suggested-posts/${id}/reject`);
}

export async function convertToBanner(id: number, exhibition_order?: number, status: string = 'active'): Promise<{ banner: any }> {
  // Calcula a data de expiração (24 horas a partir de agora)
  const now = new Date();
  const scheduledEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const response = await axios.post<{ banner: any }>(`${API_URL}/suggested-posts/${id}/convert-to-banner`, {
    exhibition_order,
    status,
    scheduled_start: now.toISOString(),
    scheduled_end: scheduledEnd.toISOString()
  });
  return response.data;
}

export async function deleteSuggestedPost(id: number): Promise<void> {
  await axios.delete(`${API_URL}/suggested-posts/${id}`);
}
