/**
 * AmountRangeFilter Component
 *
 * Provides filtering by transaction amount range with validation.
 * Supports positive and negative numbers.
 * Validates that max is greater than min when both are specified.
 */

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
   * Callback when minimum amount changes
   */
  onMinChange: (value: number | undefined) => void;

  /**
   * Callback when maximum amount changes
   */
  onMaxChange: (value: number | undefined) => void;
}

/**
 * AmountRangeFilter - Amount range filter with validation
 */
export function AmountRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: AmountRangeFilterProps) {
  /**
   * Check if current values are valid
   */
  const isValid =
    minValue === undefined || maxValue === undefined || maxValue >= minValue;

  /**
   * Handle minimum amount change
   */
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '-') {
      onMinChange(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onMinChange(numValue);
      }
    }
  };

  /**
   * Handle maximum amount change
   */
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value === '-') {
      onMaxChange(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onMaxChange(numValue);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Amount Range</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-amount" className="text-sm">
            Minimum
          </Label>
          <Input
            id="min-amount"
            type="number"
            placeholder="No minimum"
            value={minValue !== undefined ? minValue : ''}
            onChange={handleMinChange}
            step="0.01"
            className={!isValid ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-amount" className="text-sm">
            Maximum
          </Label>
          <Input
            id="max-amount"
            type="number"
            placeholder="No maximum"
            value={maxValue !== undefined ? maxValue : ''}
            onChange={handleMaxChange}
            step="0.01"
            className={!isValid ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        </div>
      </div>

      {!isValid && (
        <p className="text-sm text-red-500">
          Maximum amount must be greater than or equal to minimum amount
        </p>
      )}

      <p className="text-xs text-gray-500">
        Note: Negative values represent redemptions and burns
      </p>
    </div>
  );
}
