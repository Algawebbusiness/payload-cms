import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const Bohosluzby: CollectionConfig = {
  slug: 'bohosluzby',
  labels: {
    singular: 'Bohoslužba',
    plural: 'Bohoslužby',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'web', 'date', 'isActive', 'updatedAt'],
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
      name: 'title',
      label: 'Název bohoslužby',
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
      label: 'PDF zpravodaj',
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
