import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const Produkty: CollectionConfig = {
  slug: 'produkty',
  labels: {
    singular: 'Produkt',
    plural: 'Produkty',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web', 'cena', 'mena', 'skladem'],
  },
  versions: {
    drafts: true,
  },
  fields: [
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
      name: 'sku',
      label: 'SKU',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'kratkyPopis',
      label: 'Krátký popis',
      type: 'textarea',
    },
    {
      name: 'popis',
      label: 'Popis',
      type: 'richText',
    },
    {
      name: 'cena',
      label: 'Cena',
      type: 'number',
      min: 0,
      required: true,
    },
    {
      name: 'mena',
      label: 'Měna',
      type: 'select',
      required: true,
      defaultValue: 'CZK',
      options: [
        { label: 'CZK', value: 'CZK' },
        { label: 'EUR', value: 'EUR' },
        { label: 'USD', value: 'USD' },
      ],
    },
    {
      name: 'skladem',
      label: 'Skladem',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'kategorie',
      label: 'Kategorie',
      type: 'relationship',
      relationTo: 'kategorie',
      hasMany: true,
    },
    {
      name: 'hlavniObrazek',
      label: 'Hlavní obrázek',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'galerie',
      label: 'Galerie',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
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
