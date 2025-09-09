export type BannerStatus = 'active' | 'inactive' | 'archived' | 'expired';

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
  from_suggested_post?: boolean;
}