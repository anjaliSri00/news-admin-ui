import { adminAuthOptions } from "@/lib/auth/adminAuth";
import NextAuth from "next-auth";

const handler = NextAuth(adminAuthOptions);
export { handler as GET, handler as POST };