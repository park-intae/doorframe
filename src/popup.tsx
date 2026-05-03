import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { usePopupState } from './hooks/usePopupState';

const Popup = () => {
  const [text, setText] = usePopupState('popup-input-text', '');

  return (
    <div className="w-[300px] h-[400px] p-4 bg-white dark:bg-gray-900">
      <h1 className="text-lg font-bold mb-2">Doorframe</h1>
      <input
        type="text"
        className="w-full p-2 border rounded text-black"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 입력하면 상태가 유지됩니다."
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
