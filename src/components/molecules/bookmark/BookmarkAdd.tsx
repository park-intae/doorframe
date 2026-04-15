

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "@/util/Modal";
import InputField from "./BookmarkInput";
import { BookmarkInput } from "@/type/bookmark";
import { useAppDispatch } from "@/store/hooks";
import { addBookmark } from "@/store/slice/bookmarkSlice";
import { uploadFavicon } from "@/util/iconUploader";


export default function AddFav() {
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [url, setUrl] = useState('');
    const [favName, setFavName] = useState('');

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
    const handleSubmit = async () => {
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

        if (!isValidUrl(normalizedUrl)) {
            alert('올바른 URL 형식을 입력해주세요. (예: example.com 또는 https://example.com)');
            return;
        }

        // 파비콘 업로드 및 처리
        const iconUrl = await uploadFavicon(normalizedUrl);

        // 북마크 추가
        const newBookmark: BookmarkInput = {
            icon: iconUrl,
            title: favName.trim(),
            url: normalizedUrl,
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
                id="addFav"
                className="group flex justify-center items-center gap-2 hover:bg-background p-2 rounded transition-colors focus:outline-none"
                aria-label="북마크 추가하기"
            >
                <div className="rounded-full bg-background w-8 h-8 flex justify-center items-center group-hover:bg-point transition-colors">
                    <PlusIcon className="w-5 h-5 text-context group-hover:text-main transition-colors" aria-hidden="true" />
                </div>
            </button>
            <Modal
                isOpen={showModal}
                onClose={resetAndClose}
                title="북마크 추가"
            >
                <div id="nameInputField" className="flex flex-col">
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
                    <div className="modal-bottom flex justify-end mt-4">
                        <button
                            onClick={handleSubmit}
                            className="glass-button flex items-center gap-2 px-6 py-3 text-point font-bold hover:brightness-105 transition-all active:scale-95 group"
                            aria-label="북마크 저장"
                        >
                            <span className="text-sm">저장하기</span>
                            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" aria-hidden="true" />
                        </button>
                    </div>
                </div>

            </Modal>
        </>
    )
}