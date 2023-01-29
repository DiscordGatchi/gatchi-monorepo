import { getConfigValue } from 'utils'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import FastifyMultipartHandler, { MultipartValue } from '@fastify/multipart'
import Fastify, { RouteHandlerMethod } from 'fastify'
import { createCard } from 'src/api/canvas'
import { parseJson } from 'src/utils/parse'
import { CardDetails } from 'src/lib/types'

const server = Fastify()

server.register(FastifyMultipartHandler, {
  attachFieldsToBody: true,
})

const secrets = {
  endpoint: getConfigValue<string>('AWS_ENDPOINT', true),
  bucket: getConfigValue<string>('AWS_BUCKET', true),
  region: getConfigValue<string>('AWS_REGION', true),
  accessKeyId: getConfigValue<string>('AWS_ACCESS_KEY_ID', true),
  secretAccessKey: getConfigValue<string>('AWS_SECRET_ACCESS_KEY', true),
}

const responder =
  (reply: Parameters<RouteHandlerMethod>['1']) =>
  (
    status: number,
    body: object | string,
    headers?: Record<string, string | number>,
  ) =>
    reply
      .status(status)
      .headers(headers || {})
      .send(typeof body === 'object' ? JSON.stringify(body) : body)

const handler: RouteHandlerMethod = async (request, reply) => {
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

server.post('/', handler)

server.get('/help', (req, res) => {
  const sampleCardDetails: Record<keyof CardDetails, string> = {
    cin: 'CIN-00Y00Cxxxxxxxxxxxx',
    icon: 'collection-name/icon.ext',
    isSuperShiny: 'The "SS" information on the card',
    isDirty: 'Whether the card is dirty or not',
    name: 'The name of the thing on the card',
    powerLevel: 'The power level of the thing on the card',
    totalPrintedCount: 'The total number of cards printed',
    currentPrintNumber: 'The current print number of the card',
  }

  res.send(sampleCardDetails)
})

export { server }
