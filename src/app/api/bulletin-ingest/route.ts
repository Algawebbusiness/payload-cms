import configPromise from '@payload-config'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'

import { DocxConversionError, docxToPdf, isWordDocument, pdfFilenameFor } from '../../../lib/docx-to-pdf'
import { DEFAULT_INGEST_TARGET, deriveTitle, resolveIngestTarget } from '../../../lib/ingest-targets'

export const dynamic = 'force-dynamic'

const INGEST_HEADER = 'x-bulletin-ingest-token'
const DEFAULT_WEB_CODE = 'farnosthnojice'

export async function POST(request: Request) {
  const expectedToken = process.env.BULLETIN_INGEST_TOKEN || ''
  const providedToken = request.headers.get(INGEST_HEADER) || ''

  if (!expectedToken) {
    return Response.json({ ok: false, error: 'BULLETIN_INGEST_TOKEN is not configured.' }, { status: 500 })
  }

  if (providedToken !== expectedToken) {
    return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const formData = await request.formData()
  const upload = formData.get('file')

  if (!(upload instanceof File)) {
    return Response.json({ ok: false, error: 'Missing file upload.' }, { status: 400 })
  }

  const webCode = readString(formData, 'webCode') || DEFAULT_WEB_CODE
  const target = resolveIngestTarget(readString(formData, 'target') || DEFAULT_INGEST_TARGET)
  const subject = readString(formData, 'subject')
  const sender = readString(formData, 'from')

  if (!target) {
    return Response.json({ ok: false, error: 'Unknown ingest target.' }, { status: 400 })
  }

  const payload = (await getPayload({ config: configPromise })) as any
  const web = await findWebByCode(payload, webCode)

  if (!web?.id) {
    return Response.json({ ok: false, error: `Unknown webCode: ${webCode}` }, { status: 404 })
  }

  let tempDir = ''

  try {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'payload-bulletin-'))
    let filename = sanitizeFilename(upload.name || defaultFilenameForMimeType(upload.type))
    let buffer: Buffer = Buffer.from(await upload.arrayBuffer())

    // Word documents are converted up front, so everything downstream — media,
    // the record's attachment and the public site — only ever sees a PDF.
    if (isWordDocument(upload.type, filename)) {
      try {
        buffer = await docxToPdf(buffer, filename)
        filename = pdfFilenameFor(filename)
      } catch (error) {
        const reason =
          error instanceof DocxConversionError ? error.message : 'Word document could not be converted to PDF.'
        return Response.json({ ok: false, error: reason }, { status: 422 })
      }
    }

    const tempFilePath = path.join(tempDir, filename)
    await writeFile(tempFilePath, buffer)

    const webTenantId = web.tenant
      ? typeof web.tenant === 'object'
        ? web.tenant.id
        : web.tenant
      : undefined

    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: subject || sender || filename,
        ...(webTenantId ? { tenant: webTenantId } : {}),
      },
      filePath: tempFilePath,
      overrideAccess: true,
    })

    // One e-mail, one record. Overwriting an existing record left no history,
    // which is why the site had to guess the current bulletin from the media
    // collection and why an archive had nothing to list.
    const now = new Date()
    const record = await payload.create({
      collection: target.slug,
      data: {
        title: deriveTitle({ date: now, filename: upload.name, subject, target }),
        date: now.toISOString(),
        web: web.id,
        isActive: true,
        [target.attachmentField]: mediaDoc.id,
        // Without this a draft-enabled collection stores the record as a draft,
        // and public reads skip drafts — the bulletin would never reach the site.
        ...(target.usesDrafts ? { _status: 'published' } : {}),
        ...(webTenantId ? { tenant: webTenantId } : {}),
      },
      overrideAccess: true,
    })

    return Response.json({
      ok: true,
      target: target.slug,
      webCode,
      recordId: record.id,
      mediaId: mediaDoc.id,
      filename: mediaDoc.filename,
      url: mediaDoc.url,
    })
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
    }
  }
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

async function findWebByCode(payload: any, webCode: string) {
  const result = await payload.find({
    collection: 'weby',
    where: { kod: { equals: webCode } },
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] || null
}

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return cleaned || 'tydenni-zpravodaj'
}

function defaultFilenameForMimeType(mimeType: string) {
  const normalized = String(mimeType || '').toLowerCase()
  if (normalized.includes('pdf')) return 'tydenni-zpravodaj.pdf'
  if (normalized.includes('png')) return 'tydenni-zpravodaj.png'
  if (normalized.includes('webp')) return 'tydenni-zpravodaj.webp'
  if (normalized.includes('gif')) return 'tydenni-zpravodaj.gif'
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'tydenni-zpravodaj.jpg'
  if (normalized.includes('wordprocessingml')) return 'tydenni-zpravodaj.docx'
  if (normalized.includes('msword')) return 'tydenni-zpravodaj.doc'
  return 'tydenni-zpravodaj'
}
