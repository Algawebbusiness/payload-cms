import { execFile } from 'child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const SOFFICE_BINARY = process.env.SOFFICE_BINARY || 'soffice'
const CONVERSION_TIMEOUT_MS = Number.parseInt(process.env.DOCX_CONVERSION_TIMEOUT_MS || '', 10) || 30_000

export const DOCX_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

export const DOCX_EXTENSIONS = ['.docx', '.doc']

export class DocxConversionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'DocxConversionError'
  }
}

export function isWordDocument(mimeType?: null | string, filename?: null | string): boolean {
  const normalizedMime = String(mimeType || '')
    .toLowerCase()
    .trim()
  if (DOCX_MIME_TYPES.includes(normalizedMime)) return true

  const normalizedName = String(filename || '').toLowerCase()
  return DOCX_EXTENSIONS.some((extension) => normalizedName.endsWith(extension))
}

/** Replaces a Word document's extension with `.pdf`. */
export function pdfFilenameFor(filename: string): string {
  const base = filename.replace(/\.(docx|doc)$/i, '')
  return `${base || 'tydenni-zpravodaj'}.pdf`
}

/**
 * Converts a Word document to PDF using headless LibreOffice.
 *
 * Each call gets its own `-env:UserInstallation` profile in a temp directory.
 * Without it, a second concurrent conversion silently fails on the locked
 * default profile.
 *
 * @throws {DocxConversionError} when LibreOffice fails, times out, or produces no PDF.
 */
export async function docxToPdf(input: Buffer, filename: string): Promise<Buffer> {
  if (!input?.length) {
    throw new DocxConversionError('Word document is empty.')
  }

  assertLooksLikeWordDocument(input)

  const workDir = await mkdtemp(path.join(os.tmpdir(), 'docx-to-pdf-'))

  try {
    const sourcePath = path.join(workDir, sanitizeSourceName(filename))
    const outputDir = path.join(workDir, 'out')
    const profileDir = path.join(workDir, 'profile')

    await writeFile(sourcePath, input)

    try {
      await execFileAsync(
        SOFFICE_BINARY,
        [
          '--headless',
          '--norestore',
          '--nolockcheck',
          `-env:UserInstallation=file://${profileDir}`,
          '--convert-to',
          'pdf',
          '--outdir',
          outputDir,
          sourcePath,
        ],
        { timeout: CONVERSION_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
      )
    } catch (error) {
      throw new DocxConversionError(describeSofficeFailure(error), { cause: error })
    }

    const produced = (await readdir(outputDir).catch(() => [])).filter((name) =>
      name.toLowerCase().endsWith('.pdf'),
    )

    if (produced.length === 0) {
      throw new DocxConversionError(
        'LibreOffice produced no PDF. The document is most likely corrupted or not a Word file.',
      )
    }

    const pdf = await readFile(path.join(outputDir, produced[0]))

    if (!pdf.subarray(0, 4).equals(Buffer.from('%PDF'))) {
      throw new DocxConversionError('Converted file is not a valid PDF.')
    }

    return pdf
  } finally {
    await rm(workDir, { force: true, recursive: true })
  }
}

/** .docx is a ZIP container; legacy .doc is an OLE2 compound file. */
const DOCX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])
const DOC_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0])

/**
 * Rejects anything that is not really a Word document.
 *
 * LibreOffice does not fail on garbage — hand it a text file named `.docx` and
 * it cheerfully renders the raw bytes into a PDF. Without this check a corrupt
 * bulletin would reach the site as a page of gibberish instead of bouncing back
 * to the sender.
 */
function assertLooksLikeWordDocument(input: Buffer): void {
  const header = input.subarray(0, 4)

  if (!header.equals(DOCX_MAGIC) && !header.equals(DOC_MAGIC)) {
    throw new DocxConversionError('File is not a Word document (unexpected file signature).')
  }
}

/**
 * LibreOffice refuses paths with characters it treats as option syntax, so the
 * temp copy gets a conservative name. The output name is derived separately
 * from the original filename.
 */
function sanitizeSourceName(filename: string): string {
  const extension = DOCX_EXTENSIONS.find((candidate) => filename.toLowerCase().endsWith(candidate))
  return `source${extension || '.docx'}`
}

function describeSofficeFailure(error: unknown): string {
  const details = error as { code?: string; killed?: boolean; stderr?: string }

  if (details?.killed) {
    return `Conversion timed out after ${CONVERSION_TIMEOUT_MS} ms.`
  }

  if (details?.code === 'ENOENT') {
    return `LibreOffice binary "${SOFFICE_BINARY}" was not found in the container.`
  }

  const stderr = String(details?.stderr || '').trim()
  return stderr ? `LibreOffice failed: ${stderr}` : 'LibreOffice failed for an unknown reason.'
}
