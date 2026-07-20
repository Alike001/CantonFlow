"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkspaceRole } from "@/lib/auth/roles";

const workspaceRoutes: Record<WorkspaceRole, string> = {
  supplier: "/supplier",
  lenderA: "/lender",
  lenderB: "/lender",
  regulator: "/regulator",
};

export default function EvaluationAccessForm() {
  const [role, setRole] = useState<WorkspaceRole>("supplier");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = await signIn("evaluation-access", {
        role,
        accessCode,
        redirect: false,
        redirectTo: workspaceRoutes[role],
      });

      if (!result?.ok) {
        setError("The evaluation access code is not valid.");
        return;
      }

      window.location.assign(workspaceRoutes[role]);
    } catch {
      setError("Evaluation sign-in is temporarily unavailable.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Judge evaluation access</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select one institutional role. The signed session is bound server-side to that role&apos;s Canton party.
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="evaluation-role">Workspace</Label>
        <Select value={role} onValueChange={(value) => setRole(value as WorkspaceRole)}>
          <SelectTrigger id="evaluation-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="supplier">Supplier</SelectItem>
            <SelectItem value="lenderA">Lender A</SelectItem>
            <SelectItem value="lenderB">Lender B</SelectItem>
            <SelectItem value="regulator">Regulator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="evaluation-access-code">Access code</Label>
        <Input
          id="evaluation-access-code"
          type="password"
          autoComplete="current-password"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          required
        />
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isPending}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
        Open authorized workspace
      </Button>
    </form>
  );
}
