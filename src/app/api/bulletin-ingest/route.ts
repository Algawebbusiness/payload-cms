import configPromise from '@payload-config'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'

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
  const serviceId = readString(formData, 'serviceId')
  const subject = readString(formData, 'subject')
  const sender = readString(formData, 'from')

  const payload = (await getPayload({ config: configPromise })) as any
  const web = await findWebByCode(payload, webCode)

  if (!web?.id) {
    return Response.json({ ok: false, error: `Unknown webCode: ${webCode}` }, { status: 404 })
  }

  const service = serviceId
    ? await findServiceById(payload, serviceId)
    : await findBestService(payload, web.id)

  if (!service?.id) {
    return Response.json(
      { ok: false, error: `No target service found for webCode ${webCode}.` },
      { status: 404 },
    )
  }

  let tempDir = ''

  try {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'payload-bulletin-'))
    const filename = sanitizeFilename(upload.name || defaultFilenameForMimeType(upload.type))
    const tempFilePath = path.join(tempDir, filename)
    const buffer = Buffer.from(await upload.arrayBuffer())

    await writeFile(tempFilePath, buffer)

    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: subject || sender || filename,
      },
      filePath: tempFilePath,
      overrideAccess: true,
    })

    const updatedService = await payload.update({
      collection: 'bohosluzby',
      id: service.id,
      data: {
        bulletin: mediaDoc.id,
      },
      overrideAccess: true,
    })

    return Response.json({
      ok: true,
      webCode,
      serviceId: updatedService.id,
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
    where: {
      kod: {
        equals: webCode,
      },
    },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0] || null
}

async function findServiceById(payload: any, serviceId: string) {
  try {
    return await payload.findByID({
      collection: 'bohosluzby',
      id: serviceId,
      overrideAccess: true,
    })
  } catch {
    return null
  }
}

async function findBestService(payload: any, webId: string) {
  const result = await payload.find({
    collection: 'bohosluzby',
    where: {
      and: [
        {
          web: {
            equals: webId,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    sort: 'date',
    limit: 20,
    overrideAccess: true,
  })

  return pickBestService(result.docs)
}

function pickBestService(services: any[]) {
  if (!Array.isArray(services) || services.length === 0) return null

  const now = Date.now()
  const datedServices = services
    .map((service) => ({ service, ts: toTimestamp(service?.date) }))
    .filter((item) => Number.isFinite(item.ts))

  if (datedServices.length === 0) return services[0]

  const upcoming = datedServices
    .filter((item) => item.ts >= now)
    .sort((a, b) => a.ts - b.ts)

  if (upcoming.length > 0) return upcoming[0].service

  const latestPast = datedServices.sort((a, b) => b.ts - a.ts)[0]
  return latestPast.service
}

function toTimestamp(value?: null | string) {
  if (!value) return Number.NaN
  const date = new Date(value)
  return date.getTime()
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

  return 'tydenni-zpravodaj'
}
