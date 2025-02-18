// pages/api/auth/[...nextauth].ts
import type { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
// Optionally, uncomment AppleProvider if needed:
// import AppleProvider from "next-auth/providers/apple";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    // Uncomment and configure if you want to use Apple:
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: {
    //     appleId: process.env.APPLE_ID!,
    //     teamId: process.env.APPLE_TEAM_ID!,
    //     privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    //     keyId: process.env.APPLE_KEY_ID!,
    //   },
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log the entire profile returned by the provider (for debugging)
      console.log("SignIn callback - profile:", profile);
      console.log("SignIn callback - account:", account);
      console.log("SignIn callback - user:", user);
      
      // For Google provider, ensure the email is attached
      if (account?.provider === "google") {
        const email = profile?.email ?? null;
        user.email = email;
        // Optionally, add more processing here...
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        token.email = user.email;
      }
      // Log token data for debugging purposes
      console.log("JWT callback - token:", token);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
      }
      // Log session data for debugging purposes
      console.log("Session callback - session:", session);
      return session;
    },
    async redirect({ baseUrl }) {
      return `/bullpost`;
    },
  },
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;
