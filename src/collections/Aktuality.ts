import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'

export const Aktuality: CollectionConfig = {
  slug: 'aktuality',
  labels: {
    singular: 'Aktualita',
    plural: 'Aktuality',
  },
  access: {
    read: publicOrTenantRead,
    create: tenantCreate,
    update: tenantWrite,
    delete: tenantWrite,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'web', 'date', 'isActive', 'updatedAt'],
  },
  fields: [
    {
      name: 'tenant',
      label: 'Tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
    },
    {
      name: 'web',
      label: 'Web',
      type: 'relationship',
      relationTo: 'weby',
      required: true,
      index: true,
    },
    {
      name: 'title',
      label: 'Název',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      label: 'Datum',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'description',
      label: 'Poznámka',
      type: 'richText',
    },
    {
      name: 'priloha',
      label: 'Příloha (PDF nebo obrázek)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isActive',
      label: 'Zobrazit na webu',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Vypnutím se aktualita přesune z titulní strany do archivu.',
      },
    },
  ],
}
