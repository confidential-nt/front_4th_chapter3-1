import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import {
  DOMAIN_EVENTS,
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
} from '../fixtures/event.ts';
import { parseHM } from '../utils.ts';

// ! 위에서 언급된 유틸들을 어디서 사용할 수 있을까?

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers(); // 타이머 원래대로 복구
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(DOMAIN_EVENTS));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2024-07-01T18:30'));

  const { result } = renderHook(() => useNotifications(DOMAIN_EVENTS));

  act(() => vi.advanceTimersByTime(1000)); // ! 왜 act 안에 넣어야 제대로 작동하는가?

  const newNotification = result.current.notifications.find(
    (notification) => notification.id === DOMAIN_TARGET_EVENT.id
  );

  expect(newNotification).toBeDefined();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date('2024-07-01T18:30'));

  const { result } = renderHook(() => useNotifications(DOMAIN_EVENTS));

  act(() => vi.advanceTimersByTime(1000));

  act(() => result.current.removeNotification(0));

  const deletedNotification = result.current.notifications.find(
    (notification) => notification.id === DOMAIN_TARGET_EVENT.id
  );

  expect(deletedNotification).toBeUndefined();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2024-07-01T18:15'));

  const { result } = renderHook(() => useNotifications(DOMAIN_EVENTS));

  act(() => vi.advanceTimersByTime(1000));

  const newNotification = result.current.notifications.find(
    (notification) => notification.id === DOMAIN_TARGET_OVERLAPPING_EVENT.id
  );
  expect(newNotification).toBeDefined();

  vi.setSystemTime(new Date('2024-07-01T18:30'));

  act(() => vi.advanceTimersByTime(1000));

  const notificationCount = result.current.notifications.filter(
    (notification) => notification.id === DOMAIN_TARGET_OVERLAPPING_EVENT.id
  );

  expect(notificationCount.length).toBe(1);
});
