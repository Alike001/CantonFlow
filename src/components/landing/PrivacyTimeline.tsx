import Section from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, EyeOff } from "lucide-react";

const stages = [
  {
    title: "Invoice Uploaded",
    visibility: [
      { role: "Supplier", visible: true },
      { role: "Eligible Lenders", visible: false },
      { role: "Regulator", visible: false },
    ],
  },
  {
    title: "Private Bid Submitted",
    visibility: [
      { role: "Supplier", visible: true },
      { role: "Winning Lender", visible: true },
      { role: "Other Lenders", visible: false },
    ],
  },
  {
    title: "Settlement Completed",
    visibility: [
      { role: "Supplier", visible: true },
      { role: "Winning Lender", visible: true },
      { role: "Regulator (Metadata Only)", visible: true },
    ],
  },
];

export default function PrivacyTimeline() {
  return (
    <Section className="bg-slate-50" id="privacy">
      <div className="text-center">
        <h2 className="text-4xl font-bold">
          Privacy in Action
        </h2>

        <p className="mt-4 mx-auto max-w-2xl text-slate-600">
          CantonFlow uses Canton&apos;s selective disclosure model so each participant
          sees only the information they are authorized to access.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {stages.map((stage) => (
          <Card key={stage.title} className="rounded-2xl">
            <CardContent className="p-8">
              <h3 className="mb-6 text-xl font-semibold">
                {stage.title}
              </h3>

              <div className="space-y-4">
                {stage.visibility.map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span>{item.role}</span>

                    {item.visible ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}