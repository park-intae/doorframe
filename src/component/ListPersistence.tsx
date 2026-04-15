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

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            dispatch(saveListToStorage({ listState, userId }));
        }, 500);

        return () => clearTimeout(handler);
    }, [listState, userId, dispatch]);

    return null;
}
