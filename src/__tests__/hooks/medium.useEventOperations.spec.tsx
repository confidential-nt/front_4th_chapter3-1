import { ChakraProvider } from '@chakra-ui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { DOMAIN_EVENTS } from '../fixtures/event.ts';

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  // ! '적절하게' 보다... 좀 더 나은 문구는 없을지?
  setupMockHandlerCreation(DOMAIN_EVENTS);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    // 데이터를 비동기적으로 불러오므로 기다려야한다.
    expect(result.current.events).toEqual(DOMAIN_EVENTS);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(DOMAIN_EVENTS);

  const newEvent: Event = {
    id: `${DOMAIN_EVENTS.length + 1}`,
    title: '새 회의',
    date: '2024-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '새 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await waitFor(() => {
    expect(result.current.events).toContainEqual(newEvent);
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  // ! 아놔.. 이렇게 관리 방식이 뒤죽박죽이라니!
  const event: Event = {
    id: '2',
    title: '기존 회의2',
    date: '2024-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  const updatedEvent = {
    ...event,
    title: '기존 회의3',
    endTime: '13:00',
  };

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    const foundEvent = result.current.events.find((e) => e.id === updatedEvent.id);
    expect(foundEvent).toBeDefined();
    expect(foundEvent?.title).toBe('기존 회의3');
    expect(foundEvent?.endTime).toBe('13:00');
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const event: Event = {
    id: '1',
    title: '삭제할 이벤트',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '삭제할 이벤트입니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent(event.id);
  });

  await waitFor(() => {
    const foundEvent = result.current.events.find((e) => e.id === event.id);
    expect(foundEvent).toBeUndefined();
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, {
        status: 500,
      });
    })
  );

  renderHook(() => useEventOperations(false), {
    // 테스트 컴포넌트 안만들고도 테스트할 수 있음!
    wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>,
  });

  const toastMessage = await screen.findByText('이벤트 로딩 실패');
  expect(toastMessage).toBeInTheDocument();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const events: Event[] = [];
  const undefinedEvent: Event = {
    id: '1131231',
    title: '존재하지 않는 이벤트',
    date: '2024-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  };

  // ! server.use 사용할 때도 좀 뒤죽박죽인 느낌...
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      }

      return new HttpResponse(null, { status: 404 });
    })
  );

  const { result } = renderHook(() => useEventOperations(true), {
    // 테스트 컴포넌트 안만들고도 테스트할 수 있음!
    wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>,
  });

  await act(async () => {
    await result.current.saveEvent(undefinedEvent);
  });

  const toastMessage = await screen.findByText('일정 저장 실패');
  expect(toastMessage).toBeInTheDocument();
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const events = [
    {
      id: '1',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('api/events', () => {
      return HttpResponse.json({
        events,
      });
    }),
    http.delete('/api/events/1', () => {
      return new HttpResponse(null, {
        status: 500,
      });
    })
  );

  const { result } = renderHook(() => useEventOperations(false), {
    wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>,
  });

  await act(async () => {
    await result.current.deleteEvent(events[0].id);
  });

  const toastMessage = await screen.findByText('일정 삭제 실패');
  expect(toastMessage).toBeInTheDocument();
});
