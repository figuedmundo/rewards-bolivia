/**
 * TransactionTypeFilter Component
 *
 * Multi-select checkbox group for filtering by transaction type.
 * Supports EARN, REDEEM, ADJUSTMENT, and BURN types.
 * Visual styling with badges to distinguish types.
 */

import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Flame } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TransactionType } from '@/types/filters';

export interface TransactionTypeFilterProps {
  /**
   * Currently selected transaction types
   */
  value: TransactionType[];

  /**
   * Callback when selection changes
   */
  onChange: (types: TransactionType[]) => void;
}

/**
 * Transaction type options with icons and colors
 */
const transactionTypeOptions = [
  {
    type: TransactionType.EARN,
    label: 'Earn',
    icon: ArrowUpCircle,
    color: 'text-green-600',
  },
  {
    type: TransactionType.REDEEM,
    label: 'Redeem',
    icon: ArrowDownCircle,
    color: 'text-red-600',
  },
  {
    type: TransactionType.ADJUSTMENT,
    label: 'Adjustment',
    icon: RefreshCw,
    color: 'text-blue-600',
  },
  {
    type: TransactionType.BURN,
    label: 'Burn',
    icon: Flame,
    color: 'text-orange-600',
  },
];

/**
 * TransactionTypeFilter - Multi-select transaction type filter
 */
export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  /**
   * Handle checkbox change for a specific type
   */
  const handleTypeToggle = (type: TransactionType, checked: boolean) => {
    if (checked) {
      // Add type to selection
      onChange([...value, type]);
    } else {
      // Remove type from selection
      onChange(value.filter((t) => t !== type));
    }
  };

  /**
   * Check if all types are selected
   */
  const allSelected = value.length === transactionTypeOptions.length;

  /**
   * Handle "Select All" / "Deselect All" toggle
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onChange(transactionTypeOptions.map((opt) => opt.type));
    } else {
      onChange([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Transaction Type</Label>
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() => handleSelectAll(!allSelected)}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-3">
        {transactionTypeOptions.map((option) => {
          const Icon = option.icon;
          const isChecked = value.includes(option.type);

          return (
            <div key={option.type} className="flex items-center space-x-3">
              <Checkbox
                id={`type-${option.type}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleTypeToggle(option.type, checked as boolean)}
              />
              <Label
                htmlFor={`type-${option.type}`}
                className="flex flex-1 items-center space-x-2 cursor-pointer"
              >
                <Icon className={`h-4 w-4 ${option.color}`} />
                <span className="text-sm font-normal">{option.label}</span>
              </Label>
            </div>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-amber-600">
          No types selected. All transactions will be hidden.
        </p>
      )}
    </div>
  );
}
