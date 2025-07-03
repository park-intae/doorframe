import Input from "./subCompo/Input";
import List from "./subCompo/List";

export default function MemoModal() {
    return (
        <>
            <Input kind='todo' />
            <List kind='todo' />
        </>
    )
}