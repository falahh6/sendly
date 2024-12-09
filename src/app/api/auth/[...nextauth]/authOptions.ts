/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { google } from "googleapis"; // Make sure googleapis is imported

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CID as string,
      clientSecret: process.env.GOOGLE_CS as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      console.log("JWT Callback token :", token);
      console.log("JWT Callback account :", account);

      // Check if the account has been authenticated (first-time login or new authentication)
      if (account) {
        // Fetch user from the database (if exists)
        let user = await prisma.user.findFirst({
          where: {
            email: token.email,
          },
        });

        // If user doesn't exist, create the user
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: token.email,
              name: token.name,
              emailVerified: true,
              password: "NA",
              authToken: account.access_token,
            },
          });
          console.log("User created:", user);
        } else {
          console.log("User found:", user);
        }

        // Store the access token and refresh token in the JWT token for session usage
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        // Update the user record with the new tokens
        await prisma.user.update({
          where: {
            email: token.email, // Assumes email is unique
          },
          data: {
            authToken: account.access_token, // Update access token
          },
        });
        console.log("User tokens updated in database.");
      } else if (token.refreshToken) {
        // If the refresh token exists, the access token has expired, so refresh it
        try {
          const googleOAuth = new google.auth.OAuth2(
            process.env.GOOGLE_CID,
            process.env.GOOGLE_CS
          );

          // Set the refresh token to get a new access token
          googleOAuth.setCredentials({
            refresh_token: token.refreshToken,
          });

          // Refresh the access token
          const newTokens = await googleOAuth.refreshAccessToken();
          token.accessToken = newTokens.credentials.access_token;
          console.log("Refreshed Token:", newTokens);

          // After refreshing, update the user record with the new access token
          await prisma.user.update({
            where: {
              email: token.email, // Assumes email is unique
            },
            data: {
              authToken: newTokens.credentials.access_token, // Update with new access token
            },
          });
          console.log("User tokens updated in database after refresh.");
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      }

      return token; // Return the updated token with the new access token
    },
    async session({ session, token }: any) {
      // Attach the latest access token to the session object
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
