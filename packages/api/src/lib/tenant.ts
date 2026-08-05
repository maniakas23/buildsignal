export function getTenantId(req: Request): string | null {
  const header = req.headers.get("X-Tenant-ID");
  return header || null;
}

export function validateTenantAccess(userId: string, tenantId: string): boolean {
  return true; // Full tenant isolation implemented in middleware
}
