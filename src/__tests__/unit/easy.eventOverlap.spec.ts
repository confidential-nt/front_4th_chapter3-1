import { INVALID_DATE_MESSAGE } from '../../constant/eventOverlap';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import {
  DOMAIN_EVENTS,
  DOMAIN_INVALID_DATE_TARGET_EVENT,
  DOMAIN_INVALID_TIME_TARGET_EVENT,
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_NOT_OVERLAPPING_NEW_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
  DOMAIN_TARGET_OVERLAPPING_NEW_EVENT,
} from '../fixtures/event';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2024-07-01', '14:30')).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('01-01-2024', '14:30')).toBe(INVALID_DATE_MESSAGE);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('01-01-2024', '30:13')).toBe(INVALID_DATE_MESSAGE);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toBe(INVALID_DATE_MESSAGE);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(DOMAIN_TARGET_EVENT)).toEqual({
      start: new Date('2024-07-01T19:30'),
      end: new Date('2024-07-01T22:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(convertEventToDateRange(DOMAIN_INVALID_DATE_TARGET_EVENT)).toEqual({
      start: INVALID_DATE_MESSAGE,
      end: INVALID_DATE_MESSAGE,
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(convertEventToDateRange(DOMAIN_INVALID_TIME_TARGET_EVENT)).toEqual({
      start: INVALID_DATE_MESSAGE,
      end: new Date('2024-07-01T22:00'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(DOMAIN_TARGET_EVENT, DOMAIN_TARGET_OVERLAPPING_EVENT)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(DOMAIN_TARGET_EVENT, DOMAIN_EVENTS[0])).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const result = findOverlappingEvents(DOMAIN_TARGET_OVERLAPPING_NEW_EVENT, DOMAIN_EVENTS);

    expect(result.length).toBe(2);
    expect(result).toEqual([DOMAIN_TARGET_EVENT, DOMAIN_TARGET_OVERLAPPING_EVENT]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents(DOMAIN_TARGET_NOT_OVERLAPPING_NEW_EVENT, DOMAIN_EVENTS)).toEqual(
      []
    );
  });
});
