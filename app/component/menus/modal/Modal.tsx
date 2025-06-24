
export default function Modal() {
    return (
        <>
            <div className="modal-backdrop">
                <dialog className="modal">
                    {name === 'memo' && <TodoModal />}
                    {name === 'todo' && }
                    <button>닫기</button>
                </dialog>
            </div>
        </>
    )
}