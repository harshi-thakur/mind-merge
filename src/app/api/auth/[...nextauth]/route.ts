import NextAuth from "next-auth";
import type { Account, User as AuthUser, AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import sendEmail from "@/lib/email";
import { createUser, findUser, generateOTP } from "@/lib/mongoDb/queries";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GG_ID as string,
      clientSecret: process.env.GG_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials) {
            console.error("Credentials are undefined");
            return null;
          }
          const user = await findUser(credentials.username);
          if (!user) return null;
          if (user.verified&&user.password) {
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) return user;
            
          }
          else {
            
          }
        } catch (err) {
          console.error(err);
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }): Promise<any> {
      if (account?.provider == "credentials") {
        return true;
      }
      if (account?.provider == "github" || account?.provider == "google") {
        try {
           const existUser=await findUser(user.email+"");
           if(!existUser) await createUser({email:user.email+"",verified:true,})
          return true;
        } catch (err) {
          console.log("Error saving user", err);
        }
      }
     
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };