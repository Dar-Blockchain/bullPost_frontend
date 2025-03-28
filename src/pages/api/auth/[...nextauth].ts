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
      version: "2.0",  // <-- Make sure to add this
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access", // Adjust scopes as needed
          response_type: "code", // required for OAuth 2.0
        },
      },
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
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - profile:", profile);
      console.log("SignIn callback - account:", account);
      console.log("SignIn callback - user:", user);

      if (account?.provider === "google" || account?.provider === "discord") {
        const email = profile?.email ?? null;
        user.email = email;
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/auth_Api`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();
          console.log(data, "-------------------------response---------------------------");

          if (!response.ok) {
            console.error("Failed to sync Google login with backend");
            return false; // Prevent sign-in if API call fails
          }

          // ✅ Store token and user info inside `account`
          account.access_token = data.token;
          account.user_data = data.user;
          console.log("account", account.user_data);
        } catch (error) {
          console.error("Error sending Google login to backend:", error);
          return false;
        }
      }
      else if (account?.provider === "twitter") {
        try {
          // For Twitter, call /auth/auth_ApiTwitter with provider and providerAccountId
          const provider = account.provider; // should be "twitter"
          const providerAccountId = account.providerAccountId;
          const twitterAccessToken = account.access_token; // access token provided by Twitter
          const username = user.name; // refresh token provided by Twitter
          const refresh_token = account.refresh_token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/auth_ApiTwitter`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ provider, providerAccountId, twitterAccessToken, username, refresh_token }),
          });

          const data = await response.json();
          console.log(data, "-------------------------Twitter response---------------------------");

          if (!response.ok) {
            console.error("Failed to sync Twitter login with backend");
            return false;
          }

          account.access_token = data.token;
          account.user_data = data.user;
          console.log("account", account.user_data);
        } catch (error) {
          console.error("Error sending Twitter login to backend:", error);
          return false;
        }
      } else {
        console.error("Unsupported provider:", account?.provider);
        return false;
      }
      return true;

    }

    ,
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token; // ✅ Store token safely
        token.userData = account.user_data; // ✅ Store backend user info
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string, // ✅ Type assertion
        user: token.userData as any, // ✅ Avoid type errors
      };
    }
    ,
    async redirect({ baseUrl }) {
      return `/bullpost`;
    },
  },
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;