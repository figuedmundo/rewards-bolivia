/**
 * AmountRangeFilter Component
 *
 * Provides min and max numeric input fields for filtering by point amount.
 * Supports positive values (earnings) and negative values (redemptions/debits).
 * Validates that max is greater than min when both are specified.
 * Mobile-optimized with numeric keyboard support.
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AmountRangeFilterProps {
  /**
   * Minimum amount value
   */
  minValue?: number;

  /**
   * Maximum amount value
   */
  maxValue?: number;

  /**
   * Callback when min value changes
   */
  onMinChange: (value: number | undefined) => void;

  /**
   * Callback when max value changes
   */
  onMaxChange: (value: number | undefined) => void;
}

/**
 * AmountRangeFilter - Min/Max amount range inputs
 * Optimized for mobile with numeric keyboard and proper validation
 */
export function AmountRangeFilter({ minValue, maxValue, onMinChange, onMaxChange }: AmountRangeFilterProps) {
  const [minInput, setMinInput] = useState<string>(minValue !== undefined ? String(minValue) : '');
  const [maxInput, setMaxInput] = useState<string>(maxValue !== undefined ? String(maxValue) : '');
  const [validationError, setValidationError] = useState<string>('');

  /**
   * Update local state when props change
   */
  useEffect(() => {
    setMinInput(minValue !== undefined ? String(minValue) : '');
  }, [minValue]);

  useEffect(() => {
    setMaxInput(maxValue !== undefined ? String(maxValue) : '');
  }, [maxValue]);

  /**
   * Validate amount range
   */
  const validateRange = (min: number | undefined, max: number | undefined): string => {
    if (min !== undefined && max !== undefined && max < min) {
      return 'Maximum must be greater than minimum';
    }
    return '';
  };

  /**
   * Handle min value change
   */
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinInput(value);

    if (value === '') {
      onMinChange(undefined);
      setValidationError(validateRange(undefined, maxValue));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onMinChange(numValue);
        setValidationError(validateRange(numValue, maxValue));
      }
    }
  };

  /**
   * Handle max value change
   */
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxInput(value);

    if (value === '') {
      onMaxChange(undefined);
      setValidationError(validateRange(minValue, undefined));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onMaxChange(numValue);
        setValidationError(validateRange(minValue, numValue));
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Amount Range</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-amount" className="text-sm">
            Min Amount
          </Label>
          <Input
            id="min-amount"
            type="number"
            inputMode="decimal"
            placeholder="No minimum"
            value={minInput}
            onChange={handleMinChange}
            className="min-h-[44px] sm:min-h-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-amount" className="text-sm">
            Max Amount
          </Label>
          <Input
            id="max-amount"
            type="number"
            inputMode="decimal"
            placeholder="No maximum"
            value={maxInput}
            onChange={handleMaxChange}
            className="min-h-[44px] sm:min-h-0"
          />
        </div>
      </div>

      {validationError && <p className="text-sm text-red-500">{validationError}</p>}

      <p className="text-xs text-gray-500">
        Tip: Use negative values for redemptions (e.g., -500 to -100)
      </p>
    </div>
  );
}
