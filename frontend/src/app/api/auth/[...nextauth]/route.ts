/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';

// NextAuth config — OAuth + credentials.
// Env vars required (see .env.local.example):
//   NEXTAUTH_SECRET, NEXTAUTH_URL
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//   FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
//   BACKEND_URL (our Express backend, defaults to http://localhost:4000)
//   RESEND_API_KEY (optional, for welcome emails)

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: { params: { prompt: 'select_account' } },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Email & Mật khẩu',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) return null;
          const u = data.data?.user ?? data.data;
          return {
            id: String(u.id),
            name: u.full_name ?? u.name,
            email: u.email,
            image: u.avatar_url ?? null,
            backendToken: data.data?.token ?? null,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  callbacks: {
    async signIn({ user, account }) {
      // OAuth sign-in → sync with backend (create user if not exists, send welcome email once)
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/oauth-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: user.email,
              name: user.name,
              avatar: user.image,
            }),
          });
          if (!res.ok) {
            // Soft-fail: still allow login even if backend is unreachable (session-only)
            console.warn('[auth] backend oauth-sync failed:', res.status);
          } else {
            const data = await res.json();
            if (data?.data?.token) (user as any).backendToken = data.data.token;
            if (data?.data?.user?.id) (user as any).id = String(data.data.user.id);
            if (data?.data?.isNewUser) (user as any).isNewUser = true;
          }
        } catch (e) {
          console.warn('[auth] oauth-sync error:', e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.backendToken = (user as any).backendToken ?? null;
        token.isNewUser = (user as any).isNewUser ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session as any).backendToken = token.backendToken;
        (session as any).isNewUser = token.isNewUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
