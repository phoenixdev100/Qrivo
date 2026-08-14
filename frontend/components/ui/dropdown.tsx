import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

export function Dropdown({ value, onChange, options, placeholder = 'Select...', className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/30"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
          <span className={!selectedOption ? 'text-slate-400 dark:text-slate-500' : ''}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-500 transition-transform dark:text-slate-400',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  option.value === value
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                {option.icon && <option.icon className="h-4 w-4" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
