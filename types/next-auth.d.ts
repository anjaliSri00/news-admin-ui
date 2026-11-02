// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string | null;
    userType?: string;
    userTypes?: string[];
    isSuperadmin?: boolean;
    internalUserId?: string | null;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name?: string | null;
      email: string;
      mobile?: string | null;
      userType?: string;
      userTypes?: string[];
      isSuperadmin?: boolean;
      internalUserId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    userId?: string;
    name?: string | null;
    email?: string;
    mobile?: string | null;
    userType?: string;
    userTypes?: string[];
    isSuperadmin?: boolean;
    internalUserId?: string | null;
  }
}