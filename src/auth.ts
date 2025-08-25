import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {redirect} from 'next/navigation';

export const {handlers, signIn, signOut, auth} = NextAuth({
  providers: [
    Credentials({
      name: 'Password',
      credentials: {
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        if (credentials?.password === "admin") {
          // Any object returned will be saved in `user` property of the JWT
          return {id: '1', name: 'Admin'};
        }
        // If you return null then an error will be displayed advising the user to check their details.
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({auth, request}) {
      const {pathname} = request.nextUrl;
      if (pathname.startsWith('/admin')) {
        return !!auth;
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
    redirect({url, baseUrl}) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + '/admin';
    },
  },
  // Add matcher to protect all admin routes
  // This ensures that all pages under /admin are protected
  // and require authentication.
  // see: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  session: {
    strategy: "jwt",
  },
  secret: "secret",
});
