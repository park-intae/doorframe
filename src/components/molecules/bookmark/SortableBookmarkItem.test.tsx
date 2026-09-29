import { render, screen } from '@testing-library/react';
import { SortableBookmarkItem } from './SortableBookmarkItem';
import { vi, describe, it, expect } from 'vitest';

// Mock dnd-kit hooks to avoid context errors in tests
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: '',
    isDragging: false,
  }),
}));

// Mock CSS utility from dnd-kit
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

describe('SortableBookmarkItem 컴포넌트', () => {
  const mockItem = {
    id: 1,
    title: '테스트 북마크',
    url: 'https://example.com',
    icon: 'https://example.com/favicon.ico',
  };

  it('북마크 클릭 시 새 탭이 아닌 현재 탭에서 이동해야 함 (target="_blank" 없음)', () => {
    render(
      <SortableBookmarkItem
        item={mockItem}
        isOpen={false}
        onRemove={vi.fn()}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).not.toHaveAttribute('target', '_blank');
    expect(link).not.toHaveAttribute('rel', 'nooper noreferrer');
  });
});
