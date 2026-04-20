import type { CollectionConfig } from 'payload'

import { getUserTenantIds, isSuperAdmin, superAdminOnly } from '../access/tenantAccess'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'Tenant',
    plural: 'Tenanti',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      const ids = getUserTenantIds(user)
      return ids.length > 0 ? { id: { in: ids } } : false
    },
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'slug', 'aktivni'],
  },
  fields: [
    {
      name: 'nazev',
      label: 'Název',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug / Kód',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'aktivni',
      label: 'Aktivní',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
