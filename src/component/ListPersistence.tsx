

import { RootState } from "@/store";
import { useAppDispatch } from "@/store/hooks"
import { loadListFromStorage, saveListToStorage } from "@/thunk/listThunk";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function ListPersistence() {
    const dispatch = useAppDispatch();
    const listState = useSelector((state: RootState) => state.list);
    const isInitialMount = useRef(true);

    useEffect(() => {
        dispatch(loadListFromStorage());
    }, [dispatch]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        console.log('리스트 변경 감지 > 저장 수행');
        dispatch(saveListToStorage(listState));
    }, [listState, dispatch]);

    return null;
}