"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface AutocompleteInputProps<T> {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  fetchOptions: (query: string) => Promise<T[]>;
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
  getKey?: (option: T) => string;
  minLength?: number; // минимальная длина для запуска поиска
}

export default function AutocompleteInput<T>({
  label,
  placeholder,
  value,
  onChange,
  fetchOptions,
  renderOption,
  onSelect,
  getKey = (opt: any) => opt.id,
  minLength = 2,
}: AutocompleteInputProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= minLength) {
      fetchOptions(value).then(setOptions).catch(() => setOptions([]));
      setOpen(true);
    } else {
      setOptions([]);
      setOpen(false);
    }
  }, [value, fetchOptions, minLength]);

  // Закрытие при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (options.length > 0) setOpen(true);
        }}
      />
      {open && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={getKey(opt)}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              {renderOption(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
