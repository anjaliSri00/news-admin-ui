// lib/auth/hash.ts
import md5 from 'blueimp-md5';

export function hashPasswordForTransport(plain: string): string {
  return md5(plain);
}