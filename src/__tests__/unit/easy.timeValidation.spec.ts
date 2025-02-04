import { INVALID_TIME_ERROR } from '../../constant/error';
import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('17:30', '09:30')).toEqual(INVALID_TIME_ERROR);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('09:30', '09:30')).toEqual(INVALID_TIME_ERROR);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('09:30', '17:30')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '17:30')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('09:30', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('09:30', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
