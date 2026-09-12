import { describe, it, expect } from 'vitest';
import {
    parseLocalDate,
    getDaysDifference,
    formatDeadlineDisplay,
    formatPeriodDisplay,
    getTodoDeadlineStatus
} from './todoDate';

describe('todoDate 유틸리티 철저한 검증', () => {
    const mockToday = new Date(2026, 8, 12); // 2026-09-12

    describe('parseLocalDate', () => {
        it('유효한 YYYY-MM-DD 문자열을 로컬 Date 객체로 올바르게 변환한다', () => {
            const date = parseLocalDate('2026-09-12');
            expect(date).not.toBeNull();
            expect(date?.getFullYear()).toBe(2026);
            expect(date?.getMonth()).toBe(8);
            expect(date?.getDate()).toBe(12);
        });

        it('유효하지 않거나 빈 문자열인 경우 null을 반환한다', () => {
            expect(parseLocalDate('')).toBeNull();
            expect(parseLocalDate('invalid-date')).toBeNull();
            expect(parseLocalDate('2026-99-99')).not.toBeNull(); // Date handles overflow, but format matches
        });
    });

    describe('getDaysDifference', () => {
        it('당일인 경우 0을 반환한다', () => {
            const diff = getDaysDifference('2026-09-12', mockToday);
            expect(diff).toBe(0);
        });

        it('하루 뒤(내일)인 경우 1을 반환한다', () => {
            const diff = getDaysDifference('2026-09-13', mockToday);
            expect(diff).toBe(1);
        });

        it('하루 전(어제)인 경우 -1을 반환한다', () => {
            const diff = getDaysDifference('2026-09-11', mockToday);
            expect(diff).toBe(-1);
        });

        it('5일 뒤인 경우 5를 반환한다', () => {
            const diff = getDaysDifference('2026-09-17', mockToday);
            expect(diff).toBe(5);
        });

        it('잘못된 날짜 형식인 경우 null을 반환한다', () => {
            expect(getDaysDifference('not-a-date', mockToday)).toBeNull();
        });
    });

    describe('formatDeadlineDisplay', () => {
        it('월과 일을 2자리 포맷(MM.DD)으로 반환한다', () => {
            expect(formatDeadlineDisplay('2026-09-12')).toBe('09.12');
            expect(formatDeadlineDisplay('2026-01-05')).toBe('01.05');
        });

        it('잘못된 형식일 경우 원본 문자열을 반환한다', () => {
            expect(formatDeadlineDisplay('invalid')).toBe('invalid');
        });
    });

    describe('formatPeriodDisplay', () => {
        it('등록일과 마감일이 서로 다른 경우 기간(MM.DD ~ MM.DD)으로 반환한다', () => {
            expect(formatPeriodDisplay('2026-09-01', '2026-09-10')).toBe('09.01 ~ 09.10');
        });

        it('등록일과 마감일이 동일한 경우 마감일 단일 날짜(MM.DD)로 반환한다', () => {
            expect(formatPeriodDisplay('2026-09-12', '2026-09-12')).toBe('09.12');
        });

        it('등록일 없이 마감일만 있는 경우 ~MM.DD로 반환한다', () => {
            expect(formatPeriodDisplay(undefined, '2026-09-12')).toBe('~09.12');
        });

        it('마감일 없이 등록일만 있는 경우 MM.DD로 반환한다', () => {
            expect(formatPeriodDisplay('2026-09-01', undefined)).toBe('09.01');
        });
    });

    describe('getTodoDeadlineStatus', () => {
        it('마감일이 없는 경우 기본 비활성 상태를 반환한다', () => {
            const status = getTodoDeadlineStatus(undefined, false, mockToday);
            expect(status.hasDeadline).toBe(false);
            expect(status.diffDays).toBeNull();
            expect(status.badgeText).toBe('');
            expect(status.isUrgent).toBe(false);
            expect(status.isOverdue).toBe(false);
        });

        it('당일 마감(D-Day)이고 미완료인 경우 긴급(isUrgent: true)으로 판정된다', () => {
            const status = getTodoDeadlineStatus('2026-09-12', false, mockToday);
            expect(status.hasDeadline).toBe(true);
            expect(status.diffDays).toBe(0);
            expect(status.badgeText).toBe('D-Day');
            expect(status.formattedDate).toBe('09.12');
            expect(status.isUrgent).toBe(true);
            expect(status.isOverdue).toBe(false);
        });

        it('하루 전(D-1)이고 미완료인 경우 긴급(isUrgent: true)으로 판정된다', () => {
            const status = getTodoDeadlineStatus('2026-09-13', false, mockToday);
            expect(status.hasDeadline).toBe(true);
            expect(status.diffDays).toBe(1);
            expect(status.badgeText).toBe('D-1');
            expect(status.isUrgent).toBe(true);
            expect(status.isOverdue).toBe(false);
        });

        it('여유 있는 마감일(D-5)인 경우 긴급이 아니다', () => {
            const status = getTodoDeadlineStatus('2026-09-17', false, mockToday);
            expect(status.hasDeadline).toBe(true);
            expect(status.diffDays).toBe(5);
            expect(status.badgeText).toBe('D-5');
            expect(status.isUrgent).toBe(false);
            expect(status.isOverdue).toBe(false);
        });

        it('마감일이 지난(D+2) 미완료 항목인 경우 긴급 및 기한초과로 판정된다', () => {
            const status = getTodoDeadlineStatus('2026-09-10', false, mockToday);
            expect(status.hasDeadline).toBe(true);
            expect(status.diffDays).toBe(-2);
            expect(status.badgeText).toBe('D+2');
            expect(status.isUrgent).toBe(true);
            expect(status.isOverdue).toBe(true);
        });

        it('마감일이 지났더라도 이미 완료(completed: true)된 항목은 긴급 및 기한초과 경고가 해제된다', () => {
            const status = getTodoDeadlineStatus('2026-09-10', true, mockToday);
            expect(status.hasDeadline).toBe(true);
            expect(status.diffDays).toBe(-2);
            expect(status.badgeText).toBe('D+2');
            expect(status.isUrgent).toBe(false);
            expect(status.isOverdue).toBe(false);
        });

        it('당일 마감이더라도 완료된 경우 긴급 경고가 해제된다', () => {
            const status = getTodoDeadlineStatus('2026-09-12', true, mockToday);
            expect(status.isUrgent).toBe(false);
        });
    });
});
