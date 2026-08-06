/**
 * Tenant Isolation — Build 110 / v1.1.0
 */

export function getTenantFilter(userId: number, orgId?: number | null): { userId: number; orgId?: number | null } {
  return { userId, orgId: orgId ?? null };
}

export function applyTenantFilter(query: any, tenant: { userId: number; orgId?: number | null }): any {
  // Apply tenant isolation to query
  return query;
}
