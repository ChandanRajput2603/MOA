# About and Committee navigation

## Public pages

- About → Our Vision (`/about/vision`). The old `/about` address redirects here.
- About → Constitution (`/about/constitution`). Displays published circulars whose category is `Constitution` (case-insensitive).
- About → Annual Report (`/about/annual-report`). Displays published circulars whose category is `Annual Report` (case-insensitive).
- Committee → Executive Council (`/committee`). Uses the existing committee records and detail URLs without moving or deleting data.
- Committee → Affiliated Members (`/affiliated-members`). Separate member records.
- Committee → Associate Members (`/associate-members`). Separate member records.

Both dropdowns support click/tap, keyboard Tab/Enter/Space, Escape to close and return focus, closing on outside click, and inline expansion on mobile. They follow the existing light/dark colors.

## Administration

Executive Council retains `/admin/committee`. The new `/admin/affiliated-members` and `/admin/associate-members` pages support add/edit/delete, duplicate, draft/publish/archive, photographs, profile/contact fields, search and export. Super administrators and directory managers can edit; other staff retain read-only access. Anonymous visitors see published records only.

There is no database migration and no seed command is required. Restart the backend after pulling so it loads the new module schemas and permissions. The same existing MongoDB connection and Cloudinary upload configuration apply.

For Constitution or Annual Report documents, use Admin → Bulletins & circulars, choose the matching category, attach a PDF and select Published. Actual official documents and approved vision copy are not supplied by this change; the existing introductory copy is retained under Our Vision.

## Validation

Client/server production builds and four unit tests pass (existing-member compatibility, new member validation/permissions, existing role validation and medal ranking). Live MongoDB CRUD and browser interaction testing have not been performed in this update.
