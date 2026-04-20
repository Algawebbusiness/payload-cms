import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'

export const Zpravodaj: CollectionConfig = {
  slug: 'zpravodaj',
  labels: {
    singular: 'Zpravodaj',
    plural: 'Zpravodaje',
  },
  access: {
    read: publicOrTenantRead,
    create: tenantCreate,
    update: tenantWrite,
    delete: tenantWrite,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'web', 'tenant', 'date', 'isActive', 'updatedAt'],
  },
  versions: {
    drafts: true,
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
      label: 'Datum a čas',
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
      name: 'bulletin',
      label: 'PDF příloha',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isActive',
      label: 'Zobrazit na webu',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
  ],
}
