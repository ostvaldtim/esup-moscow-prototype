# Architecture

## Problem model

The original challenge starts from a large standardized accounting policy (СУП) that exists primarily as a document. Organizations need only the provisions that apply to their accounting type, industry and organizational parameters. Those choices should then remain consistent with the organization's accounting policy and with relevant 1C settings.

## Prototype pipeline

1. **Import** — a Word document can be parsed into text.
2. **Structure** — numbered provisions are converted into blocks with section/subsection context.
3. **Parameterize** — blocks can be associated with applicability criteria such as industry and accounting type.
4. **Select** — the interface helps a user select applicable blocks for an organization.
5. **Assist** — an LLM can classify a block as mandatory, recommended or optional and return a short reason.
6. **Validate** — completeness logic checks whether required/recommended content is present before approval-oriented actions.
7. **Version** — block/policy revisions can be compared and historical state preserved.
8. **Generate** — the selected policy can be assembled into a Word document.
9. **Integrate** — structured policy choices can be represented as settings intended for downstream 1C workflows.

## AI layer

The representative YandexGPT module sends organization context plus a truncated policy block to the model and requests a structured JSON recommendation:

```json
{
  "recommendation": "mandatory | recommended | optional",
  "reason": "short explanation"
}
```

The prototype also includes deterministic filtering by organization metadata. AI assistance therefore supplements, rather than replaces, explicit rule-based applicability logic.

## Public reconstruction

The full submission contained credentials, deployment artifacts, official challenge files, seed data and 1C assets. Those are not part of this public version. Only representative implementation modules are included.
