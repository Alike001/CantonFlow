# CantonFlow

CantonFlow is a privacy-first invoice financing platform for SMEs and institutional lenders. Suppliers upload unpaid invoices, receive confidential funding offers, and move toward atomic settlement through Canton Network-style selective disclosure.

Built for the Encode Club x Canton Foundation Build on Canton Hackathon.

## Why CantonFlow

Invoice financing depends on sensitive commercial data: buyer names, invoice PDFs, discount rates, lender appetite, and supplier cash-flow needs. Public-by-default workflows are a poor fit for this market.

CantonFlow focuses on the workflows institutions actually need:

- Confidential lender bidding
- Selective disclosure by participant role
- Permissioned invoice financing workflows
- Atomic funding and settlement as the next integration milestone
- Professional UX for suppliers, lenders, and regulated finance teams

## Current Checkpoint Scope

The checkpoint demo is a polished frontend prototype. DAML and Canton integration are intentionally deferred until after the checkpoint.

Implemented:

- Landing page with Canton-specific privacy narrative
- Supplier dashboard with responsive layout
- KPI cards, recent invoice table, and activity stream
- Working upload invoice form with validation and success state
- Confidential marketplace demo with private lender offers
- Clean navigation across all live routes
- Production build verification

## Demo Flow

1. Open the landing page.
2. Click `Launch Demo`.
3. Review the Supplier Dashboard.
4. Open `Upload`.
5. Submit the prefilled invoice form.
6. Open `Marketplace`.
7. Explain how lender offers remain confidential and selectively disclosed.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Zod validation

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Remaining Milestones

See [MILESTONES.md](./MILESTONES.md).
