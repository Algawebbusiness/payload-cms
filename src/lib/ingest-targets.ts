/**
 * Collections the e-mail ingest endpoint is allowed to write to.
 *
 * This is a security boundary, not a convenience map: the target arrives in the
 * request body, so anything outside this allowlist must be refused.
 */
export type IngestTarget = {
  slug: 'aktuality' | 'zpravodaj'
  attachmentField: 'bulletin' | 'priloha'
  fallbackTitlePrefix: string
  /**
   * Whether the collection has `versions.drafts` enabled.
   *
   * On a draft-enabled collection Payload creates records as drafts, and public
   * reads skip drafts entirely — an ingested bulletin would never reach the site.
   * Ingest therefore has to publish explicitly.
   */
  usesDrafts: boolean
}

const TARGETS: Record<string, IngestTarget> = {
  zpravodaj: {
    slug: 'zpravodaj',
    attachmentField: 'bulletin',
    fallbackTitlePrefix: 'Zpravodaj',
    usesDrafts: true,
  },
  aktuality: {
    slug: 'aktuality',
    attachmentField: 'priloha',
    fallbackTitlePrefix: 'Aktualita',
    usesDrafts: false,
  },
}

/** Used when a worker predating the Aktuality rollout sends no target. */
export const DEFAULT_INGEST_TARGET = 'zpravodaj'

export function resolveIngestTarget(name: null | string | undefined): IngestTarget | null {
  const normalized = String(name || '')
    .trim()
    .toLowerCase()
  if (!normalized) return null
  return TARGETS[normalized] || null
}

/**
 * Names the record from whatever the e-mail offered: subject first, then the
 * attachment filename, then a dated fallback so a record is never untitled.
 */
export function deriveTitle({
  date,
  filename,
  subject,
  target,
}: {
  date: Date
  filename?: string
  subject?: string
  target: IngestTarget
}): string {
  const trimmedSubject = String(subject || '').trim()
  if (trimmedSubject) return trimmedSubject

  const baseName = String(filename || '')
    .trim()
    .replace(/\.[^.]+$/, '')
  if (baseName) return baseName

  const formatted = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date)

  return `${target.fallbackTitlePrefix} ${formatted}`
}
