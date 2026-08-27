# ESUP Moscow Prototype

Sanitized portfolio case based on a prototype for **digital accounting policy management for Moscow public-sector organizations**.

The project was developed from an official Moscow Department of Finance challenge brief. The prototype explored how a large standardized accounting policy (СУП) could be converted from document form into structured blocks, filtered for a specific organization, assembled into an organization-level accounting policy, checked for completeness, versioned and prepared for downstream 1C workflows.

## Core flow

```mermaid
flowchart LR
    A[Word / standardized accounting policy] --> B[Document parser]
    B --> C[Structured SUP blocks]
    C --> D[Organization parameters]
    D --> E[Block selection + AI recommendations]
    E --> F[Completeness validation]
    F --> G[Generated accounting policy]
    G --> H[Versions / approval / export]
    H --> I[1C-oriented settings flow]
```

## What the prototype explored

- Word-to-structured-block parsing for accounting policy documents
- filtering blocks by organization parameters, accounting type and industry
- AI-assisted block recommendations with YandexGPT
- guided policy assembly in a multi-step interface
- completeness checks for mandatory/recommended blocks
- policy and block versioning / comparison
- Word document generation
- approval/signature-oriented workflow concepts
- integration-oriented data flow toward 1C:Accounting for Public Institutions

## My contribution

**Artem Ostvald — interface work and AI-assisted document processing/generation improvements.**

The original project was collaborative. Other team members also contributed to the frontend, backend, database and 1C-related parts of the prototype.

## Team

- **Artem Ostvald** — interface work; AI-assisted document processing/generation improvements
- **Zakhar Kondratiev** — team contributor
- **Nikita Musienko** — team contributor

This public repository does **not** attempt to reconstruct exact per-file authorship for a year-old collaborative prototype.

## Public scope

This is a **sanitized portfolio reconstruction**, not the full hackathon submission and not a production deployment.

Included here are representative code samples that demonstrate the product logic. The following are intentionally omitted:

- `.env` files, API credentials, passwords and tokens
- real organization seed data / identifiers
- official 1C configuration files and challenge attachments
- deployment URLs and temporary infrastructure files
- internal completion reports and "production-ready" claims
- private or unnecessary submission artifacts

The code samples are presented for architecture and implementation review; they are not packaged as a standalone runnable application.

## Representative code

- `code-samples/client/Wizard.tsx` — guided policy assembly flow
- `code-samples/client/BlockSelector.tsx` — block selection and AI recommendation display
- `code-samples/client/CompletenessChecker.tsx` — completeness validation UI
- `code-samples/client/DiffViewer.tsx` — version comparison UI
- `code-samples/server/wordParser.ts` — parsing standardized-policy Word documents into blocks
- `code-samples/server/wordGenerator.ts` — policy document generation
- `code-samples/server/yandexgpt.ts` — AI-assisted block recommendation logic
- `code-samples/shared/schema.ts` — representative data model

## Stack used in the prototype

`React` · `TypeScript` · `Node.js` · `Express` · `PostgreSQL` · `Drizzle ORM` · `Mammoth` · `docx` · `YandexGPT` · `1C-oriented integration`

## Status

Historical prototype / portfolio case. No claim is made that this repository is the final production system used by the Moscow Department of Finance.
