import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WelcomeBanner() {
  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-slate-950 text-white shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-300">
            Product workflow
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Start a confidential financing workflow
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Upload an invoice, receive confidential financing offers,
            and settle securely using Canton Network&apos;s privacy-preserving
            infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/supplier/upload">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Invoice
            </Button>
          </Link>

          <Link href="/supplier/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/30 bg-transparent text-white hover:bg-white hover:text-slate-950"
            >
              Marketplace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
