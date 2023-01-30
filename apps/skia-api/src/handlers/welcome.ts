import { RouteHandlerMethod } from 'fastify'
import { createWelcomeImage, WelcomeImageDetails } from 'src/api/welcome-image'

export const welcomeHandler: RouteHandlerMethod = async (request, reply) => {
  const details = request.body as WelcomeImageDetails
  const welcomeImage = await createWelcomeImage(details)
  return reply
    .headers({
      'Content-Type': 'image/png',
    })
    .send(welcomeImage)
}
