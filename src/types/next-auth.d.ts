import "next-auth";

declare module "next-auth" {
  interface User {
    cantonRole?: string | null;
  }

  interface Session {
    user: {
      cantonRole: string | null;
    } & NonNullable<Session["user"]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    cantonRole?: string | null;
  }
}
