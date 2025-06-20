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