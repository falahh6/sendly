/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CID as string,
      clientSecret: process.env.GOOGLE_CS as string,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      console.log("JWT CALLBACK : ", token, account);
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // token.accessTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      return token;

      //   if (Date.now() < token.accessTokenExpires) {
      //     return token;
      //   }

      //   return await refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;

      console.log("SESSION CALLBACK : ", session, token);

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
