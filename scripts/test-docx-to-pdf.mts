/**
 * Checks the docx -> PDF converter against a real LibreOffice install.
 *
 * Run inside the container (or anywhere `soffice` is on PATH):
 *   node --experimental-strip-types scripts/test-docx-to-pdf.mts
 *
 * The repo has no test runner, so this is a standalone script. It doubles as the
 * container smoke test: it fails loudly if LibreOffice is missing or misbehaves.
 *
 * Note on fonts: the diacritics assertion reads the PDF's text layer, which stays
 * correct even when a glyph has no font and renders as a box. Missing fonts in the
 * container therefore have to be confirmed by *looking* at a converted bulletin —
 * this script cannot catch them.
 */
import { execFileSync } from 'child_process'
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

import { DocxConversionError, docxToPdf, isWordDocument, pdfFilenameFor } from '../src/lib/docx-to-pdf.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(here, 'fixtures', 'zpravodaj-fixture.docx')

/** Words with Czech diacritics present in the fixture document. */
const DIACRITICS = ['žluťoučký', 'kůň', 'úpěl', 'ďábelské', 'Neděle']

let failed = 0

function check(ok: boolean, label: string) {
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}`)
  if (!ok) failed++
}

async function expectRejection(label: string, run: () => Promise<unknown>) {
  try {
    await run()
    check(false, label)
  } catch (error) {
    check(error instanceof DocxConversionError, `${label} (${(error as Error).message})`)
  }
}

function skip(label: string) {
  console.log(`SKIP  ${label}`)
}

/**
 * Reads a PDF's text layer via poppler's pdftotext.
 *
 * Returns null when pdftotext is unavailable, so the script degrades to a skip
 * rather than a false failure.
 */
async function extractPdfText(pdf: Buffer): Promise<null | string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'pdftotext-'))
  const pdfPath = path.join(dir, 'out.pdf')

  try {
    await writeFile(pdfPath, pdf)
    return execFileSync('pdftotext', [pdfPath, '-'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  } catch {
    return null
  } finally {
    await rm(dir, { force: true, recursive: true })
  }
}

check(
  isWordDocument('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'x'),
  'detects docx by mime type',
)
check(isWordDocument(null, 'zpravodaj.DOCX'), 'detects docx by extension, case-insensitive')
check(isWordDocument(null, 'stary.doc'), 'detects legacy .doc')
check(!isWordDocument('application/pdf', 'zpravodaj.pdf'), 'does not flag a PDF')
check(!isWordDocument('image/png', 'foto.png'), 'does not flag an image')
check(pdfFilenameFor('tydenni-zpravodaj.docx') === 'tydenni-zpravodaj.pdf', 'renames .docx to .pdf')
check(pdfFilenameFor('a.doc') === 'a.pdf', 'renames .doc to .pdf')

const input = await readFile(FIXTURE)
const started = Date.now()
const pdf = await docxToPdf(input, 'tydenni-zpravodaj.docx')
console.log(`     conversion took ${Date.now() - started} ms, produced ${pdf.length} bytes`)

check(pdf.subarray(0, 4).toString() === '%PDF', 'output carries %PDF magic bytes')
check(pdf.length > 1000, 'output is non-trivial in size')

const text = await extractPdfText(pdf)
if (text === null) {
  skip('Czech diacritics in the text layer (pdftotext not installed)')
} else {
  for (const word of DIACRITICS) {
    check(text.includes(word), `Czech diacritics survive in the text layer: ${word}`)
  }
}

// A locked LibreOffice profile is the classic failure mode under concurrency.
const concurrent = await Promise.all([1, 2, 3].map(() => docxToPdf(input, 'zpravodaj.docx')))
check(
  concurrent.every((buffer) => buffer.subarray(0, 4).toString() === '%PDF'),
  'three concurrent conversions all succeed',
)

await expectRejection('empty buffer is rejected', () => docxToPdf(Buffer.alloc(0), 'prazdny.docx'))
await expectRejection('corrupt document is rejected', () =>
  docxToPdf(Buffer.from('rozhodne to neni word'), 'rozbity.docx'),
)

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILURES`)
process.exit(failed === 0 ? 0 : 1)
