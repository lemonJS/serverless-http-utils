import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler, HttpSuccess, HttpException } from '../../src';

describe('HTTP utils', () => {
  describe('HttpSuccess', () => {
    it('sets the status code', () => {
      const res = new HttpSuccess(200, {});
      expect(res.statusCode).toEqual(200);
    });

    it('sets the stringified body', () => {
      const res = new HttpSuccess(200, { foo: 'bar' });
      expect(res.body).toEqual('{"foo":"bar"}');
    });

    it('sets the headers as an empty object when none are provided', () => {
      const res = new HttpSuccess(200, {});
      expect(res.headers).toEqual({});
    });

    it('sets the headers when they are provided', () => {
      const res = new HttpSuccess(200, {}, { 'content-type': 'application/json' });
      expect(res.headers).toEqual({ 'content-type': 'application/json' });
    });
  });

  describe('HttpFailure', () => {
    it('sets the status code', () => {
      const error = new HttpException(401, 'Unauthorized');
      expect(error.statusCode).toEqual(401);
    });

    it('sets the message as a stringified object', () => {
      const error = new HttpException(401, 'Unauthorized');
      expect(error.body).toEqual('{"error":"Unauthorized"}');
    });

    describe('when it is thrown', () => {
      it('is an instance of an error', () => {
        expect(() => {
          throw new HttpException(500, 'Internal Server Error');
        }).toThrowError('Internal Server Error');
      });
    });
  });

  describe('handler', () => {
    it('calls the provided handle with the event', async () => {
      const event = {} as APIGatewayProxyEventV2;
      const handle = jest.fn(async () => {
        return new HttpSuccess(200, { foo: 'bar' });
      });

      await handler(handle)(event);

      expect(handle).toHaveBeenCalledWith(event);
    });

    it('returns the HttpSuccess class with the correct properties', async () => {
      const event = {} as APIGatewayProxyEventV2;
      const handle = jest.fn(async () => {
        return new HttpSuccess(200, { foo: 'bar' });
      });

      const res = await handler(handle)(event);

      expect(res).toBeInstanceOf(HttpSuccess);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"foo":"bar"}');
    });

    describe('when an HttpException is thrown', () => {
      it('returns the HttpException with the correct properties', async () => {
        const event = {} as APIGatewayProxyEventV2;
        const handle = jest.fn(async () => {
          throw new HttpException(401, 'Unauthorized');
        });

        const res = await handler(handle)(event);

        expect(res).toBeInstanceOf(HttpException);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('{"error":"Unauthorized"}');
      });
    });

    describe('when a generic Error is thrown', () => {
      it('converts the Error to be an instance of HttpException', async () => {
        const event = {} as APIGatewayProxyEventV2;
        const handle = jest.fn(async () => {
          throw new Error('Unknown error');
        });

        const res = await handler(handle)(event);

        expect(res).toBeInstanceOf(HttpException);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual('{"error":"Internal Server Error"}');
      });
    });
  });
});
