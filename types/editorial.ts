export type NavTab = 
  | 'overview' 
  | 'home-decor'
  | 'trending-stories' 
  | 'latest-news' 
  | 'events-industry' 
  | 'designers'
  | 'design-tech' 
  | 'furniture-products' 
  | 'showrooms-projects' 
  | 'editorial-desk' 
  | 'special-reports' 
  | 'podcast-video'
  | 'settings';

export type TimeRange = 'today' | '7days' | 'october' | 'q4' | 'yearly';

export type PipelineFilter = 'all' | 'review' | 'scheduled' | 'published' | 'draft';

export interface Monograph {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  author: {
    name: string;
    desk: string;
    initials: string;
    avatar?: string;
  };
  targetReleaseDate: string;
  status: 'published' | 'scheduled' | 'review' | 'draft';
  statusLabel: string;
  activeReads: number;
  meanDepth: string;
  coverImage: string;
  gallery?: string[];
  pullQuote?: string;
  synopsis?: string;
  fullBody?: string;
  wordCount?: number;
  architecturalStyle?: string;
  location?: string;
  photographer?: string;
}

export interface CuratedCategory {
  id: string;
  title: string;
  volumePercentage: number;
  readsCount: number;
  monographCount: number;
  leadCurator: string;
  leadImage: string;
  description: string;
  architecturalFocus: string[];
}

export interface DeskDeadline {
  id: string;
  title: string;
  status: 'Due Tomorrow' | 'Approved' | 'Awaiting Spec' | 'Urgent Review';
  statusType: 'critical' | 'approved' | 'awaiting';
  description: string;
  desk: string;
}

export interface Contributor {
  id: string;
  name: string;
  initials: string;
  role: string;
  desk: string;
  location: string;
  avatar?: string;
  activeAssignments: number;
  totalMonographs: number;
  specialty: string;
  recentPiece: string;
  status: 'Active' | 'On Assignment' | 'Contributing Fellow';
}

export interface MediaAsset {
  id: string;
  title: string;
  photographer: string;
  monographTitle: string;
  resolution: string;
  aspectRatio: string;
  fileSize: string;
  imageUrl: string;
  status: '300 DPI Verified' | 'In Color Correction' | 'Awaiting Raw Plates';
  tags: string[];
}

export interface MeApiUserType {
  id: string;
  name: string;
  display_name: string;
}

export interface MeApiUser {
  id: string;
  code: string;
  name: string;
  email: string;
  is_superadmin: boolean;
  avatar: string | null;
  job_title: string | null;
  last_login_at: string;
  internal_user_id: string;
  internal_user_code: string;
  internal_user_types: MeApiUserType[];
  last_dashboard_login_at: string;
}

export interface MeApiResponse {
  meta: {
    status: number;
    message: string;
  };
  data: {
    user: MeApiUser;
  };
}



export interface NewsItemPayload {
  // id?: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string[]; // Array as per backend validation
  news_type: 'latest' | 'trending' | 'special';
  featured_image_url: string;
  read_time: number;
  status: 'draft' | 'published';
  layout_type: 'card' | 'featured' | 'compact';
  is_active: boolean;
}


// Trending stories 
export interface TrendingStory {
  id: string;
  rank: number;
  category: string;
  title: string;
  readsCount: number;
  readMinutes: number;
  href: string;
  isActive: boolean;
}
export interface TrendTag {
  label: string;
  url: string;
}

export interface TrendItemPayload {
  id: string;
  title: string;
  excerpt: string;
  category: string; // e.g. "COLOR FORECAST"
  featured_image: string;
  read_time: string; // e.g. "4 min read"
  date: string; // e.g. "14 Oct 2026"
  article_url?: string;
  tags: TrendTag[]; // For the bottom row (Follow the thread...)
  status: 'draft' | 'published';
}
// Event item
export interface EventSEO {
  meta_title: string;
  meta_description: string;
  keywords: string[];
}

export interface BackendEventPayload {
  id?: string; 
  code?: string;  
  slug?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  event_type: string;
  start_date: string; 
  end_date: string; 
  venue: string;
  city: string;
  gallery?: string[];
  country: string;
  organizer: string;
  registration_url: string;
  article_url: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seo: EventSEO;
  featured_image?: string | null; 
  created_at?: string;            
  updated_at?: string; 
  views?: number;
  likes?: number;  
}

// Partial update ke liye
export type UpdateEventPayload = Partial<Omit<BackendEventPayload, 'id' | 'code' | 'slug' | 'author_id' | 'views' | 'likes' | 'created_at' | 'updated_at' | 'deleted_at'>>;

export interface UpdateStatusPayload {
  status: 'draft' | 'published' | 'archived';
}


