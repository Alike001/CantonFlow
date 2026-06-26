"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadInvoiceForm() {
  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-8 p-8">
        <div>
          <h2 className="mb-6 text-xl font-semibold">
            Invoice Details
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Invoice Number
              </label>

              <Input placeholder="INV-2026-004" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Buyer Name
              </label>

              <Input placeholder="ABC Manufacturing Ltd." />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Invoice Amount
              </label>

              <Input type="number" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Currency
              </label>

              <Input placeholder="USD" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Due Date
              </label>

              <Input type="date" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Requested Financing
              </label>

              <Input type="number" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Minimum Discount Rate (%)
              </label>

              <Input type="number" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Upload Invoice (PDF)
          </label>

          <Input type="file" />
        </div>

        <Button className="w-full">
          Submit Invoice
        </Button>
      </CardContent>
    </Card>
  );
}