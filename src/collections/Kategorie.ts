import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const Kategorie: CollectionConfig = {
  slug: 'kategorie',
  labels: {
    singular: 'Kategorie',
    plural: 'Kategorie',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web', 'slug'],
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
      name: 'popis',
      label: 'Popis',
      type: 'textarea',
    },
  ],
}
