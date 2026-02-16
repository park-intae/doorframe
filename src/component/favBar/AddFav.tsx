

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/util/Modal";
import InputField from "./InputField";
import { BookmarkInput } from "@/type/bookmark";
import { useAppDispatch } from "@/store/hooks";
import { addBookmark } from "@/store/slice/bookmarkSlice";


export default function AddFav() {
    const dispatch = useAppDispatch();
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

        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        if (!isValidUrl(url)) {
            alert('올바른 URL 형식을 입력해주세요. (예: example.com 또는 https://example.com)');
            return;
        }

        // 북마크 추가
        const newBookmark: BookmarkInput = {
            icon: getFaviconUrl(url),
            title: favName.trim(),
            url: url.trim(),
        };

        console.log('➕ 북마크 추가 시도:', newBookmark);
        dispatch(addBookmark(newBookmark));
        console.log('✅ dispatch 완료');
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
            <button
                onClick={() => setShowModal(true)}
                className="group addFav flex justify-center items-center gap-2 hover:bg-background p-2 rounded transition-colors "
            >
                <div className="rounded-full bg-background w-8 h-8 flex justify-center items-center group-hover:bg-point transition-colors">
                    <PlusIcon className="w-5 h-5 text-context group-hover:text-main transition-colors " />
                </div>
            </button>
            <Modal
                isOpen={showModal}
                onClose={resetAndClose}
                title="북마크 추가"
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
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="즐겨찾기 url"
                    />
                    <div className="modal-bottom flex flex-row-reverse">
                        <button
                            onClick={handleSubmit}
                            className="flex justify-center items-center mt-3 rounded bg-point text-main w-8 h-8"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </Modal>
        </>
    )
}