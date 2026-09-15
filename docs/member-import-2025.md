# Member import for 2025–2029

Run from the repository root with MongoDB available and the usual root .env:
`npm run import:members`

## Contents
- 28 named members from MOA EC Member 2025 -2029.pdf -> Executive Council (committee), ordered by designation.
- 94 named office-bearers across 47 associations from MOA_State Association List 2025-2029.pdf -> Affiliated Members, ordered by association and designation.
- Tenure 2025–2029, names and designations as printed (line breaks and trailing punctuation cleaned). Source page is recorded in the dataset.
- The source lists 51 affiliated/recognized units. Four units have no named office-bearers.
- Associate Vice President, Associate Joint Secretary and Associate Executive Member are Council designations; they are not assigned to the separate Associate Members module.
- Only membership identity, designation, association/department, tenure and ordering are imported. Contact information and residential addresses from the PDFs are not included in this task.

## Unnamed positions
The EC Senior Vice President position is unnamed (page 1).
Both President and Secretary are unnamed for Boxing (page 1), Handball (page 2), Kabaddi (page 3) and Swimming (page 4) in the association list. No placeholder people are created.

## Existing content and repeated imports
An existing member is matched using normalized name (ignoring common honorifics/punctuation), plus association for Affiliated Members. Matched members receive the supplied designation, tenure and order; their names, photos, contacts, descriptions and status remain unchanged. Multiple matches stop the import before changes.
New members are published with empty photo/contact fields. No member records are deleted.
A per-member import ledger prevents a repeated run from duplicating entries or undoing later admin edits/deletions. Do not run the command simultaneously in multiple terminals.
Review source spellings such as Chadrajit Jadhav and Tom Josehp in admin if you have corrected official information; they are intentionally retained as printed.
