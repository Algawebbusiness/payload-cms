import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'

export const Weby: CollectionConfig = {
  slug: 'weby',
  labels: {
    singular: 'Web',
    plural: 'Weby',
  },
  access: {
    read: publicOrTenantRead,
    create: tenantCreate,
    update: tenantWrite,
    delete: tenantWrite,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'domena', 'tenant', 'aktivni'],
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
      name: 'nazev',
      label: 'Název',
      type: 'text',
      required: true,
    },
    {
      name: 'kod',
      label: 'Kód webu',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'domena',
      label: 'Doména',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'vychoziJazyk',
      label: 'Výchozí jazyk',
      type: 'select',
      required: true,
      defaultValue: 'cs',
      options: [
        { label: 'Čeština', value: 'cs' },
        { label: 'Slovenština', value: 'sk' },
        { label: 'Angličtina', value: 'en' },
        { label: 'Němčina', value: 'de' },
      ],
    },
    {
      name: 'aktivni',
      label: 'Aktivní',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'popis',
      label: 'Popis',
      type: 'textarea',
    },
  ],
}
