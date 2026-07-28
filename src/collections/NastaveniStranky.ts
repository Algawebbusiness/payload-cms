import type { CollectionConfig } from 'payload'

import { publicOrTenantRead, tenantCreate, tenantWrite } from '../access/tenantAccess'
import { obfuscateForPublic } from '../hooks/obfuscateForPublic'

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
      name: 'duchovniSprava',
      label: 'Duchovní správa',
      type: 'array',
      labels: {
        singular: 'Osoba',
        plural: 'Osoby',
      },
      admin: {
        description:
          'Kněží a další osoby duchovní správy. Zobrazí se v sekci Kontakt nad adresou.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'jmeno',
          label: 'Jméno',
          type: 'text',
          required: true,
          admin: { description: 'Například: P. Jan Jašek' },
        },
        {
          name: 'funkce',
          label: 'Funkce',
          type: 'text',
          admin: { description: 'Například: farář' },
        },
        {
          name: 'popis',
          label: 'Popis',
          type: 'textarea',
          admin: { description: 'Například: vede duchovní správu farnosti' },
        },
        {
          name: 'email',
          label: 'E-mail',
          type: 'email',
          hooks: { afterRead: [obfuscateForPublic] },
        },
        {
          name: 'telefon',
          label: 'Telefon',
          type: 'text',
          hooks: { afterRead: [obfuscateForPublic] },
        },
      ],
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
          hooks: { afterRead: [obfuscateForPublic] },
        },
        {
          name: 'telefon',
          label: 'Telefon',
          type: 'text',
          hooks: { afterRead: [obfuscateForPublic] },
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
