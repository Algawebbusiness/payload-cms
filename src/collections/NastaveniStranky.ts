import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'

export const NastaveniStranky: CollectionConfig = {
  slug: 'nastaveni-stranky',
  labels: {
    singular: 'Nastavení stránky',
    plural: 'Nastavení stránky',
  },
  access: {
    read: publicOrTenantRead,
    create: tenantCreate,
    update: tenantWrite,
    delete: tenantWrite,
  },
  admin: {
    useAsTitle: 'nazev',
    defaultColumns: ['nazev', 'web', 'tenant'],
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
      name: 'historie',
      label: 'Historie farnosti',
      type: 'richText',
    },
    {
      name: 'adresa',
      label: 'Adresa',
      type: 'text',
    },
    {
      name: 'mapEmbed',
      label: 'Mapa (iframe URL nebo embed)',
      type: 'textarea',
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
