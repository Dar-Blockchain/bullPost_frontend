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
      console.log("SignIn callback - profile:", profile);
      console.log("SignIn callback - account:", account);
      console.log("SignIn callback - user:", user);

      if (account?.provider === "google") {
        const email = profile?.email ?? null;
        user.email = email;

        // Send user data to your backend API
        try {
          const response = await fetch("http://localhost:5000/auth/auth_Api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email
            }),
          });
          const responseData = await response.json(); // ✅ Parse JSON response

          console.log(responseData,"-------------------------response---------------------------")
          if (!response.ok) {
            console.error("Failed to sync Google login with backend");
            return false; // Prevent sign-in if API call fails
          }
        } catch (error) {
          console.error("Error sending Google login to backend:", error);
          return false;
        }
      }

      return true; // Allow sign-in if no issues
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
