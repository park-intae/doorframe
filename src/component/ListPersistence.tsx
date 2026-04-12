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

        const handler = setTimeout(() => {
            dispatch(saveListToStorage(listState));
        }, 500);

        return () => clearTimeout(handler);
    }, [listState, dispatch]);

    return null;
}