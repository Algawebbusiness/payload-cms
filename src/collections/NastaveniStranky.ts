import type { CollectionConfig } from 'payload'

import { isAuthenticated, isPublic } from '../access/isAuthenticated'

export const NastaveniStranky: CollectionConfig = {
  slug: 'nastaveni-stranky',
  labels: {
    singular: 'Nastavení stránky',
    plural: 'Nastavení stránky',
  },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web'],
  },
  fields: [
    {
      name: 'web',
      label: 'Web',
      type: 'relationship',
      relationTo: 'weby',
      required: true,
      index: true,
      unique: true,
    },
    {
      name: 'nazev',
      label: 'Název stránky',
      type: 'text',
      required: true,
    },
    {
      name: 'slogan',
      label: 'Slogan',
      type: 'text',
    },
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      label: 'Favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'kontakt',
      label: 'Kontakt',
      type: 'group',
      fields: [
        {
          name: 'email',
          label: 'E-mail',
          type: 'email',
        },
        {
          name: 'telefon',
          label: 'Telefon',
          type: 'text',
        },
      ],
    },
    {
      name: 'socialniSite',
      label: 'Sociální sítě',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          label: 'Facebook URL',
          type: 'text',
        },
        {
          name: 'instagram',
          label: 'Instagram URL',
          type: 'text',
        },
        {
          name: 'linkedin',
          label: 'LinkedIn URL',
          type: 'text',
        },
      ],
    },
    {
      name: 'paticka',
      label: 'Text patičky',
      type: 'richText',
    },
  ],
}
