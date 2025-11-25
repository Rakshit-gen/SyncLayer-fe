import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { api } from './api';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Create or update user in backend
          // Use upsert - create if doesn't exist, update if exists
          await api.createUser({
            email: user.email!,
            name: user.name!,
            avatar_url: user.image || undefined,
          });
          return true;
        } catch (error: any) {
          console.error('Failed to sync user with backend:', error);
          // If user already exists, that's okay - continue sign in
          if (error?.message?.includes('already exists') || error?.message?.includes('duplicate')) {
            return true;
          }
          // Allow sign in even if backend sync fails
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      // Fetch user from backend to get ID
      // If user doesn't exist, try to create it
      if (token.email) {
        try {
          const { user } = await api.getUserByEmail(token.email as string);
          (session as any).userId = user.id;
        } catch (error: any) {
          // If user not found, try to create it
          if (error?.message?.includes('not found') || error?.message?.includes('404')) {
            try {
              const { user: newUser } = await api.createUser({
                email: token.email as string,
                name: token.name as string,
                avatar_url: token.picture as string,
              });
              (session as any).userId = newUser.id;
            } catch (createError) {
              console.error('Failed to create user in session callback:', createError);
            }
          } else {
            console.error('Failed to fetch user from backend:', error);
          }
        }
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend session type
declare module 'next-auth' {
  interface Session {
    userId?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
