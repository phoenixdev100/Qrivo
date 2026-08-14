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
  multiple?: boolean;
}

export function Dropdown({ value, onChange, options, placeholder = 'Select...', className, multiple = false }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropUp, setDropUp] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedValues = multiple ? value.split(',').filter(Boolean) : [value];
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));
  const SelectedIcon = selectedOptions[0]?.icon;

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

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // Approximate max height with options

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/30"
      >
        <div className="flex items-center gap-2">
          {SelectedIcon && <SelectedIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
          <span className={selectedOptions.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
            {multiple && selectedOptions.length > 0 ? `${selectedOptions.length} selected` : (selectedOptions[0]?.label || placeholder)}
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
        <div className={cn(
          'absolute z-[9999] w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900',
          dropUp ? 'bottom-full mb-1' : 'mt-1'
        )}>
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (multiple) {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      onChange(newValues.join(','));
                    } else {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                  )}
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
