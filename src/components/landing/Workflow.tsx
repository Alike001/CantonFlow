import Section from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  HandCoins,
  CheckCircle,
  Landmark,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Upload Invoice",
    description:
      "Suppliers securely upload invoices and request financing.",
  },
  {
    icon: HandCoins,
    title: "Receive Private Bids",
    description:
      "Eligible lenders submit confidential financing offers.",
  },
  {
    icon: CheckCircle,
    title: "Accept Best Offer",
    description:
      "The supplier chooses the most suitable financing proposal.",
  },
  {
    icon: Landmark,
    title: "Atomic Settlement",
    description:
      "Funds and ownership changes settle securely through Canton.",
  },
];

export default function Workflow() {
  return (
    <Section id="workflow">
      <div className="text-center">
        <h2 className="text-4xl font-bold">
          How CantonFlow Works
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-slate-600">
          A simple financing workflow powered by Canton&apos;s privacy-preserving
          infrastructure.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <Card key={step.title} className="relative rounded-2xl">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                  <Icon className="h-7 w-7 text-violet-700" />
                </div>

                <span className="text-sm font-semibold text-violet-700">
                  Step {index + 1}
                </span>

                <h3 className="mt-2 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}