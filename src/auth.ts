import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
      // Successful sign-in redirects to the admin page
      if (url.startsWith(baseUrl + "/admin")) {
        return url;
      }
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
  session: {
    strategy: "jwt",
  },
  secret: "secret",
});
