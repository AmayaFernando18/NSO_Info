// Frontend RBAC function identifiers.
// Keep values exactly aligned with backend `RBAC_FUNCTION` constants.
export const RBAC_FUNCTION = {
  NEWS: 'News',
  HERO: 'Hero',
  EVENTS: 'Events',
} as const

// Array variant is used by admin function pickers and union type inference.
export const RBAC_FUNCTIONS = [RBAC_FUNCTION.NEWS, RBAC_FUNCTION.HERO, RBAC_FUNCTION.EVENTS] as const

// Narrow string union derived from canonical constant list.
export type RbacFunctionCode = (typeof RBAC_FUNCTIONS)[number]
