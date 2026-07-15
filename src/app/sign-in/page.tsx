import Link from "next/link";
import { Landmark } from "lucide-react";

import RoleSelect from "@/components/auth/RoleSelect";
import { APP } from "@/lib/constants";
import { isLocalRoleSelectionEnabled, isOidcConfigured } from "@/lib/auth/roles";

export default function SignInPage() {
  const localRoleSelectionEnabled = isLocalRoleSelectionEnabled();
  const oidcConfigured = isOidcConfigured();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Landmark className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              {APP.name}
            </p>
            <p className="text-xs text-slate-500">
              {APP.tagline}
            </p>
          </div>
        </Link>

        <section className="py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Workspace entry
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Open a CantonFlow workspace
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Each workspace loads contracts visible to its authorized Canton
              party.
            </p>
          </div>

          <div className="mt-10">
            {localRoleSelectionEnabled ? <RoleSelect /> : null}

            {!localRoleSelectionEnabled && oidcConfigured ? (
              <Link
                href="/api/auth/signin/canton-oidc?callbackUrl=/supplier"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Continue with Institutional SSO
              </Link>
            ) : null}

            {!localRoleSelectionEnabled && !oidcConfigured ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                Institutional SSO has not been configured for this deployment.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
