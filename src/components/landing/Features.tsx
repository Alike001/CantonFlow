import Section from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Eye,
  Zap,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Confidential Financing",
    description:
      "Sensitive invoice details remain visible only to authorized participants.",
  },
  {
    icon: Eye,
    title: "Selective Disclosure",
    description:
      "Each party sees only the information they are permitted to access.",
  },
  {
    icon: Zap,
    title: "Settlement Coordination",
    description:
      "Funding and settlement happen securely in one coordinated workflow.",
  },
  {
    icon: Building2,
    title: "Institutional Ready",
    description:
      "Built for regulated financial institutions and enterprise workflows.",
  },
];

export default function Features() {
  return (
    <Section id="features">
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Why Businesses Choose CantonFlow
        </h2>

        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          CantonFlow combines institutional privacy, secure smart contracts,
          and efficient financing workflows to help businesses unlock working
          capital with confidence.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="rounded-2xl transition hover:shadow-lg"
            >
              <CardContent className="p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                  <Icon className="h-6 w-6 text-violet-700" />
                </div>

                <h3 className="text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
