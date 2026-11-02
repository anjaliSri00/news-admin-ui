export interface HomeDecorSEO {
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
}

export interface HomeDecorPayload {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category: string;
  room_type: string;
  style: string;
  layout_type: 'featured' | 'medium' | 'compact';
  is_active: boolean;
  status: 'draft' | 'published';
  article_url?: string;
  tags: string[];
  seo: HomeDecorSEO;
  created_at?: string;
  updated_at?: string;
}

export interface HomeDecorListResponse {
  events?: any; // adjust if needed
  home_decor: HomeDecorPayload[];
  pagination?: any;
}