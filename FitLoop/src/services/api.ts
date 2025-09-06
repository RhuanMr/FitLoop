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
  scheduled_start?: string;
  scheduled_end?: string;
}

export interface BannerListResponse {
  banners: Banner[];
  total: number;
  page: number;
  totalPages: number;
}

// Configuração da API
// Para React Native, você precisa usar o IP da sua máquina local
// Encontre seu IP com: ifconfig (Mac/Linux) ou ipconfig (Windows)

// IP da sua máquina local (descoberto automaticamente)
const API_URL = 'http://192.168.1.193:4000/banners';

// Configuração do axios com timeout e retry
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opção 2: Para desenvolvimento, você pode usar o IP do Expo
// const API_URL = 'http://10.0.2.2:4000/banners'; // Android Emulator
// const API_URL = 'http://localhost:4000/banners'; // iOS Simulator

// Listar banners paginados e/ou filtrados por status
export async function getBanners(params?: { page?: number; limit?: number; status?: BannerStatus; include_scheduled?: boolean }): Promise<BannerListResponse> {
  try {
    console.log('🔍 Tentando buscar banners...');
    console.log('API URL:', API_URL);
    console.log('Params:', params);
    
    const response = await apiClient.get<BannerListResponse>(API_URL, { params });
    console.log('✅ Banners carregados com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar banners:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('URL:', error.config?.url);
    }
    throw error;
  }
}

// Criar banner (apenas para integração, normalmente usado no admin)
export async function createBanner(formData: FormData): Promise<Banner> {
  const response = await axios.post<Banner>(`${API_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}