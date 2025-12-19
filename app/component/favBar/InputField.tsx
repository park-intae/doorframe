interface InputFieldProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function InputField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    onKeyDown,
    placeholder,
    autoFocus = false
}: InputFieldProps) {
    return (
        <div className="flex flex-col">
            <label htmlFor="fav-name" className="text-sm font-medium text-gray-700 p-1.5">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                autoFocus={autoFocus}
            />
        </div>
    )
}