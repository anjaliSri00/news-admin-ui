// lib/auth/adminAuth.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  internalLogin,
  extractTokensFromHeaders,
} from '@/helper/api_data_store';

/* ---------- Editorial role allowlist ---------- */

export const EDITORIAL_ROLES = [
  'admin',
  'operations',
  'editor',
  'author',
  'superadmin',
] as const;

type EditorialRole = (typeof EDITORIAL_ROLES)[number];

/* ---------- JWT payload decoder (for internal_user_id) ---------- */

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const [, payload] = token.split('.');
    if (!payload) return {};
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/* ---------- NextAuth options ---------- */

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'internal-credentials',
      name: 'Editorial Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) throw new Error('NEXT_PUBLIC_API_URL is not configured');
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required');
        }

        try {
          const { body, headers } = await internalLogin(baseUrl, {
            email: credentials.email,
            password: credentials.password, // already md5-hashed by the client
          });

          if (body.meta.status !== 200) {
            throw new Error(body.meta.message || 'Authentication failed');
          }

          const user = body.data.user;

          // ── Normalise roles from objects → strings ──
          // Backend returns: user_types: [{ id, name, display_name }]
          const roleNames: string[] = (user.user_types ?? []).map((t) => t.name);
          const isSuper = Boolean(user.is_superadmin);

          const hasEditorial =
            isSuper ||
            roleNames.some((r) =>
              (EDITORIAL_ROLES as readonly string[]).includes(r),
            );

          if (!hasEditorial) {
            throw new Error(
              'This account does not have editorial access. Contact the desk.',
            );
          }

          // ── Tokens ──
          const { accessToken, refreshToken } = extractTokensFromHeaders(headers);
          if (!accessToken) {
            console.warn(
              '[admin-authorize] No access-token header. Headers seen:',
              Array.from(headers.entries()),
            );
            throw new Error('Server did not return an access token');
          }

          // ── internal_user_id is only in the JWT, not the JSON body ──
          const tokenPayload = decodeJwtPayload(accessToken);
          const internalUserId =
            typeof tokenPayload.internal_user_id === 'string'
              ? tokenPayload.internal_user_id
              : null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: (roleNames[0] ?? (isSuper ? 'superadmin' : 'editor')) as string,
            userTypes: roleNames,
            isSuperadmin: isSuper,
            internalUserId,
            accessToken,
            refreshToken,
          };
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Authentication failed';
          throw new Error(message.replace(/^Error:\s*/, ''));
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12h — shorter than subscriber sessions
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken as string,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
          refreshToken: user.refreshToken as string,
          userId: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType as string,
          userTypes: (user.userTypes as string[]) ?? [],
          isSuperadmin: Boolean(user.isSuperadmin),
          internalUserId: (user.internalUserId as string | null) ?? null,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user = {
        id: token.userId as string,
        name: (token.name as string) ?? null,
        email: token.email as string,
        userType: token.userType as string,
        userTypes: (token.userTypes as string[]) ?? [],
        isSuperadmin: Boolean(token.isSuperadmin),
        internalUserId: (token.internalUserId as string | null) ?? null,
      };
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Same-origin relative path → trust it
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Same-origin absolute URL → trust it
      if (url.startsWith(baseUrl)) return url;
      // Cross-origin → fall back to CMS root
      return baseUrl;
    },
  },

  pages: {
    signIn: '/admin/signin',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};