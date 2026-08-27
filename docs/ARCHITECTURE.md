# Architecture

The prototype starts with a standardized accounting policy (СУП) stored as a large Word document. The goal is to turn that document into structured data that can be filtered for a specific organization and then used to assemble its accounting policy.

## Processing flow

1. **Import** — extract text from a Word document.
2. **Structure** — split numbered provisions into sections, subsections and blocks.
3. **Parameterize** — attach applicability criteria such as industry and accounting type.
4. **Select** — show only the blocks relevant to the selected organization.
5. **Recommend** — YandexGPT can mark a block as mandatory, recommended or optional and return a short explanation.
6. **Validate** — check whether required and recommended content is present.
7. **Version** — compare revisions and preserve previous versions.
8. **Generate** — assemble the selected content into a Word document.
9. **Prepare for 1C** — represent selected structured rules in a form suitable for downstream 1C workflows.

## Recommendation layer

The YandexGPT module receives organization context and a policy block and returns a small JSON object:

```json
{
  "recommendation": "mandatory",
  "reason": "Short explanation"
}
```

Rule-based filtering remains separate from the model call. The model is used as an additional recommendation layer, not as the source of truth for applicability.

## What is published here

This repository contains only selected implementation files needed to show the main flow. Credentials, deployment artifacts, real organization data, official challenge materials and 1C configuration files are excluded.
