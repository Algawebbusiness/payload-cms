import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const Stranky: CollectionConfig = {
  slug: 'stranky',
  labels: {
    singular: 'Stránka',
    plural: 'Stránky',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web', 'slug', 'updatedAt'],
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
