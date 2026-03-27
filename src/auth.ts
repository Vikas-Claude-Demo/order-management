import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Auth: Missing credentials");
          return null;
        }

        console.log(`Auth: Attempting login for user: ${credentials.username}`);

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) {
          console.log(`Auth: User not found: ${credentials.username}`);
          return null;
        }

        if (!user.active) {
          console.log(`Auth: User is inactive: ${credentials.username}`);
          return null;
        }

        console.log(`Auth: User found, comparing passwords...`);

        const isValid = await compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          console.log(`Auth: Invalid password for user: ${credentials.username}`);
          return null;
        }

        console.log(`Auth: Login successful for user: ${credentials.username}`);

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          role: user.role,
        };
      },
    }),
  ],
});
