import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, placeholder = 'Select...', label, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <span className="text-xs font-bold uppercase text-brutal-black/60 mb-1 block">{label}</span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="brutal-input w-full flex items-center justify-between text-sm min-w-[140px]"
      >
        <span className={`flex items-center gap-2 truncate ${!selected ? 'text-brutal-black/50' : ''}`}>
          {selected?.badge && (
            <span className="font-bold text-xs bg-brutal-black text-brutal-yellow px-1.5 py-0.5 border-2 border-brutal-black">
              {selected.badge}
            </span>
          )}
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-brutal-white border-3 border-brutal-black shadow-brutal">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-mono border-b-2 border-brutal-black/10 hover:bg-brutal-yellow/20 transition-colors ${
                opt.value === value ? 'bg-brutal-lime/30 font-bold' : ''
              }`}
            >
              <span className="flex items-center gap-2 text-left">
                {opt.badge && (
                  <span className="text-xs font-bold bg-brutal-black text-brutal-yellow px-1.5 py-0.5 border border-brutal-black">
                    {opt.badge}
                  </span>
                )}
                {opt.label}
              </span>
              {opt.value === value && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
