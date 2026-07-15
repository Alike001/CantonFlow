import NextAuth from "next-auth";

import { getRoleForSubject, isOidcConfigured } from "@/lib/auth/roles";

const oidcProvider = isOidcConfigured()
  ? [
      {
        id: "canton-oidc",
        name: "Institutional SSO",
        type: "oidc" as const,
        issuer: process.env.CANTONFLOW_OIDC_ISSUER,
        clientId: process.env.CANTONFLOW_OIDC_CLIENT_ID,
        clientSecret: process.env.CANTONFLOW_OIDC_CLIENT_SECRET,
      },
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: oidcProvider,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    jwt({ token }) {
      token.cantonRole = getRoleForSubject(token.sub);
      return token;
    },
    session({ session, token }) {
      session.user.cantonRole = token.cantonRole || null;
      return session;
    },
  },
});
