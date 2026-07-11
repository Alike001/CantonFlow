import Link from "next/link";
import Section from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <Section className="bg-violet-700 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          Ready to modernize invoice financing?
        </h2>

        <p className="mt-6 text-lg text-violet-100">
          Empower suppliers, lenders, and regulators with privacy-preserving
          trade finance infrastructure built on Canton Network.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full"
          >
            <Link href="/sign-in">
              Launch Product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white bg-transparent text-white hover:bg-white hover:text-violet-700"
          >
            <a
              href="https://github.com/Alike001/CantonFlow"
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
}
