# Household sharing implementation

This branch adds a Supabase household hook to the existing FreshCart React UI, preserving catalog and recipe features.

## Implemented in source
- Anonymous Supabase sign-in with saved browser session
- Reuse of existing space membership or create new household using `create_shopping_space`
- Invite generation and redemption using `create_space_invitation` and `redeem_space_invitation`
- Household-scoped grocery reads, adds, checks, deletions, clear completed
- Realtime subscription with five-second polling fallback
- Household controls under Settings
- Recovery-code UI and calls to `create_space_recovery_code` / `redeem_space_recovery_code`

## Prerequisites / not yet verified
- Website must be configured with **the same** Supabase project URL and **public** publishable key as Android. Never add service-role keys.
- Database must have `space_members`, `grocery_items`, secure row-level policies and the existing invitation/space functions.
- **Recovery RPC names are placeholders pending confirmation of the Android backend's exact recovery functions.** The recovery buttons cannot work until these names and signatures are aligned with the deployed database.
- Realtime publication and permissions must be configured; polling is a fallback.
- Existing Python endpoints `http://localhost:5000/api/catalog` and `/api/recipe` still require a separate reachable backend.
- Browser list changes are blocked if Supabase is configured but unavailable; this prevents unsynchronized edits being presented as shared.
- Run `npm install` to update the lockfile and `npm run build`, then test on two browsers and Android before merging.
- Existing root-level files were preserved; index.html's entry reference was corrected.
- No live Supabase database settings or secret values were modified.

## Acceptance tests
1. Browser A opens and receives an anonymous identity and household.
2. Browser A generates an invitation, browser B redeems it.
3. Add, check, remove, and clear items on A; verify B and Android receive changes.
4. Refresh both browsers; verify household and list persist.
5. Generate and redeem a valid recovery code once the recovery RPC is confirmed.
6. Verify a browser outside the household cannot read or modify its groceries.
