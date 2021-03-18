import { APIGatewayProxyEventHeaders, APIGatewayProxyEventV2 } from 'aws-lambda';

export type Event = APIGatewayProxyEventV2;

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
 * Custom http handler that returns a structured
 * response.
 * @param {HandlerFunction} handle
 * @return {Promise<HttpSuccess | HttpException>}
 */
export const handler = (handle: HandlerFunction) => async (event: Event) => {
  return handle(event).catch(error => {
    return error instanceof HttpException
      ? error
      : new HttpException(500, 'Internal Server Error');
  });
};
