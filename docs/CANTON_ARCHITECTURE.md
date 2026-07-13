# Canton Architecture

CantonFlow is a permissioned receivables financing RFQ. It uses separate Daml contracts for commercial workflow data and regulator audit metadata so selective disclosure is enforced by Canton stakeholders, not by frontend redaction.

## Commercial Workflow

1. `InvoiceRequest`
   - Supplier signatory; buyer observer.
   - Holds the complete invoice request and stays off the regulator view.

2. `LenderInvite`
   - Supplier signatory; invited lender observer.
   - Carries the scoped financing opportunity. Other lenders are not stakeholders.

3. `FundingBid`
   - Lender signatory; supplier observer.
   - Carries bid pricing and lender note. The regulator and competing lenders are not stakeholders.

4. `FundingAgreement`
   - Supplier and winning lender are signatories.
   - Carries accepted commercial terms. The regulator is not a stakeholder.

5. `SettlementProposal`
   - Supplier signatory; winning lender observer.
   - Holds a proposed settlement reference and awaits independent lender confirmation.

6. `SettlementInstruction`
   - Lender signatory; supplier observer.
   - Records a lender-confirmed settlement coordination instruction. It does not move money or claim atomic delivery-versus-payment.

## Regulator Boundary

`WorkflowAuditEvent` is the only contract observed by the regulator. It contains the supplier party, invoice reference, lifecycle stage, and timestamp. It intentionally excludes invoice value, requested advance, lender pricing, lender note, and settlement reference.

This gives the regulator a real Canton ledger view while preserving commercial confidentiality.

## Frontend Mapping

- `/supplier`: active `InvoiceRequest`, `FundingBid`, `FundingAgreement`, `SettlementProposal`, and `SettlementInstruction` contracts visible to the supplier party.
- `/supplier/upload`: creates an `InvoiceRequest`, an `InvoiceSubmitted` audit event, then a scoped `LenderInvite`.
- `/lender`: reads active `LenderInvite` contracts visible to the lender party and exercises `SubmitFundingBid`.
- `/supplier/marketplace`: reads supplier-visible `FundingBid` contracts and exercises `AcceptBid`.
- `/regulator`: reads only `WorkflowAuditEvent` contracts visible to the regulator party.

The browser does not store workflow contracts, bid terms, audit evidence, or contract IDs. Each workspace queries the configured party’s active Canton contracts through server-side JSON Ledger API routes.

## Verification

```bash
npm run lint
npm run build
npm run test:daml
```

`npm run test:daml` runs a separate Daml Script package. It proves the full lifecycle and asserts that the regulator has no visible `FundingBid`, `FundingAgreement`, `SettlementProposal`, or `SettlementInstruction` contracts while receiving audit events.
