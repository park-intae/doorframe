/**
 * Todo 항목의 마감일(deadline) 계산 및 상태(D-Day, 임박, 초과 등) 판별 유틸리티
 */

export interface TodoDeadlineStatus {
    hasDeadline: boolean;
    diffDays: number | null;
    formattedDate: string;
    periodText: string;
    badgeText: string;
    isUrgent: boolean;
    isOverdue: boolean;
}

/**
 * YYYY-MM-DD 형식의 날짜 문자열을 로컬 기준 자정 Date 객체로 변환합니다.
 * 타임존 오차 및 브라우저 파싱 차이를 방지합니다.
 */
export function parseLocalDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
}

/**
 * 기준일(기본값: 오늘)과 마감일 간의 일수 차이를 계산합니다.
 * - diffDays > 0: 마감일까지 남은 일수 (예: 1 -> 내일 마감)
 * - diffDays === 0: 오늘 마감 (D-Day)
 * - diffDays < 0: 마감일 초과 (예: -1 -> 어제 마감)
 */
export function getDaysDifference(deadlineStr: string, baseDate: Date = new Date()): number | null {
    const deadlineDate = parseLocalDate(deadlineStr);
    if (!deadlineDate) return null;

    const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const diffMs = deadlineDate.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 마감일 문자열을 간결한 형태(예: '09.12')로 포맷팅합니다.
 */
export function formatDeadlineDisplay(deadlineStr: string): string {
    const parsed = parseLocalDate(deadlineStr);
    if (!parsed) return deadlineStr;

    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${month}.${day}`;
}

/**
 * 등록일과 마감일을 조합하여 간결한 기간 문자열(예: '09.01 ~ 09.10')로 포맷팅합니다.
 */
export function formatPeriodDisplay(startDateStr?: string, deadlineStr?: string): string {
    const startFormatted = startDateStr ? formatDeadlineDisplay(startDateStr) : '';
    const endFormatted = deadlineStr ? formatDeadlineDisplay(deadlineStr) : '';

    if (startFormatted && endFormatted) {
        if (startFormatted === endFormatted) {
            return endFormatted;
        }
        return `${startFormatted} ~ ${endFormatted}`;
    }
    if (endFormatted) {
        return `~${endFormatted}`;
    }
    return startFormatted;
}

/**
 * Todo 항목의 마감일 상태를 종합적으로 계산하여 UI에서 필요한 속성을 반환합니다.
 * 
 * @param deadline 마감일 (YYYY-MM-DD)
 * @param completed 항목 완료 여부
 * @param baseDate 기준 날짜 (기본값: 현재 로컬 날짜)
 * @param startDate 등록일 (YYYY-MM-DD)
 */
export function getTodoDeadlineStatus(
    deadline?: string,
    completed: boolean = false,
    baseDate: Date = new Date(),
    startDate?: string
): TodoDeadlineStatus {
    if (!deadline) {
        return {
            hasDeadline: false,
            diffDays: null,
            formattedDate: '',
            periodText: startDate ? formatDeadlineDisplay(startDate) : '',
            badgeText: '',
            isUrgent: false,
            isOverdue: false,
        };
    }

    const diffDays = getDaysDifference(deadline, baseDate);
    if (diffDays === null) {
        return {
            hasDeadline: false,
            diffDays: null,
            formattedDate: '',
            periodText: startDate ? formatDeadlineDisplay(startDate) : '',
            badgeText: '',
            isUrgent: false,
            isOverdue: false,
        };
    }

    const formattedDate = formatDeadlineDisplay(deadline);
    const periodText = formatPeriodDisplay(startDate, deadline);
    let badgeText = '';
    const isOverdue = diffDays < 0;

    if (isOverdue) {
        badgeText = `D+${Math.abs(diffDays)}`;
    } else if (diffDays === 0) {
        badgeText = 'D-Day';
    } else {
        badgeText = `D-${diffDays}`;
    }

    // 마감 임박 조건: 이미 지났거나(Overdue), 오늘(D-Day), 또는 하루 전(D-1)인 경우
    // 단, 완료된 항목(completed === true)은 경고를 표시하지 않음
    const isUrgent = !completed && (diffDays <= 1);

    return {
        hasDeadline: true,
        diffDays,
        formattedDate,
        periodText,
        badgeText,
        isUrgent,
        isOverdue: !completed && isOverdue,
    };
}
