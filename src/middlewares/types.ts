import { RequestHandler } from 'express';

export namespace MiddlewareTypes {
  export type NotFound = RequestHandler;
  export type Error = RequestHandler;
}