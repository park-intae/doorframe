import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddFav from './BookmarkAdd';
import bookmarkReducer from '@/store/slice/bookmarkSlice';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as iconUploader from '@/util/iconUploader';

const renderWithRedux = (ui: React.ReactElement) => {
  const store = configureStore({ reducer: { bookmarks: bookmarkReducer } });
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
};

describe('AddFav 컴포넌트 모달 및 북마크 추가 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(iconUploader, 'uploadFavicon').mockResolvedValue('https://example.com/favicon.png');
  });

  it('버튼 클릭 시 모달이 열려야 함', () => {
    const { container } = renderWithRedux(<AddFav />);
    const addButton = container.querySelector('#addFav') as HTMLElement;
    fireEvent.click(addButton);

    expect(screen.getByText('북마크 추가')).toBeDefined();
  });

  it('이름이 비어있을 때 알림을 띄우고 추가하지 않아야 함', async () => {
    const { container } = renderWithRedux(<AddFav />);
    fireEvent.click(container.querySelector('#addFav')!);

    // 제출 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '북마크 저장' }));
    expect(window.alert).toHaveBeenCalledWith('이름을 입력해주세요.');
  });

  it('URL이 비어있을 때 알림을 띄우고 추가하지 않아야 함', async () => {
    const { container } = renderWithRedux(<AddFav />);
    fireEvent.click(container.querySelector('#addFav')!);

    const nameInput = screen.getByPlaceholderText('즐겨찾기 이름');
    fireEvent.change(nameInput, { target: { value: '테스트' } });

    fireEvent.click(screen.getByRole('button', { name: '북마크 저장' }));
    expect(window.alert).toHaveBeenCalledWith('URL을 입력해주세요.');
  });

  it('올바르지 않은 URL 형식일 때 알림을 띄워야 함', async () => {
    const { container } = renderWithRedux(<AddFav />);
    fireEvent.click(container.querySelector('#addFav')!);

    const nameInput = screen.getByPlaceholderText('즐겨찾기 이름');
    const urlInput = screen.getByPlaceholderText('즐겨찾기 url');

    fireEvent.change(nameInput, { target: { value: '테스트' } });
    fireEvent.change(urlInput, { target: { value: 'http://' } }); // invalid url

    fireEvent.click(screen.getByRole('button', { name: '북마크 저장' }));
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('올바른 URL 형식을 입력해주세요')
    );
  });

  it('정상적인 입력 시 북마크를 스토어에 추가하고 모달을 닫아야 함', async () => {
    const { container, store } = renderWithRedux(<AddFav />);
    fireEvent.click(container.querySelector('#addFav')!);

    const nameInput = screen.getByPlaceholderText('즐겨찾기 이름');
    const urlInput = screen.getByPlaceholderText('즐겨찾기 url');

    fireEvent.change(nameInput, { target: { value: '구글' } });
    fireEvent.change(urlInput, { target: { value: 'google.com' } }); // https:// 자동 추가 검증

    fireEvent.click(screen.getByRole('button', { name: '북마크 저장' }));

    await waitFor(() => {
      const state = store.getState();
      const added = state.bookmarks.find((b) => b.title === '구글');
      expect(added).toBeDefined();
      expect(added?.url).toBe('https://google.com');
    });
  });

  it('Enter 키 입력 시 제출 처리가 되어야 함', async () => {
    const { container, store } = renderWithRedux(<AddFav />);
    fireEvent.click(container.querySelector('#addFav')!);

    const nameInput = screen.getByPlaceholderText('즐겨찾기 이름');
    const urlInput = screen.getByPlaceholderText('즐겨찾기 url');

    fireEvent.change(nameInput, { target: { value: '네이버' } });
    fireEvent.change(urlInput, { target: { value: 'https://naver.com' } });

    fireEvent.keyDown(urlInput, { key: 'Enter' });

    await waitFor(() => {
      const state = store.getState();
      const added = state.bookmarks.find((b) => b.title === '네이버');
      expect(added).toBeDefined();
    });
  });
});
