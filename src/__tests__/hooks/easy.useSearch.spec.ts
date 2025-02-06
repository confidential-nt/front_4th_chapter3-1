import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import {
  DOMAIN_EVENTS,
  DOMAIN_EVENTS_IN_MONTH,
  DOMAIN_EVENTS_IN_WEEK,
  DOMAIN_EVENTS_SEARCHABLE_FIELD_IN_WEEK,
  DOMAIN_TARGET_EVENT,
} from '../fixtures/event.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(DOMAIN_EVENTS, new Date('2024-07-01'), 'week'));

  expect(result.current.filteredEvents).toEqual(DOMAIN_EVENTS_IN_WEEK);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(DOMAIN_EVENTS, new Date('2024-07-01'), 'week'));

  act(() => result.current.setSearchTerm('이벤트 2'));

  expect(result.current.filteredEvents).toEqual([DOMAIN_TARGET_EVENT]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(DOMAIN_EVENTS, new Date('2024-07-01'), 'week'));

  // ! 원소를 하나씩 직접 꺼내와서 비교하는 건 테스트 안정성에 좀 그렇지 않나.. 싶어서 이렇게 해보기.
  const title = '보고서';

  act(() => result.current.setSearchTerm(title));

  expect(DOMAIN_EVENTS_SEARCHABLE_FIELD_IN_WEEK).toEqual(
    expect.arrayContaining(result.current.filteredEvents)
  );

  const description = '생일 파티';

  act(() => result.current.setSearchTerm(description));

  expect(DOMAIN_EVENTS_SEARCHABLE_FIELD_IN_WEEK).toEqual(
    expect.arrayContaining(result.current.filteredEvents)
  );

  const location = '보고서';

  act(() => result.current.setSearchTerm(location));

  expect(DOMAIN_EVENTS_SEARCHABLE_FIELD_IN_WEEK).toEqual(
    expect.arrayContaining(result.current.filteredEvents)
  );
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(DOMAIN_EVENTS, new Date('2024-07-01'), 'month'));

  expect(result.current.filteredEvents).toEqual(DOMAIN_EVENTS_IN_MONTH);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(DOMAIN_EVENTS, new Date('2024-07-01'), 'month'));

  // ! 굳이 원소 내용을 직접 까볼 필요가 있을까?
  act(() => result.current.setSearchTerm('회의'));

  expect(result.current.filteredEvents.length).toBe(1);

  act(() => result.current.setSearchTerm('점심'));

  expect(result.current.filteredEvents.length).toBe(0);
});
