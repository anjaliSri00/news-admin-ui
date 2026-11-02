// helper/api_data_store.ts
import { toast } from 'react-toastify';

/* ─── Envelope ─── */

export interface MetaEnvelope<T> {
  meta: { status: number; message: string };
  data: T;
}

export interface ApiResult<T> {
  body: MetaEnvelope<T>;
  headers: Headers;
}

/* ─── Low-level fetch ─── */

export async function fetchApiResponseFull<T = unknown>(
  url: string,
  options?: RequestInit,
  showLoginModal?: () => void,
): Promise<ApiResult<T>> {
  if (!url || url.includes('null') || url.includes('undefined')) {
    console.error('Invalid URL detected:', url);
    throw new Error('Invalid API URL');
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error(
      `Network error reaching ${url}. Check CORS, DNS, or that the API is running.`,
    );
  }

  const body = (await res.json().catch(() => null)) as MetaEnvelope<T> | null;
  if (!body || !body.meta) {
    throw new Error(`Unexpected response from ${url} (status ${res.status})`);
  }

  if (
    !url.includes('/login') &&
    !url.includes('/signup') &&
    (body.meta.status === 400 || body.meta.status === 409)
  ) {
    if (body.meta.message === 'Tokens are not valid for this user') {
      showLoginModal?.();
    } else {
      toast.error(body.meta.message);
    }
  }

  return { body, headers: res.headers };
}

async function fetchApiResponse<T = unknown>(
  url: string,
  options?: RequestInit,
  showLoginModal?: () => void,
): Promise<MetaEnvelope<T>> {
  const { body } = await fetchApiResponseFull<T>(url, options, showLoginModal);
  return body;
}

export default fetchApiResponse;

/* ─── Token extraction ─── */

export interface ExtractedTokens {
  accessToken: string;
  refreshToken: string;
}

export function extractTokensFromHeaders(headers: Headers): ExtractedTokens {
  const accessToken = headers.get('access-token') ?? '';
  const setCookie = headers.get('set-cookie') ?? '';
  const refreshMatch = setCookie.match(/refresh-token=([^;]+)/);
  const refreshToken = refreshMatch?.[1] ?? '';
  return { accessToken, refreshToken };
}

/* ─── Internal login ─── */

export interface InternalUserType {
  id: string;
  name: string;
  display_name: string;
}

export interface InternalMeUser {
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
  internal_user_types: InternalUserType[];
  last_dashboard_login_at: string;
}

export interface InternalMeData {
  user: InternalMeUser;
}

export interface InternalLoginUser {
  id: string;
  user_code: string | null;
  internal_user_code: string | null;
  name: string;
  email: string;
  is_superadmin: boolean;
  user_types: InternalUserType[];
}

export interface InternalLoginData {
  user: InternalLoginUser;
}

export async function internalLogin(
  baseUrl: string,
  payload: { email: string; password: string },
) {
  return fetchApiResponseFull<InternalLoginData>(
    `${baseUrl}/api/v1/internal-dashboard/users/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    },
  );
}

export async function internalMe(
  baseUrl: string,
  accessToken: string,
  refreshToken?: string,
) {
  const headers: Record<string, string> = {
    //  'Content-Type': 'application/json',
    'Access-Token': accessToken,
  };
  if (refreshToken) headers['Refresh-Token'] = refreshToken;

  return fetchApiResponseFull<InternalMeData>(
    `${baseUrl}/api/v1/internal-dashboard/users/me`,
    {
      method: 'GET',
      headers,
    //   credentials: 'include',
    },
  );
}

export async function internalLogout(
  baseUrl: string,
  accessToken: string,
  refreshToken?: string,
) {
  const headers: Record<string, string> = {
     'Content-Type': 'application/json',
    'Access-Token': accessToken,
  };
  if (refreshToken) headers['Refresh-Token'] = refreshToken;

  return fetchApiResponseFull<Record<string, never>>(
    `${baseUrl}/api/v1/internal-dashboard/users/logout`,
    {
      method: 'POST',
      headers,
    //   credentials: 'include',
    },
  );
}