"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Server } from "lucide-react";

type CantonStatus = {
  ready: boolean;
  configured?: boolean;
  connected?: boolean;
  environment?: string;
  jsonLedgerApiUrl?: string | null;
  packageId?: string | null;
  missing?: string[];
};

export default function CantonEnvironmentBadge() {
  const [status, setStatus] = useState<CantonStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/canton/status", {
          cache: "no-store",
        });
        const payload = (await response.json()) as CantonStatus;

        if (!cancelled) {
          setStatus(payload);
        }
      } catch {
        if (!cancelled) {
          setStatus({
            ready: false,
            environment: "Unavailable",
          });
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
        <Server className="h-3.5 w-3.5" />
        Checking Canton
      </span>
    );
  }

  if (!status.configured) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        <AlertCircle className="h-3.5 w-3.5" />
        Canton not configured
      </span>
    );
  }

  if (!status.connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
        <AlertCircle className="h-3.5 w-3.5" />
        Canton unreachable
      </span>
    );
  }

  const isDevNet = status.environment === "Canton DevNet";

  return (
    <span
      title={status.jsonLedgerApiUrl || undefined}
      className={
        isDevNet
          ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
      }
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {status.environment || "Canton configured"}
    </span>
  );
}
