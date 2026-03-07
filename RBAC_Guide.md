# RBAC Guide

## Overview

This project uses function-based RBAC (Role-Based Access Control).
Each user can have one authority level per function.

Current RBAC functions:
- `News`
- `Hero`

## Single Source of Truth for Functions

RBAC function names are now centralized and must be imported from constants files instead of hardcoded strings.

Backend:
- `backend/config/rbacFunctions.js`

Frontend:
- `frontend/src/constants/rbac.ts`

## Authority Levels

- `E` (Enter): View + Create; can edit only unapproved content in approval workflows
- `C` (Check): View only
- `A` (Approve): View + Approve/Reject
- `M` (Manager): Full access (View, Create, Edit, Delete, Approve/Reject)
- `SuperAdmin`: Full access to all RBAC functions

## Backend Usage

### Constants

`backend/config/rbacFunctions.js`

```javascript
export const RBAC_FUNCTION = Object.freeze({
  NEWS: 'News',
  HERO: 'Hero',
});

export const RBAC_FUNCTIONS = Object.freeze([
  RBAC_FUNCTION.NEWS,
  RBAC_FUNCTION.HERO,
]);
```

### Where It Is Used

- `backend/models/User.js`:
  - `functionPermissions.function` enum uses `RBAC_FUNCTIONS`
- `backend/routes/users.js`:
  - request schema validates `function` via `z.enum(RBAC_FUNCTIONS)`
- `backend/controllers/news.controller.js` and `backend/routes/news.js`:
  - `FUNCTION_NAME` uses `RBAC_FUNCTION.NEWS`
- `backend/controllers/heroSlides.controller.js` and `backend/routes/heroSlides.js`:
  - `FUNCTION_NAME` uses `RBAC_FUNCTION.HERO`
- `backend/utils/rbacHelpers.js`:
  - superadmin function list comes from `RBAC_FUNCTIONS`

## Frontend Usage

### Constants

`frontend/src/constants/rbac.ts`

```ts
export const RBAC_FUNCTION = {
  NEWS: 'News',
  HERO: 'Hero',
} as const

export const RBAC_FUNCTIONS = [RBAC_FUNCTION.NEWS, RBAC_FUNCTION.HERO] as const
```

### Where It Is Used

- `frontend/src/types/index.ts`:
  - `FunctionCode` derives from constants-based type
- `frontend/src/pages/admin/AdminUsersPage.tsx`:
  - function dropdown options use `RBAC_FUNCTIONS`
- `frontend/src/components/admin/AdminLayout.tsx`:
  - route visibility uses `RBAC_FUNCTION.NEWS` and `RBAC_FUNCTION.HERO`
- `frontend/src/pages/admin/AdminNewsPage.tsx`:
  - permission checks use `RBAC_FUNCTION.NEWS`
- `frontend/src/pages/admin/AdminHeroPage.tsx`:
  - permission checks use `RBAC_FUNCTION.HERO`

## Permission Matrix

- `view`: `E`, `C`, `A`, `M`
- `create`: `E`, `M`
- `edit`: `M` (plus `E` only for unapproved items via `canEditUnapproved`)
- `delete`: `M`
- `approve`: `A`, `M`

## Approval Workflow Rules

Applies to `News` and `Hero` modules:
- New items start as pending (`approved: false`)
- Only approvers/managers (`A`/`M`) can approve or reject
- Rejection can include `rejectionReason`
- Any content edit resets approval to pending
- Enter users cannot edit approved items

## Best Practices

- Do not hardcode function names like `'News'` or `'Hero'` in new code.
- Import from RBAC constants files in both backend and frontend.
- When adding a new function:
  1. Add it to `backend/config/rbacFunctions.js`
  2. Add it to `frontend/src/constants/rbac.ts`
  3. Reuse constants in schemas, middleware checks, and UI permission checks
  4. Update this guide and test end-to-end

## Quick Troubleshooting

If a user cannot access a feature:
1. Check DB `functionPermissions` contains the function with the right authority
2. Verify backend route has correct `requireAction(..., FUNCTION_NAME)`
3. Verify frontend permission check uses the same constants function value
4. Confirm user is not blocked by approval-specific edit rules
