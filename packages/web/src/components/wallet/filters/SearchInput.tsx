/**
 * SearchInput Component
 *
 * Search input with debouncing for merchant/business name search.
 * Debounces input by 400ms to reduce API calls.
 * Shows clear button when input has text.
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchInputProps {
  /**
   * Current search value
   */
  value: string;

  /**
   * Callback when search value changes (debounced)
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Debounce delay in milliseconds (default: 400ms)
   */
  debounceMs?: number;

  /**
   * Minimum characters to trigger search (default: 0)
   */
  minChars?: number;
}

/**
 * SearchInput - Debounced search input for merchant filtering
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search by merchant or transaction ID...',
  debounceMs = 400,
  minChars = 0,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
    setDebouncedValue(value);
  }, [value]);

  // Debounce the search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [localValue, debounceMs]);

  // Call onChange when debounced value changes
  useEffect(() => {
    // Only trigger onChange if meets minimum character requirement
    if (debouncedValue.length >= minChars || debouncedValue.length === 0) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, minChars]);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  const showMinCharsWarning = minChars > 0 && localValue.length > 0 && localValue.length < minChars;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          className="pl-10 pr-10"
        />
        {localValue.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {showMinCharsWarning && (
        <p className="text-xs text-amber-600">
          Enter at least {minChars} characters to search
        </p>
      )}
    </div>
  );
}
