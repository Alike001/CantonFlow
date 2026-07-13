import Section from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Eye, LockKeyhole, Scale } from "lucide-react";

const comparisons = [
  {
    title: "Selective Disclosure",
    description:
      "Only authorized parties can view sensitive invoice and financing data.",
    icon: Eye,
  },
  {
    title: "Privacy by Design",
    description:
      "Commercial information remains confidential throughout the financing lifecycle.",
    icon: LockKeyhole,
  },
  {
    title: "Regulatory Compliance",
    description:
      "Regulators can access compliance data without exposing commercial details.",
    icon: Scale,
  },
  {
    title: "Shared Workflow State",
    description:
      "The winning lender and supplier share the same agreement and settlement instruction.",
    icon: ShieldCheck,
  },
];

export default function WhyCanton() {
  return (
    <Section id="why-canton">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-violet-700">
          Why Canton Network
        </span>

        <h2 className="mt-4 text-4xl font-bold tracking-tight">
          Built for Institutional Finance
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-slate-600">
          CantonFlow leverages Canton&apos;s privacy-preserving infrastructure to
          enable secure collaboration between suppliers, lenders, and regulators
          without exposing sensitive commercial information.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {comparisons.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="border-0 shadow-sm transition hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                  <Icon className="h-6 w-6 text-violet-700" />
                </div>

                <h3 className="text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
