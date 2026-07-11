"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoUsers, type DemoUser } from "@/data/demoUsers";

export default function RoleSelect() {
  const router = useRouter();

  function continueAs(user: DemoUser) {
    window.localStorage.setItem("cantonflow:userName", user.name);
    window.localStorage.setItem("cantonflow:userRole", user.title);
    window.localStorage.setItem("cantonflow:userCompany", user.company);
    window.localStorage.setItem("cantonflow:userRoute", user.route);

    router.push(user.route);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {demoUsers.map((user) => {
        const Icon = user.icon;

        return (
          <Card
            key={user.role}
            className="rounded-lg border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-lg bg-slate-100 p-3">
                  <Icon className="h-6 w-6 text-slate-800" />
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Product role
                </span>
              </div>

              <div className="mt-6 flex-1">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  {user.title}
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  {user.company}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {user.description}
                </p>
              </div>

              <Button
                className="mt-6 w-full justify-between"
                onClick={() => continueAs(user)}
              >
                Continue as {user.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="rounded-lg border bg-slate-50 p-5 lg:col-span-3">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 text-slate-700" />
            <div>
              <p className="font-medium text-slate-950">
                Role-gated workspace
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Authentication will connect to the Canton app backend. The
                product flow already separates what each role can access.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-slate-950">
                Selective disclosure first
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Each role lands in a different workspace because CantonFlow is
                designed around who can see which transaction data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
