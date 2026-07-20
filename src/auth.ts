import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import {
  getRoleForSubject,
  isEvaluationAccessConfigured,
  isOidcConfigured,
  workspaceRoles,
} from "@/lib/auth/roles";

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

const evaluationCredentials = z.object({
  role: z.enum(workspaceRoles),
  accessCode: z.string().min(1),
});

function isValidEvaluationCode(accessCode: string) {
  const expected = Buffer.from(process.env.CANTONFLOW_EVALUATION_ACCESS_CODE || "");
  const supplied = Buffer.from(accessCode);

  return (
    expected.length > 0 &&
    expected.length === supplied.length &&
    timingSafeEqual(expected, supplied)
  );
}

const evaluationProvider = isEvaluationAccessConfigured()
  ? [
      Credentials({
        id: "evaluation-access",
        name: "Evaluation access",
        credentials: {
          role: { label: "Workspace role" },
          accessCode: { label: "Access code", type: "password" },
        },
        authorize(credentials) {
          const parsed = evaluationCredentials.safeParse(credentials);
          if (!parsed.success || !isValidEvaluationCode(parsed.data.accessCode)) {
            return null;
          }

          return {
            id: `evaluation:${parsed.data.role}`,
            name: `CantonFlow ${parsed.data.role}`,
            cantonRole: parsed.data.role,
          };
        },
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [...oidcProvider, ...evaluationProvider],
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    jwt({ token, user }) {
      token.cantonRole = user?.cantonRole || token.cantonRole || getRoleForSubject(token.sub);
      return token;
    },
    session({ session, token }) {
      session.user.cantonRole = token.cantonRole || null;
      return session;
    },
  },
});
