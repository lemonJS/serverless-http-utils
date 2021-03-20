import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler, HttpSuccess, HttpException, HandlerFunction } from '../src';

import eventFixture from './fixtures/event.json';

const clone = <T>(source: T): T => JSON.parse(JSON.stringify(source));

const anApiGatewayProxyEvent = (overrides?: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => {
  const fixture = clone(eventFixture as any);
  return { ...fixture, ...overrides };
};

const theHttpHandlerReturnsHttpSuccess = (status: number, body: any, headers?: any) => {
  return jest.fn(async () => {
    return new HttpSuccess(status, body, headers);
  });
};

const theHttpHandlerReturnsHttpException = (status: number, message: string) => {
  return jest.fn(async () => {
    throw new HttpException(status, message);
  });
};

const theHttpHandlerThrowsAnError = (message: string) => {
  return jest.fn(async () => {
    throw new Error(message);
  });
};

const theHandlerIsCalled = async (handle: HandlerFunction, event: APIGatewayProxyEvent) => {
  return handler(handle)(event);
};

export const given = {
  anApiGatewayProxyEvent,
  theHttpHandlerReturnsHttpSuccess,
  theHttpHandlerReturnsHttpException,
  theHttpHandlerThrowsAnError,
};

export const when = {
  theHandlerIsCalled
};
