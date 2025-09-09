export interface Site {
  id?: number;
  name: string;
  url: string;
  interval_hours: number;
  selector_title: string;
  selector_image: string;
  selector_link?: string;
  is_active: boolean;
  created_at?: string;
  last_crawled?: string;
}

export interface SuggestedPost {
  id?: number;
  site_id: number;
  title: string;
  image_url: string;
  article_url?: string;
  source_site: string;
  is_approved: boolean;
  created_at?: string;
  converted_to_banner_at?: string;
}
