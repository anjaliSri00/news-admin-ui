
// helper/designers_api.ts

import {
  fetchApiResponseFull,
  type MetaEnvelope,
} from './api_data_store';

export interface Designer {
  id: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  excerpt?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  specialization?: string | null;
  portfolio_url?: string | null;
  featured_image_url?: string | null;
  avatar_url?: string | null;
  gallery?: Array<{
    url: string;
    alt?: string | null;
    caption?: string | null;
  }>;
  awards?: string[];
  status?: string;

  read_time?: number | string;
  layout_type?: string;

  is_active?: boolean;
}

export interface DesignerPayload {
  name: string;
  slug?: string | null;
  email?: string | null;
  excerpt?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  specialization?: string | null;
  portfolio_url?: string | null;
  featured_image_url?: string | null;
  avatar_url?: string | null;
  gallery?: Designer['gallery'];
  awards?: string[];
  status?: string;
  is_active?: boolean;
  layout_type?: string;
  read_time?: number | string;
}

export interface DesignerQuery {
  flow_id: string;
  page_id: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/api/v1/internal-dashboard/designers`;
}

function getAuthHeaders(
  accessToken: string,
  refreshToken?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Token': accessToken,
  };

  if (refreshToken) {
    headers['Refresh-Token'] = refreshToken;
  }

  return headers;
}

function withQuery(
  url: string,
  params: DesignerQuery,
): string {
  const query = new URLSearchParams({
    flow_id: params.flow_id,
    page_id: params.page_id,
  });

  return `${url}?${query.toString()}`;
}

// GET: List designers
export async function getDesigners(
  params: DesignerQuery,
  accessToken: string,
  refreshToken?: string,
) {
  return fetchApiResponseFull<unknown>(
    withQuery(`${getBaseUrl()}/`, params),
    {
      method: 'GET',
      headers: getAuthHeaders(accessToken, refreshToken),
    },
  );
}

// GET: Designer details
export async function getDesignerById(
  id: string,
  params: DesignerQuery,
  accessToken: string,
  refreshToken?: string,
) {
  return fetchApiResponseFull<unknown>(
    withQuery(
      `${getBaseUrl()}/${encodeURIComponent(id)}`,
      params,
    ),
    {
      method: 'GET',
      headers: getAuthHeaders(accessToken, refreshToken),
    },
  );
}

// POST: Create designer
export async function createDesigner(
  payload: DesignerPayload,
  accessToken: string,
  refreshToken?: string,
  params?: DesignerQuery,
) {
  const url = params
    ? withQuery(`${getBaseUrl()}/add`, params)
    : `${getBaseUrl()}/add`;

  return fetchApiResponseFull<unknown>(url, {
    method: 'POST',
    headers: getAuthHeaders(accessToken, refreshToken),
    body: JSON.stringify(payload),
  });
}

// PUT: Update designer
export async function updateDesigner(
  id: string,
  payload: DesignerPayload,
  accessToken: string,
  refreshToken?: string,
  params?: DesignerQuery,
) {
  const endpoint = `${getBaseUrl()}/${encodeURIComponent(id)}`;
  const url = params ? withQuery(endpoint, params) : endpoint;

  return fetchApiResponseFull<unknown>(url, {
    method: 'PUT',
    headers: getAuthHeaders(accessToken, refreshToken),
    body: JSON.stringify(payload),
  });
}

// PATCH: Update status
export async function updateDesignerStatus(
  id: string,
  payload: { status?: string; is_active?: boolean },
  accessToken: string,
  refreshToken?: string,
  params?: DesignerQuery,
) {
  const endpoint =
    `${getBaseUrl()}/${encodeURIComponent(id)}/status`;

  const url = params ? withQuery(endpoint, params) : endpoint;

  return fetchApiResponseFull<unknown>(url, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken, refreshToken),
    body: JSON.stringify(payload),
  });
}

// DELETE: Remove designer
export async function deleteDesigner(
  id: string,
  accessToken: string,
  refreshToken?: string,
  params?: DesignerQuery,
) {
  const endpoint = `${getBaseUrl()}/${encodeURIComponent(id)}`;
  const url = params ? withQuery(endpoint, params) : endpoint;

  return fetchApiResponseFull<unknown>(url, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken, refreshToken),
  });
}
