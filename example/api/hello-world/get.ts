import { handler, Event, HttpSuccess, HttpException } from '../../../src';

export const handle = handler(async (event: Event) => {
  const shouldReject = Math.random() < 0.5;

  if (shouldReject) {
    throw new HttpException(500, 'Unlucky!');
  }

  return new HttpSuccess(200, { lucky: true });
});
