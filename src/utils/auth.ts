import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "./prismaDB";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        // check to see if email and password is there
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email or password");
        }

        // check to see if user already exist
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // if user was not found
        if (!user || !user?.password) {
          throw new Error("Invalid email or password");
        }

        // check to see if passwords match
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        // console.log(passwordMatch);

        if (!passwordMatch) {
          console.log("test", passwordMatch);
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),


    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  callbacks: {
    redirect: async ({ url, baseUrl }) => {
      console.log(`Auth Redirect Debug: URL=${url}, BaseURL=${baseUrl}`);
      // After sign-in, redirect to dashboard
      // If the url is relative (starts with /), use it directly
      if (url.startsWith("/")) {
        return `${baseUrl}/dashboard`;
      }
      // If the url is on the same site, allow it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        const profile = await prisma.userOnboardingProfile.findUnique({
          where: { userId: user.id },
          select: { completed: true },
        });

        return {
          ...token,
          id: user.id,
          hasCompletedOnboarding: !!profile?.completed,
        };
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            hasCompletedOnboarding: token.hasCompletedOnboarding,
          },
        };
      }
      return session;
    },
  },

  // debug: process.env.NODE_ENV === "developement",
};
