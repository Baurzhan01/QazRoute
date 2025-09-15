"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps<T> {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  fetchOptions: (query: string) => Promise<T[]>;
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
  getKey?: (option: T) => string;
  minLength?: number;
}

export default function SearchInput<T>({
  label,
  placeholder,
  value,
  onChange,
  fetchOptions,
  renderOption,
  onSelect,
  getKey = (opt: any) => opt.id,
  minLength = 2,
}: SearchInputProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  async function doSearch() {
    if (value.length < minLength) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchOptions(value);
      setOptions(res);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      doSearch();
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="outline" onClick={doSearch} disabled={loading}>
          {loading ? "…" : "Найти"}
        </Button>
      </div>

      {options.length > 0 && (
        <div className="mt-2 border rounded-md bg-white shadow max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={getKey(opt)}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-sm"
            >
              <div>{renderOption(opt)}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600"
                onClick={() => {
                  onSelect(opt);
                  setOptions([]); // очищаем список после выбора
                }}
              >
                Выбрать
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
