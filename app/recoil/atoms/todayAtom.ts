import { atom } from 'recoil';
// 나중에 날씨데이터도 얻어오셈

// 날짜/시간 데이터
export interface todayTimeState {
  date: string;
  time: string;
}

export const todayState = atom<todayTimeState>({
  key: 'todayTimeState',
  default: {
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }),
    time: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  },
});
