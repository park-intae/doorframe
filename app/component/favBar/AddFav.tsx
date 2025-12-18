'use client';

import { addBookmark } from "app/store/slice/bookmarkSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "app/util/Modal";
import InputField from "./InputField";


export default function AddFav() {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState('');
    const [favName, setFavName] = useState('');

    //파비콘
    const getFaviconUrl = (urlString: string) => {
        try {
            const urlObj = new URL(urlString);
            return `${urlObj.origin}/favicon.ico`;
        } catch {
            return 'https://www.google.com/favicon.ico';
        }
    }

    //초기화
    const resetAndClose = () => {
        setUrl('');
        setFavName('');
        setShowModal(false);
    }

    //url 유효성검사
    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    }

    // 입력
    const handleSubmit = () => {
        // 입력값 검증
        if (!favName.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }

        if (!url.trim()) {
            alert('URL을 입력해주세요.');
            return;
        }

        if (!isValidUrl(url)) {
            alert('올바른 URL 형식을 입력해주세요. (예: https://example.com)');
            return;
        }

        // 북마크 추가
        const newBookmark = {
            id: Date.now(),
            icon: getFaviconUrl(url),
            title: favName.trim(),
            url: url.trim(),
        };

        dispatch(addBookmark(newBookmark));
        resetAndClose();
    };

    //Enter키로 제출
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <>
            {/* <a className="addFav group flex justify-center items-center gap-2 hover:bg-blue-50 p-2 rounded transition-colors">
                <div className="rounded-full bg-blue-200 w-8 h-8 flex justify-center items-center group-hover:bg-blue-400 transition-colors">
                    <PlusIcon className="w-5 h-5 text-gray-800" />
                </div>
            </a> */}
            <button>
                <div>
                    <PlusIcon />
                </div>
            </button>
            <Modal
                isOpen={showModal}
                onClose={resetAndClose}
            >
                <div className="nameInputField flex flex-col">
                    <InputField
                        id="fav-name"
                        label="이름"
                        value={favName}
                        onChange={(e) => setFavName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="즐겨찾기 이름"
                        autoFocus
                    />
                    <InputField
                        id="fav-url"
                        label="url"
                        value={url}
                        onChange={(e) => setFavName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="즐겨찾기 이름"
                        autoFocus
                    />
                </div>
            </Modal>
        </>
    )
}