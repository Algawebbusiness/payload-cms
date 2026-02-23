import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const Weby: CollectionConfig = {
  slug: 'weby',
  labels: {
    singular: 'Web',
    plural: 'Weby',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'domena', 'aktivni'],
  },
  fields: [
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
