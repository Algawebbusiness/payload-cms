import type { Access } from 'payload'

export const isSuperAdmin = (user: any): boolean => user?.role === 'superadmin'

export const getUserTenantIds = (user: any): string[] => {
  if (!user?.tenants?.length) return []
  return user.tenants.map((t: any) =>
    typeof t === 'object' && t !== null ? String(t.id) : String(t),
  )
}

// Public (frontend) can read; authenticated users are scoped to their tenants
export const publicOrTenantRead: Access = ({ req: { user } }) => {
  if (!user) return true
  if (isSuperAdmin(user)) return true
  const ids = getUserTenantIds(user)
  return ids.length > 0 ? { tenant: { in: ids } } : false
}

// Authenticated-only read, scoped to tenant
export const tenantRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  const ids = getUserTenantIds(user)
  return ids.length > 0 ? { tenant: { in: ids } } : false
}

// Create: user must assign a tenant they belong to (viewers denied)
export const tenantCreate: Access = ({ req: { user }, data }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if ((user as any).role === 'viewer') return false
  const ids = getUserTenantIds(user)
  const docTenantId = data?.tenant
    ? typeof data.tenant === 'object'
      ? String(data.tenant.id)
      : String(data.tenant)
    : ''
  return docTenantId.length > 0 && ids.includes(docTenantId)
}

// Update/delete: constrained to documents in user's tenants (viewers denied)
export const tenantWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if ((user as any).role === 'viewer') return false
  const ids = getUserTenantIds(user)
  return ids.length > 0 ? { tenant: { in: ids } } : false
}

export const superAdminOnly: Access = ({ req: { user } }) =>
  Boolean(user) && isSuperAdmin(user)
