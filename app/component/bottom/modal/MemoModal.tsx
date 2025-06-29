import Input from "./subCompo/Input";

export default function MemoModal() {
    const handleInputSubmit = (value: string) => {
        console.log('입력된 값:', value);
    }

    return (
        <>
            <Input onSubmit={handleInputSubmit} />
        </>
    )
}