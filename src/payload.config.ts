import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cs } from '@payloadcms/translations/languages/cs'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Weby } from './collections/Weby'
import { Kategorie } from './collections/Kategorie'
import { Stranky } from './collections/Stranky'
import { Bohosluzby } from './collections/Bohosluzby'
import { Blogy } from './collections/Blogy'
import { Produkty } from './collections/Produkty'
import { NastaveniStranky } from './collections/NastaveniStranky'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const defaultAllowedOrigins = [
  'https://payload-cms.sliplane.app',
  'https://farnosthnojice.cz',
  'https://www.farnosthnojice.cz',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

const extraAllowedOrigins = (process.env.PAYLOAD_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...extraAllowedOrigins])]

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'cs',
    supportedLanguages: {
      cs,
      en,
    },
  },
  collections: [
    Users,
    Media,
    Weby,
    Kategorie,
    Stranky,
    Bohosluzby,
    Blogy,
    Produkty,
    NastaveniStranky,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: allowedOrigins,
  csrf: allowedOrigins,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [],
})
