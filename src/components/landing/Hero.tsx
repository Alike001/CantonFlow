import { Button } from "@/components/ui/button";
import Section from "@/components/shared/Section";
import { ArrowRight, ShieldCheck, Lock, Landmark } from "lucide-react";
import { APP } from "@/lib/constants";

export default function Hero() {
  return (
    <Section className="pt-16">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Left Content */}
        <div>
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
            Powered by Canton Network
          </span>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">
            {APP.heroTitle}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {APP.heroDescription}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg">
              Start Financing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Institutional Grade
            </div>

            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              Selective Disclosure
            </div>

            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-green-600" />
              DAML Smart Contracts
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="rounded-3xl border bg-white p-8 shadow-xl">
          <h3 className="text-lg font-semibold">
            Private Financing Workflow
          </h3>

          <div className="mt-8 space-y-6">

            <WorkflowItem
              title="Supplier uploads invoice"
              color="bg-violet-600"
            />

            <WorkflowItem
              title="Private lender bidding"
              color="bg-blue-600"
            />

            <WorkflowItem
              title="Winning bid selected"
              color="bg-emerald-600"
            />

            <WorkflowItem
              title="Atomic settlement"
              color="bg-orange-500"
            />

          </div>
        </div>
      </div>
    </Section>
  );
}

function WorkflowItem({
  title,
  color,
}: {
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`h-4 w-4 rounded-full ${color}`} />
      <div className="flex-1 rounded-xl border bg-slate-50 px-4 py-3">
        {title}
      </div>
    </div>
  );
}