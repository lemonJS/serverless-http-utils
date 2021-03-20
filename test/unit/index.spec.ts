import { HttpSuccess, HttpException } from '../../src';
import { given, when } from '../helpers';

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
      const event = given.anApiGatewayProxyEvent();
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalled();
    });

    it('forwards the path', async () => {
      const event = given.anApiGatewayProxyEvent({ path: '/v1/user' });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/v1/user' })
      );
    });

    it('forwards the method', async () => {
      const event = given.anApiGatewayProxyEvent({ httpMethod: 'PUT' });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('forwards the headers', async () => {
      const event = given.anApiGatewayProxyEvent({ headers: { 'Accept': 'application/json' } });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ headers: { 'Accept': 'application/json' } })
      );
    });

    it('forwards the query params', async () => {
      const event = given.anApiGatewayProxyEvent({ queryStringParameters: { teapot: 'kettle' } });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ query: { teapot: 'kettle' } })
      );
    });

    it('forwards the path params', async () => {
      const event = given.anApiGatewayProxyEvent({ pathParameters: { id: '5' } });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ params: { id: '5' } })
      );
    });

    it('forwards and parses the body if it exists', async () => {
      const event = given.anApiGatewayProxyEvent({ body: JSON.stringify({ 'teapot': 'kettle' }) });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ body: { teapot: 'kettle' } })
      );
    });

    it('forwards an empty object for the body when it does not exist', async () => {
      const event = given.anApiGatewayProxyEvent();
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ body: {} })
      );
    });

    it('forwards and parses the principleId as the session if it exists', async () => {
      const requestContext = { authorizer: { principalId: JSON.stringify({ id: '5' }) } } as any;
      const event = given.anApiGatewayProxyEvent({ requestContext });
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ session: { id: '5' } })
      );
    });

    it('forwards null for the session when the principleId does not exist', async () => {
      const event = given.anApiGatewayProxyEvent();
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, {});

      await when.theHandlerIsCalled(handle, event);

      expect(handle).toHaveBeenCalledWith(
        expect.objectContaining({ session: null })
      );
    });

    it('returns the HttpSuccess class with the correct properties', async () => {
      const event = given.anApiGatewayProxyEvent();
      const handle = given.theHttpHandlerReturnsHttpSuccess(200, { foo: 'bar' });

      const res = await when.theHandlerIsCalled(handle, event);

      expect(res).toBeInstanceOf(HttpSuccess);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"foo":"bar"}');
    });

    describe('when an HttpException is thrown', () => {
      it('returns the HttpException with the correct properties', async () => {
        const event = given.anApiGatewayProxyEvent();
        const handle = given.theHttpHandlerReturnsHttpException(401, 'Unauthorized');

        const res = await when.theHandlerIsCalled(handle, event);

        expect(res).toBeInstanceOf(HttpException);
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual('{"error":"Unauthorized"}');
      });
    });

    describe('when a generic Error is thrown', () => {
      it('converts the Error to be an instance of HttpException', async () => {
        const event = given.anApiGatewayProxyEvent();
        const handle = given.theHttpHandlerThrowsAnError('Unknown error');

        const res = await when.theHandlerIsCalled(handle, event);

        expect(res).toBeInstanceOf(HttpException);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual('{"error":"Internal Server Error"}');
      });
    });
  });
});
