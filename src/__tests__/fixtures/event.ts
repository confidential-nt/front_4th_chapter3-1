import { Event } from '../../types/event';

// ! 안정되지 않은 픽스쳐에 의한 테스트 수정 발생 방지하는 법은?

export const DOMAIN_TARGET_EVENT: Event = {
  id: '3',
  title: '친구 생일 파티 이벤트 2',
  date: '2024-07-01',
  startTime: '19:30',
  endTime: '22:00',
  description: '친구 집에서 생일 파티.',
  location: '서울 강남구',
  category: '개인',
  repeat: { type: 'yearly', interval: 1 }, // 매년 반복
  notificationTime: 60, // 1시간 전 알림
};

export const DOMAIN_TARGET_EVENT_DATE = DOMAIN_TARGET_EVENT['date'];

export const DOMAIN_TARGET_OVERLAPPING_EVENT: Event = {
  id: '4',
  title: '월간 보고서 제출',
  date: '2024-07-01',
  startTime: '19:00',
  endTime: '21:00',
  description: '월간 업무 보고서 작성 및 제출',
  location: '사무실',
  category: '업무',
  repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' }, // 매월 반복 (12월까지)
  notificationTime: 45, // 45분 전 알림
};

export const DOMAIN_TARGET_IGNORE_CASE_EVENT: Event = {
  id: '2',
  title: '밥먹기',
  date: '2024-07-31',
  startTime: '18:00',
  endTime: '19:00',
  description: '헬스장에서 Weight 트레이닝',
  location: '헬스장',
  category: '운동',
  repeat: { type: 'daily', interval: 1 }, // 매일 반복
  notificationTime: 15, // 15분 전 알림
};

export const DOMAIN_TARGET_OVERLAPPING_NEW_EVENT: Event = {
  id: '6',
  title: '보컬 학원',
  date: '2024-07-01',
  startTime: '19:30',
  endTime: '22:00',
  description: '보컬 학원 가기',
  location: '서울 강남구',
  category: '개인',
  repeat: { type: 'yearly', interval: 1 }, // 매년 반복
  notificationTime: 60, // 1시간 전 알림
};

export const DOMAIN_TARGET_NOT_OVERLAPPING_NEW_EVENT: Event = {
  id: '7', // 이벤트 ID 변경
  title: '가족들과 외식',
  date: '2024-07-01',
  startTime: '17:00',
  endTime: '18:00',
  description: '가족들과 외식 하기',
  location: '서울 강남구',
  category: '개인',
  repeat: { type: 'yearly', interval: 1 }, // 매년 반복
  notificationTime: 60, // 1시간 전 알림
};

export const DOMAIN_EVENTS: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-07-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-05' }, // 매주 반복 (12월 5일까지)
    notificationTime: 30, // 30분 전 알림
  },
  {
    id: '2',
    title: '운동하기',
    date: '2024-07-30',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장에서 웨이트 트레이닝',
    location: '헬스장',
    category: '운동',
    repeat: { type: 'daily', interval: 1 }, // 매일 반복
    notificationTime: 15, // 15분 전 알림
  },
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
  {
    id: '5',
    title: '의사 진료 예약',
    date: '2024-08-10',
    startTime: '09:00',
    endTime: '09:30',
    description: '정기 건강 검진',
    location: '서울 병원',
    category: '건강',
    repeat: { type: 'none', interval: 0 }, // 반복 없음
    notificationTime: 20, // 20분 전 알림
  },
  DOMAIN_TARGET_IGNORE_CASE_EVENT,
];

export const DOMAIN_EVENTS_IN_WEEK: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-07-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-05' }, // 매주 반복 (12월 5일까지)
    notificationTime: 30, // 30분 전 알림
  },
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
];

export const DOMAIN_EVENTS_IN_MONTH: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2024-07-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-05' }, // 매주 반복 (12월 5일까지)
    notificationTime: 30, // 30분 전 알림
  },
  {
    id: '2',
    title: '운동하기',
    date: '2024-07-30',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장에서 웨이트 트레이닝',
    location: '헬스장',
    category: '운동',
    repeat: { type: 'daily', interval: 1 }, // 매일 반복
    notificationTime: 15, // 15분 전 알림
  },
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
  DOMAIN_TARGET_IGNORE_CASE_EVENT,
];

export const DOMAIN_EVENTS_SEARCHABLE_FIELD_IN_WEEK = [
  DOMAIN_TARGET_EVENT,
  DOMAIN_TARGET_OVERLAPPING_EVENT,
  {
    id: '1',
    title: '팀 회의',
    date: '2024-07-05',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-05' }, // 매주 반복 (12월 5일까지)
    notificationTime: 30, // 30분 전 알림
  },
];

export const DOMAIN_INVALID_DATE_TARGET_EVENT: Event = {
  id: '3',
  title: '친구 생일 파티',
  date: '07-01-2024', // 잘못된 날짜 형식
  startTime: '19:30',
  endTime: '22:00',
  description: '친구 집에서 생일 파티',
  location: '서울 강남구',
  category: '개인',
  repeat: { type: 'yearly', interval: 1 }, // 매년 반복
  notificationTime: 60, // 1시간 전 알림
};

export const DOMAIN_INVALID_TIME_TARGET_EVENT: Event = {
  id: '3',
  title: '친구 생일 파티',
  date: '2024-07-01',
  startTime: '30:19', // 잘못된 시간
  endTime: '22:00',
  description: '친구 집에서 생일 파티',
  location: '서울 강남구',
  category: '개인',
  repeat: { type: 'yearly', interval: 1 }, // 매년 반복
  notificationTime: 60, // 1시간 전 알림
};
