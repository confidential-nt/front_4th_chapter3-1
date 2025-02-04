import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// events를 바로 사용하는 건 데이터 오염 가능성 있음.
const mockEvents = [...events] as Event[];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    const newEvent = { ...event, id: `${mockEvents.length + 1}` } as Event;
    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = mockEvents.findIndex((event) => event.id === id);

    mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
    return HttpResponse.json(mockEvents[index]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = mockEvents.findIndex((event) => event.id === id);
    mockEvents.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
