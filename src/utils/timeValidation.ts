import { INVALID_TIME_ERROR } from '../constant/error';

export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  if (startDate >= endDate) {
    // ! throw Error vs 이런 식의 에러 메시지
    return INVALID_TIME_ERROR;
  }

  return { startTimeError: null, endTimeError: null };
}
