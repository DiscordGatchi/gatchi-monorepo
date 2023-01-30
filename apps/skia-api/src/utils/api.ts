import { RouteHandlerMethod } from 'fastify'

export const responder =
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
