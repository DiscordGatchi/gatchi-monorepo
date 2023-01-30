import { RouteHandlerMethod } from 'fastify'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MultipartValue } from '@fastify/multipart'
import { CardDetails } from 'src/lib/types'
import { parseJson } from 'src/utils/parse'
import { createCard } from 'src/api/canvas'
import { getConfigValue } from 'utils'
import { secrets } from 'src/utils/secrets'
import { responder } from 'src/utils/api'

export const cardHandler: RouteHandlerMethod = async (request, reply) => {
  const body = request.body as Record<string, unknown>
  const respond = responder(reply)

  const client = new S3Client({
    region: secrets.region,
    endpoint: `https://${secrets.endpoint}`,
    credentials: {
      accessKeyId: secrets.accessKeyId!,
      secretAccessKey: secrets.secretAccessKey!,
    },
  })

  if (!body) {
    return respond(400, { message: 'Missing body' })
  }

  const detailsField = (body.details as MultipartValue<CardDetails | string>)
    .value
  const details =
    typeof detailsField === 'string'
      ? (parseJson(detailsField) as CardDetails)
      : detailsField

  if (!details) return respond(400, { message: 'Missing details' })
  if (typeof details !== 'object')
    return respond(400, { message: 'Malformed "details" field' })

  const metadata = {
    'x-amz-meta-cin': details.cin,
    'x-amz-meta-current-print-number': details.currentPrintNumber.toString(),
    'x-amz-meta-total-printed-count': details.totalPrintedCount.toString(),
    'x-amz-meta-power-level': details.powerLevel.toString(),
    'x-amz-meta-is-dirty': details.isDirty.toString(),
    'x-amz-meta-is-super-shiny': details.isSuperShiny.toString(),
  }

  console.time('card-make')
  const card = await createCard(details)
  console.timeEnd('card-make')

  const newFileName = `${details.cin}.png`

  if (!card) {
    return respond(500, { message: 'Error creating card' })
  }

  const responseUrlBase =
    getConfigValue<string>('CUSTOM_DOMAIN') ??
    `${secrets.bucket}.${secrets.endpoint}`

  console.time('card-upload')
  await client.send(
    new PutObjectCommand({
      Bucket: secrets.bucket,
      Key: `cards/${newFileName}`,
      Body: card,
      ACL: 'public-read',
      ContentType: 'image/png',
      ContentLength: card.byteLength,
      Metadata: metadata,
    }),
  )
  console.timeEnd('card-upload')

  return respond(200, `https://${responseUrlBase}/cards/${newFileName}`)
}
