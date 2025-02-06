/* eslint-disable no-unused-vars */
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { DOMAIN_EVENTS, DOMAIN_TARGET_EVENT } from './fixtures/event';
import { createNotificationMessage } from '../utils/notificationUtils';

// 시간 관련 기능을 섞어쓰다보면 테스트가 겁나 십각하게 느려질 수 있음...
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const TestComponent = () => {
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [];
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events,
        });
      }),
      http.post('/api/events', async ({ request }) => {
        const event = (await request.json()) as Event;
        const newEvent = { ...event, id: `${events.length + 1}` } as Event;
        events.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      })
    );

    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    render(<TestComponent />);

    await userEvent.type(screen.getByLabelText('제목'), '새로운 event의 타이틀');
    await userEvent.type(screen.getByLabelText('날짜'), '2024-10-05');
    await userEvent.type(screen.getByLabelText('시작 시간'), '13:00');
    await userEvent.type(screen.getByLabelText('종료 시간'), '14:00');
    await userEvent.type(screen.getByLabelText('설명'), '새로운 event에 대한 설명');
    await userEvent.type(screen.getByLabelText('위치'), '서울');
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), '개인');
    await userEvent.click(
      screen.getByRole('button', {
        name: '일정 추가',
      })
    );

    const eventList = screen.getByTestId('event-list'); //! test id보다 더 나은 방법이 있지 않을까...
    const expectedText = await within(eventList).findByText('새로운 event의 타이틀'); // event-list 안에 해당 텍스트가 있는지 확인하는 법
    expect(expectedText).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;

        const updatedEvent = (await request.json()) as Event;
        const index = events.findIndex((event) => event.id === id);

        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      })
    );

    render(<TestComponent />);

    const button = await screen.findByLabelText('Edit event');
    await userEvent.click(button);

    const input = screen.getByLabelText('제목');
    await userEvent.clear(input); // 지워주지 않으면... 합쳐져서 나옴.
    await userEvent.type(input, '수정된 event의 타이틀');
    await userEvent.click(
      screen.getByRole('button', {
        name: '일정 수정',
      })
    );

    const eventList = screen.getByTestId('event-list');
    const expectedText = await within(eventList).findByText('수정된 event의 타이틀');
    expect(expectedText).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = events.findIndex((event) => event.id === id);
        events.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(<TestComponent />);

    const button = await screen.findByLabelText('Delete event');
    await userEvent.click(button);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      const expectedText = within(eventList).queryByText('기존 회의');
      expect(expectedText).toBeNull();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const select = screen.getByLabelText('view');

    await userEvent.selectOptions(select, 'week');

    const weekView = screen.getByTestId('week-view');

    const expectedText = within(weekView).queryByText(events[0].title);
    expect(expectedText).toBeNull();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const select = screen.getByLabelText('view');

    await userEvent.selectOptions(select, 'week');

    const weekView = screen.getByTestId('week-view');

    const expectedText = within(weekView).getByText(events[0].title);
    expect(expectedText).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const monthView = screen.getByTestId('month-view');
    // ! ?? 어떻게 일정이 없다는 걸... 알지?
    const expectedText = within(monthView).queryByText('something');
    expect(expectedText).toBeNull();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const monthView = screen.getByTestId('month-view');

    const expectedText = await within(monthView).findByText(events[0].title);
    expect(expectedText).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01T18:30'));

    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const monthView = screen.getByTestId('month-view');

    const expectedText = within(monthView).getByText('신정');
    expect(expectedText).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const TestComponent = () => {
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '두번째 팀 미팅',
        location: '회의실 c',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '없는 이벤트');

    const eventList = screen.getByTestId('event-list');
    const expectedText = await within(eventList).findByText('검색 결과가 없습니다.');
    expect(expectedText).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const TestComponent = () => {
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '두번째 팀 미팅',
        location: '회의실 c',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    const expectedText = await within(eventList).findByText('팀 회의');
    expect(expectedText).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const TestComponent = () => {
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-18',
        startTime: '09:00',
        endTime: '10:00',
        description: '두번째 팀 미팅',
        location: '회의실 c',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      })
    );

    render(<TestComponent />);

    const searchInput = screen.getByLabelText('일정 검색');
    await userEvent.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    const expectedText = await within(eventList).findByText('팀 회의');
    expect(expectedText).toBeInTheDocument();

    await userEvent.clear(searchInput);

    events.forEach(async (event) => {
      await within(eventList).findByText(event.title);
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const TestComponent = () => {
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-18',
        startTime: '09:00',
        endTime: '10:00',
        description: '두번째 팀 미팅',
        location: '회의실 c',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events,
        });
      }),
      http.post('/api/events', async ({ request }) => {
        const event = (await request.json()) as Event;
        const newEvent = { ...event, id: `${events.length + 1}` } as Event;
        events.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      })
    );

    render(<TestComponent />);

    await userEvent.type(screen.getByLabelText('제목'), '새로운 event의 타이틀');
    await userEvent.type(screen.getByLabelText('날짜'), '2024-10-15');
    await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
    await userEvent.type(screen.getByLabelText('종료 시간'), '14:00');
    await userEvent.type(screen.getByLabelText('설명'), '새로운 event에 대한 설명');
    await userEvent.type(screen.getByLabelText('위치'), '서울');
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), '개인');
    await userEvent.click(
      screen.getByRole('button', {
        name: '일정 추가',
      })
    );

    const expectedText = await screen.findByText('일정 겹침 경고');
    expect(expectedText).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const TestComponent = () => {
      // 또 한번 여기에다가 정의안해주면 컴포넌트 간 상태가 보존됨...ㄷㄷ
      return (
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );
    };

    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-18',
        startTime: '09:00',
        endTime: '10:00',
        description: '두번째 팀 미팅',
        location: '회의실 c',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;

        const updatedEvent = (await request.json()) as Event;
        const index = events.findIndex((event) => event.id === id);

        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      })
    );

    render(<TestComponent />);

    const button = await screen.findAllByLabelText('Edit event');
    await userEvent.click(button[0]);

    const dateInput = screen.getByLabelText('날짜');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2024-10-18');

    await userEvent.click(
      screen.getByRole('button', {
        name: '일정 수정',
      })
    );

    const expectedText = await screen.findByText('일정 겹침 경고');
    expect(expectedText).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2024-10-15T08:50'));

  const TestComponent = () => {
    return (
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };

  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    })
  );

  render(<TestComponent />);

  await act(() => vi.advanceTimersByTime(1000)); // 기다려줘야함;; 그럼 useNotification 에서는 왜 괜찮았던건지....

  const expectedText = await screen.findByText(createNotificationMessage(events[0]));

  expect(expectedText).toBeInTheDocument();
});
