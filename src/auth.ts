import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const {handlers, signIn, signOut, auth} = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Password',
      credentials: {
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        if (credentials?.password === 'admin') {
          return {id: '1', name: 'Admin'};
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({auth, request: {nextUrl}}) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    jwt({token, user}) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({session, token}) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({url, baseUrl}) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/admin';
    },
  },
});