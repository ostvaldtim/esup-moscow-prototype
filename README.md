# ESUP Moscow Prototype

Sanitized portfolio case based on a prototype for **digital accounting policy management for Moscow public-sector organizations**.

The project was developed from an official Moscow Department of Finance challenge brief. The core idea was to turn a large standardized accounting policy (СУП) from a document into structured blocks, assemble an organization-specific policy, validate it and prepare structured settings for 1C-oriented workflows.

![Structured document import](docs/screenshots/document-import.webp)

## Product flow

`Word document → structured SUP blocks → organization parameters → selection / AI assistance → completeness check → approval / export → 1C-oriented workflow`

| Normative research | Inventory-number template |
| --- | --- |
| ![Normative research](docs/screenshots/normative-research.webp) | ![Inventory template](docs/screenshots/inventory-template.webp) |
| **Block management** | **Policy approval / 1C export** |
| ![Block management](docs/screenshots/block-management.webp) | ![Policy approval](docs/screenshots/policy-approval.webp) |

## What the prototype explored

- Word-to-structured-block parsing for accounting policy documents
- filtering blocks by organization parameters, accounting type and industry
- AI-assisted recommendations and normative-research concepts
- guided policy assembly and completeness validation
- block status, versioning and comparison
- Word generation and approval/signature-oriented workflows
- structured export / integration concepts for 1C:Accounting for Public Institutions

## My contribution

**Artem Ostvald — interface work and AI-assisted document processing/generation improvements.**

The project was collaborative; frontend, backend, database and 1C-related work was shared across the team.

## Team

- **Artem Ostvald** — interface work; AI-assisted document processing/generation improvements
- **Zakhar Kondratiev** — team contributor
- **Nikita Musienko** — team contributor

This repository does not attempt to reconstruct exact per-file authorship for the historical collaborative prototype.

## Representative code

- `code-samples/client/Wizard.tsx` — guided policy assembly
- `code-samples/client/BlockSelector.tsx` — block selection and recommendations
- `code-samples/client/CompletenessChecker.tsx` — completeness validation
- `code-samples/client/DiffViewer.tsx` — version comparison
- `code-samples/server/wordParser.ts` — Word → structured blocks
- `code-samples/server/wordGenerator.ts` — policy document generation
- `code-samples/server/yandexgpt.ts` — AI-assisted recommendation logic
- `code-samples/shared/schema.ts` — representative data model

## Stack

`React` · `TypeScript` · `Node.js` · `Express` · `PostgreSQL` · `Drizzle ORM` · `Mammoth` · `docx` · `YandexGPT` · `1C-oriented integration`

## Public scope

This is a **sanitized portfolio reconstruction**, not the full submission and not a production deployment. Credentials, real organization seed data, official 1C configuration files, challenge attachments, temporary infrastructure and internal submission artifacts are intentionally omitted.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/PUBLIC_SCOPE.md`](docs/PUBLIC_SCOPE.md).
