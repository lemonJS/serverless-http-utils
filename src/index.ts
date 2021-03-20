import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventPathParameters,
} from 'aws-lambda';

export type Event = {
  path: string;
  method: string;
  headers: APIGatewayProxyEventHeaders;
  query: APIGatewayProxyEventQueryStringParameters;
  params: APIGatewayProxyEventPathParameters,
  body: any;
  session: any;
};

export type HandlerFunction = (event: Event) => Promise<HttpSuccess>;

export class HttpSuccess {
  public statusCode: number;
  public body: string;
  public headers: APIGatewayProxyEventHeaders;

  public constructor(statusCode: number, body: any, headers?: APIGatewayProxyEventHeaders) {
    this.statusCode = statusCode;
    this.body = JSON.stringify(body);
    this.headers = headers || {};
  }
}

export class HttpException extends Error {
  public statusCode: number;
  public body: string;

  public constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.body = JSON.stringify({ error: message });

    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

/**
 * Get the contents of the principleId if it exists
 * @param {APIGatewayProxyEvent} event
 * @return {any}
 */
function getAuthorizerPrinciple(event: APIGatewayProxyEvent): any {
  const { authorizer } = event?.requestContext || {};

  return authorizer
    ? JSON.parse(authorizer['principalId'])
    : null;
}

/**
 * Convert the APIGatewayProxyEvent to an express-like event
 * @param {APIGatewayProxyEvent} event
 * @return {Event}
 */
function createHandlerEvent(event: APIGatewayProxyEvent): Event {
  return {
    path: event.path || '/',
    method: event.httpMethod || 'GET',
    headers: event.headers || {},
    query: event.queryStringParameters || {},
    params: event.pathParameters || {},
    body: event.body ? JSON.parse(event.body) : {},
    session: getAuthorizerPrinciple(event)
  };
}

/**
 * Custom http handler that returns a structured
 * response.
 * @param {HandlerFunction} handle
 * @return {Promise<HttpSuccess | HttpException>}
 */
export const handler = (handle: HandlerFunction) => async (proxyEvent: APIGatewayProxyEvent) => {
  const event = createHandlerEvent(proxyEvent);

  return handle(event).catch(error => {
    return error instanceof HttpException
      ? error
      : new HttpException(500, 'Internal Server Error');
  });
};
