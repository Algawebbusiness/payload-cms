/**
 * Unit checks for the ingest target registry.
 *
 * Run: node --experimental-strip-types scripts/test-ingest-targets.mts
 */
import { DEFAULT_INGEST_TARGET, deriveTitle, resolveIngestTarget } from '../src/lib/ingest-targets.ts'

let failed = 0
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}`)
  if (!ok) failed++
}

check(resolveIngestTarget('zpravodaj')?.slug === 'zpravodaj', 'resolves zpravodaj')
check(resolveIngestTarget('aktuality')?.slug === 'aktuality', 'resolves aktuality')
check(resolveIngestTarget('zpravodaj')?.attachmentField === 'bulletin', 'zpravodaj attaches to bulletin')
check(resolveIngestTarget('aktuality')?.attachmentField === 'priloha', 'aktuality attaches to priloha')
check(resolveIngestTarget('AKTUALITY')?.slug === 'aktuality', 'target name is case-insensitive')
check(resolveIngestTarget('  zpravodaj  ')?.slug === 'zpravodaj', 'tolerates surrounding space')

// The allowlist is a security boundary: the target arrives in the request body,
// so ingest must not be able to write anywhere else.
check(resolveIngestTarget('users') === null, 'rejects a collection outside the allowlist')
check(resolveIngestTarget('media') === null, 'rejects media')
check(resolveIngestTarget('') === null, 'rejects an empty target')
check(resolveIngestTarget(undefined) === null, 'rejects a missing target')
check(DEFAULT_INGEST_TARGET === 'zpravodaj', 'defaults to zpravodaj for older worker versions')

const target = resolveIngestTarget('aktuality')!
const date = new Date('2026-07-29T08:00:00.000Z')
check(deriveTitle({ date, filename: 'x.pdf', subject: 'Pouť ke sv. Anně', target }) === 'Pouť ke sv. Anně', 'prefers the subject')
check(deriveTitle({ date, filename: 'plakat-pout.pdf', subject: '   ', target }) === 'plakat-pout', 'falls back to the filename without extension')
check(deriveTitle({ date, target }).startsWith('Aktualita '), 'falls back to a prefixed date')
check(
  deriveTitle({ date, target: resolveIngestTarget('zpravodaj')! }).startsWith('Zpravodaj '),
  'uses the zpravodaj prefix',
)

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILURES`)
process.exit(failed === 0 ? 0 : 1)
