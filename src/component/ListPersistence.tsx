import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks"
import { saveListToStorage } from "@/thunk/listThunk";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function ListPersistence() {
    const dispatch = useAppDispatch();
    const listState = useSelector((state: RootState) => state.list);
    const userId = useSelector((state: RootState) => state.auth.user?.id);
    const isInitialMount = useRef(true);
    const prevListStateRef = useRef(listState);
    const latestRef = useRef({ listState, userId, hasPending: false });

    latestRef.current.listState = listState;
    latestRef.current.userId = userId;

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevListStateRef.current = listState;
            return;
        }

        if (prevListStateRef.current !== listState) {
            prevListStateRef.current = listState;
            latestRef.current.hasPending = true;

            const handler = setTimeout(() => {
                dispatch(saveListToStorage({ listState, userId }));
                latestRef.current.hasPending = false;
            }, 500);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [listState, userId, dispatch]);

    // 브라우저 닫힘 / 새로고침 / 팝업 닫힘 시 미저장 데이터 즉시 플러시
    useEffect(() => {
        const handleFlush = () => {
            if (latestRef.current.hasPending) {
                dispatch(saveListToStorage({
                    listState: latestRef.current.listState,
                    userId: latestRef.current.userId
                }));
                latestRef.current.hasPending = false;
            }
        };

        window.addEventListener('beforeunload', handleFlush);
        window.addEventListener('pagehide', handleFlush);

        return () => {
            window.removeEventListener('beforeunload', handleFlush);
            window.removeEventListener('pagehide', handleFlush);
            handleFlush();
        };
    }, [dispatch]);

    return null;
}
