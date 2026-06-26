# CantonFlow Invoice Finance

> Private invoice financing infrastructure powered by Canton Network.

## Overview

CantonFlow is a privacy-preserving invoice financing platform that enables SMEs to access working capital while protecting sensitive commercial information.

Businesses upload invoices, qualified lenders submit confidential financing offers, and financing agreements settle atomically using Canton Network and DAML smart contracts.

Unlike traditional blockchain applications, CantonFlow leverages Canton's selective disclosure model so each participant only sees the information relevant to them.

---

## Problem

Small businesses often wait 30–90 days before invoices are paid.

Traditional invoice financing suffers from:

- Slow manual approvals
- Sensitive invoice data shared with multiple parties
- Lack of privacy
- Expensive intermediaries

---

## Solution

CantonFlow enables:

- Private invoice submission
- Confidential lender bidding
- Secure financing agreements
- Atomic settlement
- Regulatory compliance

---

## Folder Structure

cantonflow-invoice-finance/
│
├── README.md
├── LICENSE
├── .gitignore
├── package.json
│
├── apps/
│   └── web/                  # Next.js Frontend
│
├── backend/
│   ├── api/
│   ├── services/
│   └── middleware/
│
├── daml/
│   ├── Invoice.daml
│   ├── FinancingRequest.daml
│   ├── FinancingBid.daml
│   └── FinancingAgreement.daml
│
├── docs/
│   ├── architecture.md
│   ├── workflow.md
│   └── api.md
│
├── assets/
│   ├── logo/
│   ├── screenshots/
│   └── diagrams/
│
├── presentation/
│   └── CantonFlow-Pitch.pptx
│
└── .github/
    └── workflows/

---

## Features

- Private Invoice Marketplace
- Confidential Lender Bidding
- DAML Smart Contracts
- Role-Based Access Control
- Canton Selective Disclosure
- Institutional Trade Finance Workflow

---

## Tech Stack

Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend
- Node.js
- Express

Blockchain
- Canton Network
- DAML

Deployment
- Vercel

---

## User Roles

### Supplier

- Upload invoices
- Request financing
- Compare offers
- Accept funding

### Lender

- Browse financing opportunities
- Submit confidential bids
- Manage investments

### Regulator

- Monitor compliance
- View audit metadata
- Verify settlement

---

## Architecture

Next.js Frontend

↓

Backend API

↓

DAML Smart Contracts

↓

Canton Network

---

## Status

🚧 Currently under active development for the Encode Club Build on Canton Hackathon.
