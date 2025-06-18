import { atom } from 'recoil';

export interface Weather {
  pageNo: string;
  numOfRows: number;
  dataType: string;
  base_date: number;
  base_time: number;
  nx: number;
  ny: number;
}
