import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '../access/tenantAccess'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenants'],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    create: ({ req: { user } }) => Boolean(user) && isSuperAdmin(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isSuperAdmin(user)) return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => Boolean(user) && isSuperAdmin(user),
  },
  fields: [
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Superadmin', value: 'superadmin' },
        { label: 'Správce klienta', value: 'client_admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Prohlížeč', value: 'viewer' },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user) && isSuperAdmin(user),
      },
    },
    {
      name: 'tenants',
      label: 'Tenanti',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
      access: {
        update: ({ req: { user } }) => Boolean(user) && isSuperAdmin(user),
      },
    },
  ],
}
