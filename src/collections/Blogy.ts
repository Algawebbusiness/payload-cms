import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'

export const Blogy: CollectionConfig = {
  slug: 'blogy',
  labels: {
    singular: 'Blog',
    plural: 'Blogy',
  },
  access: {
    read: publicOrTenantRead,
    create: tenantCreate,
    update: tenantWrite,
    delete: tenantWrite,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web', 'tenant', 'datumPublikace', 'updatedAt'],
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
      name: 'nazev',
      label: 'Název',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'perex',
      label: 'Perex',
      type: 'textarea',
    },
    {
      name: 'obsah',
      label: 'Obsah',
      type: 'richText',
      required: true,
    },
    {
      name: 'datumPublikace',
      label: 'Datum publikace',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'kategorie',
      label: 'Kategorie',
      type: 'relationship',
      relationTo: 'kategorie',
      hasMany: true,
    },
    {
      name: 'nahledovyObrazek',
      label: 'Náhledový obrázek',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'SEO title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'SEO description',
          type: 'textarea',
        },
      ],
    },
  ],
}
