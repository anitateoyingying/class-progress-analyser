# Class Progress Analyser

Upload Taidii class progress reports (.xlsx) to identify the learning objectives
that need the most attention and get AI-generated teaching strategies.

**Live app:** https://anitateoyingying.github.io/class-progress-analyser/

**Also on this site:** [Curriculum Audit Analyser](./audit/) — upload a completed
CA Tool workbook to auto-score it against the audit rubric and generate a
Curriculum Audit Report (with AI-drafted strength/gap commentary) as a downloadable
Word document.

## How it works

- The Excel file is parsed **entirely in your browser** (SheetJS), so student
  data never leaves your device.
- Only anonymous objective statistics (objective text + Not Yet / Emerging /
  Achieved counts) are sent to a Supabase Edge Function, which calls **Google
  Gemini** to generate 3 classroom strategies per objective.
- The Gemini API key lives server-side in Supabase secrets; nothing secret in
  this repo.
- Reports can be exported as Word documents (docx.js), generated client-side.

## Architecture

```
GitHub Pages (static HTML/JS/CSS)
        │  objective stats + app password
        ▼
Supabase Edge Function  (supabase/functions/class-analyser)
        │  GEMINI_API_KEY (secret)
        ▼
Google Gemini (gemini-2.5-flash, structured JSON output)
```

## Redeploying the edge function

```bash
npx supabase functions deploy class-analyser --project-ref <ref> --no-verify-jwt
npx supabase secrets set CLASS_ANALYSER_PASSWORD=<password> --project-ref <ref>
# GEMINI_API_KEY must also be set as a secret

# Curriculum Audit Analyser (audit/) uses its own function + password:
npx supabase functions deploy curriculum-audit --project-ref <ref> --no-verify-jwt
npx supabase secrets set CURRICULUM_AUDIT_PASSWORD=<password> --project-ref <ref>
```

## Local development

```bash
python3 -m http.server 8321
# open http://localhost:8321
```
