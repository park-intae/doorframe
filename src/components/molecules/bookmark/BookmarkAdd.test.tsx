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
    renderWithRedux(<AddFav />);
    // id="addFav" 버튼을 찾아서 클릭
    const addButton = screen.getByTestId('addFav') || screen.getByRole('button', { name: '' });
    fireEvent.click(addButton);
    
    // Modal 내부의 title 확인 (Modal 컴포넌트가 title prop을 잘 사용한다고 가정)
    expect(screen.getByText('북마크 추가')).toBeInTheDocument();
  });
});
