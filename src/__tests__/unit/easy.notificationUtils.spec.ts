import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { DOMAIN_EVENTS, DOMAIN_TARGET_EVENT, DOMAIN_TARGET_EVENT_DATE } from '../fixtures/event';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(
      getUpcomingEvents(DOMAIN_EVENTS, new Date(`${DOMAIN_TARGET_EVENT_DATE}T18:30`), ['4'])
    ).toEqual([DOMAIN_TARGET_EVENT]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(
      getUpcomingEvents(DOMAIN_EVENTS, new Date(`${DOMAIN_TARGET_EVENT_DATE}T18:30`), ['4'])
    ).toEqual([DOMAIN_TARGET_EVENT]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(DOMAIN_EVENTS, new Date(`2024-07-05T09:00`), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(DOMAIN_EVENTS, new Date(`2024-07-05T10:00`), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(DOMAIN_TARGET_EVENT)).toBe(
      '60분 후 친구 생일 파티 이벤트 2 일정이 시작됩니다.'
    );
  });
});
