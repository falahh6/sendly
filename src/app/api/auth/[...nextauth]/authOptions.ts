/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import cryptoo from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CID as string,
      clientSecret: process.env.GOOGLE_CS as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (!account) return token;

      let user = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: token.email,
            name: token.name,
            emailVerified: true,
            password: "NA",
            authToken: cryptoo.randomBytes(64).toString("hex"),
          },
        });
        console.log("User created:", user);
      } else {
        console.log("User found:", user);
      }

      token.accessToken = user.authToken;

      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Token is refreshed once per day if expired
  },
};
