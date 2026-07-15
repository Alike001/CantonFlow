# Canton Architecture

CantonFlow is a permissioned receivables financing RFQ. It uses separate Daml contracts for commercial workflow data and regulator audit metadata so selective disclosure is enforced by Canton stakeholders, not by frontend redaction.

## Commercial Workflow

1. `InvoiceRequest`
   - Supplier signatory; buyer observer.
   - Holds the complete invoice request and stays off the regulator view.
   - The supplier consumes it through `OpenFundingRound`, so the normal application lifecycle creates one active RFQ from a request.

2. `FundingRound`
   - Supplier signatory; buyer observer.
   - Supplier-only control contract that is consumed and recreated as lenders are invited, preserving the invited-lender set on-ledger.
   - Rejects repeated lender invitations and is archived on the first acceptance, preventing a second funding agreement for the same RFQ.

3. `LenderInvite`
   - Supplier signatory; invited lender observer.
   - Carries the scoped financing opportunity. Other lenders are not stakeholders.
   - `SubmitFundingBid` is consuming, so one invitation can produce only one bid.

4. `FundingBid`
   - Lender signatory; supplier observer.
   - Carries bid pricing and lender note. The regulator and competing lenders are not stakeholders.

5. `FundingAgreement`
   - Supplier and winning lender are signatories.
   - Carries accepted commercial terms. The regulator is not a stakeholder.

6. `SettlementProposal`
   - Supplier signatory; winning lender observer.
   - Holds a proposed settlement reference and awaits independent lender confirmation.

7. `SettlementInstruction`
   - Lender signatory; supplier observer.
   - Records a lender-confirmed settlement coordination instruction. It does not move money or claim atomic delivery-versus-payment.

## Regulator Boundary

`WorkflowAuditEvent` is the only contract observed by the regulator. It contains the supplier party, invoice reference, lifecycle stage, and timestamp. It intentionally excludes invoice value, requested advance, lender pricing, lender note, and settlement reference.

This gives the regulator a real Canton ledger view while preserving commercial confidentiality.

## Frontend Mapping

- `/supplier`: active `InvoiceRequest`, `FundingRound`, `FundingBid`, `FundingAgreement`, `SettlementProposal`, and `SettlementInstruction` contracts visible to the supplier party.
- `/supplier/upload`: creates an `InvoiceRequest`, opens the supplier-controlled `FundingRound`, and creates two scoped `LenderInvite` contracts.
- `/lender` and `/lender?lender=lenderB`: read only active `LenderInvite` contracts visible to lender A or lender B and exercise `SubmitFundingBid`.
- `/supplier/marketplace`: reads supplier-visible `FundingBid` contracts and exercises `AcceptBid`.
- `/regulator`: reads only `WorkflowAuditEvent` contracts visible to the regulator party.

The browser does not store workflow contracts, bid terms, audit evidence, or contract IDs. Each workspace queries the configured party’s active Canton contracts through server-side JSON Ledger API routes.

## Application Authorization

For production, Auth.js authenticates users through a configured OIDC provider. The server maps the verified OIDC subject to one allowlisted CantonFlow role and derives the Canton party from that role. Supplier-only and regulator-only routes reject other roles; lender routes ignore a client-supplied lender selector in production and use the authenticated lender role instead.

The role selector is limited to the local sandbox through `CANTONFLOW_ALLOW_LOCAL_ROLE_SELECTION=true`. It exists only to exercise separately provisioned local parties and is disabled when `NODE_ENV=production`.

## Verification

```bash
npm run lint
npm run build
npm run test:daml
```

`npm run test:daml` runs a separate Daml Script package. It proves the two-lender lifecycle, rejects duplicate funding-round opening, repeated invitations, repeated bids, and invalid advances, asserts that the regulator has no visible commercial contracts, proves that a lender cannot see the other lender's active bid, and verifies duplicate acceptance fails.
