"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Landmark, Scale, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Workspace = {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
};

const workspaces: Workspace[] = [
  {
    title: "Supplier",
    description: "Create funding requests and review only the private bids visible to the supplier party.",
    route: "/supplier",
    icon: Building2,
  },
  {
    title: "Lender A",
    description: "Review only lender A invitations and submit confidential financing bids.",
    route: "/lender",
    icon: Landmark,
  },
  {
    title: "Lender B",
    description: "Review only lender B invitations and prove competing bid confidentiality.",
    route: "/lender?lender=lenderB",
    icon: Landmark,
  },
  {
    title: "Regulator",
    description: "Review metadata-only WorkflowAuditEvent contracts without commercial terms.",
    route: "/regulator",
    icon: Scale,
  },
];

export default function RoleSelect() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        {workspaces.map((workspace) => {
          const Icon = workspace.icon;
          return (
            <Card key={workspace.route} className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="flex h-full flex-col p-6">
                <div className="rounded-lg bg-slate-100 p-3 w-fit"><Icon className="h-6 w-6 text-slate-800" /></div>
                <div className="mt-6 flex-1">
                  <h2 className="text-xl font-semibold text-slate-950">{workspace.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-500">{workspace.description}</p>
                </div>
                <Button className="mt-6 w-full justify-between" onClick={() => router.push(workspace.route)}>
                  Open workspace <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        This local environment switches between pre-provisioned Canton parties. Production authentication must map a verified user to a party before exposing these routes.
      </p>
    </div>
  );
}
