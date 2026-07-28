import type { FieldHook } from 'payload'

/**
 * Marker prefix for values that left the API in obfuscated form.
 *
 * The public site checks for it before decoding, so plain values (older records,
 * authenticated previews) keep working unchanged.
 */
export const PUBLIC_ENCODING_PREFIX = 'enc1:'

/**
 * UTF-8 -> base64 -> reversed string.
 *
 * This is deliberately not cryptography. Contact details on a parish website are
 * public by definition; the goal is only to push a harvester's cost above
 * "regex for @", so a plain string never appears in a public API response.
 */
export function encodeForPublic(value: string): string {
  const base64 = Buffer.from(value, 'utf8').toString('base64')
  return `${PUBLIC_ENCODING_PREFIX}${base64.split('').reverse().join('')}`
}

/**
 * afterRead field hook: obfuscates the value for unauthenticated (public) reads.
 *
 * Logged-in editors keep seeing and editing the plain value in the admin UI.
 */
export const obfuscateForPublic: FieldHook = ({ req, value }) => {
  if (req?.user) return value
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return value
  if (trimmed.startsWith(PUBLIC_ENCODING_PREFIX)) return trimmed

  return encodeForPublic(trimmed)
}
