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
            <label htmlFor="fav-name" className="text-sm font-medium text-context p-1.5">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className="px-4 py-3 glass-input border border-white/40 focus:border-point focus:ring-2 focus:ring-point/30 transition-all text-title placeholder:text-context/50 outline-none mb-4"
                autoFocus={autoFocus}
            />
        </div>
    )
}