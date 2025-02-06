import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true }); // 실제 시스템 시간이 20ms 변경될 때마다 모의 시간이 20ms씩 증가
});

beforeEach(() => {
  expect.hasAssertions();
  vi.setSystemTime(new Date('2024-10-01'));
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
