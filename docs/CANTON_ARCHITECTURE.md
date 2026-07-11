# Canton Architecture

CantonFlow is modeled as a permissioned invoice financing workflow where each party only sees the contracts relevant to its role.

## Parties

- `supplier`: uploads invoices, invites lenders, accepts bids.
- `lender`: receives selectively disclosed invoice opportunities and submits private funding bids.
- `buyer`: referenced as the invoice counterparty.
- `regulator`: observes workflow metadata without seeing private commercial bid terms.

## Contract Lifecycle

1. `InvoiceRequest`
   - Created by the supplier.
   - Represents an uploaded invoice and requested financing.
   - Observed by buyer and regulator.
   - Supplier can invite eligible lenders.

2. `LenderInvite`
   - Created by supplier for one lender.
   - This is the selective disclosure boundary for the lender.
   - Lender sees permitted invoice fields, not all supplier documents or competing bids.

3. `FundingBid`
   - Created by a lender from a `LenderInvite`.
   - Signatory: lender.
   - Observer: supplier.
   - Other lenders are not stakeholders, so competing bid terms remain private.

4. `FundingAgreement`
   - Created when supplier accepts a bid.
   - Signatories: supplier and winning lender.
   - Observer: regulator.
   - Represents the accepted private financing terms.

5. `SettlementInstruction`
   - Created when supplier and lender prepare settlement.
   - Represents settlement readiness and later settled status.
   - This is where atomic settlement integration should attach.

## Why Canton

This workflow is a strong fit for Canton because invoice financing requires privacy across multiple dimensions:

- Lenders should not see each other's bids.
- Regulator visibility should not expose commercial terms.
- Supplier and winning lender need a shared agreement.
- Settlement should be coordinated without leaking the full workflow publicly.

## Frontend Mapping

- `/sign-in`: chooses supplier, lender, or regulator role.
- `/supplier/upload`: maps to `InvoiceRequest`.
- `/lender`: maps to `LenderInvite` and `SubmitFundingBid`.
- `/supplier/marketplace`: maps to `FundingBid` and `AcceptBid`.
- `/regulator`: maps to regulator observer visibility.

The product code currently uses a browser-side state adapter for local interaction while the Daml package is compiled and deployed. The production integration replaces that adapter with Daml JSON API commands for the same lifecycle.

## Verification

The DAML source lives in:

```text
daml/CantonFlow.daml
```

Once DPM is installed, verify with:

```bash
HOME=$PWD/.home .tools/dpm/dpm build
```

An exploratory lifecycle script is preserved at `test/daml/CantonFlowTest.daml`; it is outside the package source until its Daml Script syntax is finalized.

The Next.js app is verified separately with:

```bash
npm run lint
npm run build
```
