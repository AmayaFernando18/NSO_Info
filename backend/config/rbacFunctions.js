// Central RBAC function keys used across backend route guards, model enums,
// and validation schemas. Keeping this list in one place prevents string drift
// (for example, 'Hero' vs 'HERO' vs legacy names) that can silently break access checks.
export const RBAC_FUNCTION = Object.freeze({
  NEWS: 'News',
  HERO: 'Hero',
});

// Ordered list form is consumed by schema enums (Mongoose/Zod).
// Add new functions here first, then wire route/controller checks.
export const RBAC_FUNCTIONS = Object.freeze([
  RBAC_FUNCTION.NEWS,
  RBAC_FUNCTION.HERO,
]);
