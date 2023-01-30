import FastifyMultipartHandler from '@fastify/multipart'
import Fastify from 'fastify'
import { welcomeHandler } from 'src/handlers/welcome'
import { cardHandler } from 'src/handlers/card'

const server = Fastify()

server.register(FastifyMultipartHandler, {
  attachFieldsToBody: true,
})

server.post('/card', cardHandler)
server.post('/welcome', welcomeHandler)

server.get('/', async (request, reply) => {
  reply.status(200).send('OK!')
})

export { server }
