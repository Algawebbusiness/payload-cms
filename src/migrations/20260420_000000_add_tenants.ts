import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

const DEFAULT_TENANT_SLUG = 'farnosthnojice'
const DEFAULT_TENANT_NAME = 'Farnost Hnojice'

const CONTENT_COLLECTIONS = [
  'bohosluzby',
  'stranky',
  'nastaveni-stranky',
  'blogy',
  'produkty',
  'kategorie',
] as const

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1. Create default tenant (idempotent)
  let tenantId: string

  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: DEFAULT_TENANT_SLUG } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    tenantId = existing.docs[0].id as string
    console.log(`[migration] Tenant already exists: ${tenantId}`)
  } else {
    const created = await payload.create({
      collection: 'tenants',
      data: { nazev: DEFAULT_TENANT_NAME, slug: DEFAULT_TENANT_SLUG, aktivni: true },
      overrideAccess: true,
    })
    tenantId = created.id as string
    console.log(`[migration] Created tenant: ${tenantId}`)
  }

  // 2. Backfill weby
  const weby = await payload.find({
    collection: 'weby',
    limit: 0,
    overrideAccess: true,
  })

  for (const web of weby.docs) {
    if (!web.tenant) {
      await payload.update({
        collection: 'weby',
        id: web.id as string,
        data: { tenant: tenantId },
        overrideAccess: true,
      })
    }
  }
  console.log(`[migration] Backfilled ${weby.docs.length} weby`)

  // 3. Backfill content collections via web → tenant
  for (const collSlug of CONTENT_COLLECTIONS) {
    const docs = await payload.find({
      collection: collSlug as any,
      limit: 0,
      overrideAccess: true,
    })

    let updated = 0
    for (const doc of docs.docs) {
      if (doc.tenant) continue

      let webTenantId: string | null = null

      if (doc.web) {
        const webId = typeof doc.web === 'object' ? (doc.web as any).id : doc.web
        try {
          const webDoc = await payload.findByID({
            collection: 'weby',
            id: webId,
            overrideAccess: true,
          })
          webTenantId = webDoc.tenant
            ? typeof webDoc.tenant === 'object'
              ? String((webDoc.tenant as any).id)
              : String(webDoc.tenant)
            : tenantId
        } catch {
          webTenantId = tenantId
        }
      } else {
        webTenantId = tenantId
      }

      await payload.update({
        collection: collSlug as any,
        id: doc.id as string,
        data: { tenant: webTenantId },
        overrideAccess: true,
      })
      updated++
    }
    console.log(`[migration] ${collSlug}: backfilled ${updated}/${docs.docs.length}`)
  }

  // 4. Backfill media (no web relation — assign all without tenant to default)
  const media = await payload.find({
    collection: 'media',
    limit: 0,
    overrideAccess: true,
  })

  let mediaUpdated = 0
  for (const item of media.docs) {
    if (!item.tenant) {
      await payload.update({
        collection: 'media',
        id: item.id as string,
        data: { tenant: tenantId },
        overrideAccess: true,
      })
      mediaUpdated++
    }
  }
  console.log(`[migration] media: backfilled ${mediaUpdated}/${media.docs.length}`)

  // 5. Assign existing users to default tenant with superadmin role
  const users = await payload.find({
    collection: 'users',
    limit: 0,
    overrideAccess: true,
  })

  let usersUpdated = 0
  for (const user of users.docs) {
    if (!user.role) {
      await payload.update({
        collection: 'users',
        id: user.id as string,
        data: { role: 'superadmin', tenants: [tenantId] },
        overrideAccess: true,
      })
      usersUpdated++
    }
  }
  console.log(`[migration] users: assigned ${usersUpdated}/${users.docs.length} to default tenant as superadmin`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('[migration] down: tenant fields left in place (safe to re-run up)')
}
