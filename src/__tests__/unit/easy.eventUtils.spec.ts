import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import {
  DOMAIN_EVENTS,
  DOMAIN_EVENTS_IN_MONTH,
  DOMAIN_EVENTS_IN_WEEK,
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_EVENT_DATE,
  DOMAIN_TARGET_IGNORE_CASE_EVENT,
} from '../fixtures/event';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(
      getFilteredEvents(DOMAIN_EVENTS, '이벤트 2', new Date(DOMAIN_TARGET_EVENT_DATE), 'week')
    ).toEqual([DOMAIN_TARGET_EVENT]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, '', new Date('2024-07-01'), 'week')).toEqual(
      DOMAIN_EVENTS_IN_WEEK
    );
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, '', new Date('2024-07-01'), 'month')).toEqual(
      DOMAIN_EVENTS_IN_MONTH
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(
      getFilteredEvents(DOMAIN_EVENTS, '이벤트', new Date(DOMAIN_TARGET_EVENT_DATE), 'week')
    ).toEqual([DOMAIN_TARGET_EVENT]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, '', new Date('2024-07-01'), 'month')).toEqual(
      DOMAIN_EVENTS_IN_MONTH
    );
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, 'weight', new Date('2024-07-31'), 'week')).toEqual([
      DOMAIN_TARGET_IGNORE_CASE_EVENT,
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, '', new Date('2024-07-01'), 'month')).toEqual(
      DOMAIN_EVENTS_IN_MONTH
    );
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents(DOMAIN_EVENTS, '', new Date('2024-12-01'), 'month')).toEqual([]);
  });
});
