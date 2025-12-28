import Input from "./subCompo/Input";
import List from "./subCompo/List";

export default function MemoPopover() {
    return (
        <>
            <p>memo</p>
            <Input kind='memo' />
            <List kind='memo' />
        </>
    )
}