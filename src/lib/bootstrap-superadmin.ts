import type { Payload } from 'payload'

/**
 * Promotes the first-created user to superadmin when no superadmin exists.
 *
 * The role and tenants fields are only writable by a superadmin
 * (`src/collections/Users.ts`), which locks a fresh instance out of itself: you
 * need a superadmin to appoint one. Every collection is tenant-scoped too, so an
 * account with neither role nor tenant sees an empty admin and cannot fix it.
 *
 * Runs on every boot but does nothing once a superadmin exists, so it is safe to
 * leave in place — it only ever repairs the locked-out state.
 */
export async function bootstrapSuperadmin(payload: Payload): Promise<void> {
  try {
    const superadmins = await payload.find({
      collection: 'users',
      where: { role: { equals: 'superadmin' } },
      limit: 1,
      overrideAccess: true,
    })

    if (superadmins.totalDocs > 0) return

    const oldest = await payload.find({
      collection: 'users',
      sort: 'createdAt',
      limit: 1,
      overrideAccess: true,
    })

    const user = oldest.docs[0]
    if (!user) {
      payload.logger.warn('Bootstrap: no superadmin and no users at all; create the first user in the admin.')
      return
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { role: 'superadmin' },
      overrideAccess: true,
    })

    payload.logger.warn(
      `Bootstrap: no superadmin existed, promoted the first-created user (${user.email}) to superadmin.`,
    )
  } catch (error) {
    // Never let bootstrap take the CMS down; a failure here only means the admin
    // stays locked, which is the state we were already in.
    payload.logger.error(`Bootstrap superadmin failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
