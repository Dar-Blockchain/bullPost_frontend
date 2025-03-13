// pages/api/auth/[...nextauth].ts
import type { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";

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
      version: "2.0", // Ensure OAuth 2.0 is used
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
          response_type: "code", // required for OAuth 2.0
        },
      },
    }),
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

      // Handle Google/Discord sign in
      if (account?.provider === "google" || account?.provider === "discord") {
        const email = profile?.email ?? null;
        user.email = email;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/auth_Api`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.error("Failed to sync Google/Discord login with backend");
            return false;
          }
          account.access_token = data.token;
          account.user_data = data.user;
        } catch (error) {
          console.error("Error sending Google/Discord login to backend:", error);
          return false;
        }
      }
      // Twitter sign in flow
      else if (account?.provider === "twitter") {
        // If user already exists (for example, from Gmail or Discord), assume linking.
        // In this case, the linkAccount event will handle updating your database.
        if (user?.id) {
          console.log("User already exists, proceeding with Twitter linking...");
          return true;
        } else {
          // Standalone Twitter sign in: call the Twitter endpoint to sync data.
          try {
            const provider = account.provider; // "twitter"
            const providerAccountId = account.providerAccountId;
            const twitterAccessToken = account.access_token;
            const username = user.name;
            const refresh_token = account.refresh_token;
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/auth_ApiTwitter`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  provider,
                  providerAccountId,
                  twitterAccessToken,
                  username,
                  refresh_token,
                }),
              }
            );
            const data = await response.json();
            console.log(
              data,
              "-------------------------Twitter response---------------------------"
            );
            if (!response.ok) {
              console.error("Failed to sync Twitter login with backend");
              return false;
            }
            account.access_token = data.token;
            account.user_data = data.user;
          } catch (error) {
            console.error("Error sending Twitter login to backend:", error);
            return false;
          }
        }
      } else {
        console.error("Unsupported provider:", account?.provider);
        return false;
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.userData = account.user_data;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: token.userData as any,
      };
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/bullpost`;
    },
  },
  // linkAccount event fires when an OAuth provider is linked to an existing user.
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "twitter") {
        try {
          // Since the user is already in your DB, we assume user.id exists.
          const idUser = user.id;
          console.log(idUser, "-------------------------idUser---------------------------");
          console.log("Linking Twitter account for user ID:", idUser);
          const refresh_token = account.refresh_token;
          const provider = account.provider; // "twitter"
          const providerAccountId = account.providerAccountId;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/LinkTwitter`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idUser,
                refresh_token,
                provider,
                providerAccountId,
              }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.error("Failed to link Twitter account in backend", data);
          } else {
            console.log("Twitter account linked successfully:", data);
          }
        } catch (error) {
          console.error("Error linking Twitter account:", error);
        }
      }
    },
  },
};

const authHandler: NextApiHandler = (req, res) =>
  NextAuth(req, res, authOptions);

export default authHandler;
