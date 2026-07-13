import Link from "next/link";
import { Landmark } from "lucide-react";

import RoleSelect from "@/components/auth/RoleSelect";
import { APP } from "@/lib/constants";

export default function SignInPage() {
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
              Each workspace loads contracts visible to its configured Canton
              party. Local development uses the supplied sandbox identities.
            </p>
          </div>

          <div className="mt-10">
            <RoleSelect />
          </div>
        </section>
      </div>
    </main>
  );
}
