import Input from "./subCompo/Input";
import List from "./subCompo/List";

export default function MemoPopover() {
    return (
        <>
            <Input kind='todo' />
            <List kind='todo' />
        </>
    )
}