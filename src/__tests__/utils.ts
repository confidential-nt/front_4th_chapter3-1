import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const assertDatesMatch = (dates: Date[], expectedDates: Date[]) => {
  dates.forEach((date: Date, index: number) => {
    expect(date.toISOString().split('T')[0]).toBe(expectedDates[index].toISOString().split('T')[0]);
  });
};
