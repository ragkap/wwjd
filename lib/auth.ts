import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `;

        if (existingUser.length === 0) {
          // Create new user
          await sql`
            INSERT INTO users (email, name, image)
            VALUES (${user.email}, ${user.name}, ${user.image})
          `;
        } else {
          // Update last login
          await sql`
            UPDATE users SET last_login = NOW(), name = ${user.name}, image = ${user.image}
            WHERE email = ${user.email}
          `;
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const users = await sql`
            SELECT id FROM users WHERE email = ${session.user.email}
          `;
          if (users.length > 0) {
            session.user.id = users[0].id;
          }
        } catch (error) {
          console.error('Error fetching user in session:', error);
        }
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function auth() {
  return getServerSession(authOptions);
}
