import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AddFav from './BookmarkAdd';
import bookmarkReducer from '@/store/slice/bookmarkSlice';

// Redux 스토어 래퍼 생성
const renderWithRedux = (ui: React.ReactElement) => {
  const store = configureStore({ reducer: { bookmarks: bookmarkReducer } });
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
};

describe('AddFav 컴포넌트 모달 테스트', () => {
  it('버튼 클릭 시 모달이 열려야 함', () => {
    const { container } = renderWithRedux(<AddFav />);
    // id="addFav"를 사용하여 버튼을 찾음
    const addButton = container.querySelector('#addFav') as HTMLElement;
    fireEvent.click(addButton);

    // Modal 내부의 title 확인
    expect(screen.getByText('북마크 추가')).toBeDefined();
  });
});

