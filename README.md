# Serverless HTTP Utils

A small utils package that simplifies REST handlers inside Serverless APIs.

### Requirements
- A Serverless API using node v14 or later
- ApiGateway configured to use the v2 event

### Installation
```shell
$ yarn add @lemonjs/serverless-http-utils
or
$ npm install @lemonjs/serverless-http-utils
```

### Usage
Wrap any exported Serverless handler with the `handler` method and return a new instance of `HttpSuccess`:
```typescript
import { handler, Event, HttpSuccess } from '@lemonjs/serverless-http-utils';

export const handle = handler((event: Event) => {
  return new HttpSuccess(200, { hello: 'world' });
});
```
Errors can be thrown anywhere by throwing a `HttpException`:
```typescript
import { HttpException } from '@lemonjs/serverless-http-utils';

async function authenticate(token: string): void {
  if (!token) {
    throw new HttpException(401, 'Token not provided');
  }
}
```
See the `example/` folder for more info.

### Contributing
Clone the repository:
```shell
$ git clone git@github.com:lemonJS/serverless-http-utils.git
```
Install dependencies:
```shell
$ yarn install
```
Run the tests:
```shell
$ yarn test
```
