/**
 * DateRangeFilter Component
 *
 * Provides date range filtering with quick presets and custom date selection.
 * Supports presets: Last 7/30/90 days, This year, All time.
 * Allows custom date range selection with validation.
 * Touch-optimized for mobile devices with adequate button sizes.
 */

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePreset } from '@/types/filters';
import { getDateRangeForPreset } from '@/lib/filter-utils';

export interface DateRangeFilterProps {
  /**
   * Current start date (ISO 8601 format: YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * Current end date (ISO 8601 format: YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Currently selected preset (if any)
   */
  selectedPreset?: DatePreset;

  /**
   * Callback when date range changes
   */
  onChange: (startDate: string | undefined, endDate: string | undefined, preset?: DatePreset) => void;
}

const presets: { label: string; value: DatePreset }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This year', value: 'year' },
  { label: 'All time', value: 'all' },
];

/**
 * DateRangeFilter - Date range selection with presets and custom dates
 * Optimized for mobile with touch-friendly controls
 */
export function DateRangeFilter({ startDate, endDate, selectedPreset, onChange }: DateRangeFilterProps) {
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  );

  /**
   * Handle preset selection
   */
  const handlePresetClick = (preset: DatePreset) => {
    const { startDate, endDate } = getDateRangeForPreset(preset);
    setCustomStartDate(startDate ? new Date(startDate) : undefined);
    setCustomEndDate(endDate ? new Date(endDate) : undefined);
    onChange(startDate, endDate, preset);
  };

  /**
   * Handle custom date selection
   */
  const handleCustomDateChange = (start: Date | undefined, end: Date | undefined) => {
    // Validate: end date should not be before start date
    if (start && end && end < start) {
      return; // Don't update if invalid
    }

    setCustomStartDate(start);
    setCustomEndDate(end);

    const startDateStr = start ? format(start, 'yyyy-MM-dd') : undefined;
    const endDateStr = end ? format(end, 'yyyy-MM-dd') : undefined;

    onChange(startDateStr, endDateStr, undefined); // Clear preset when using custom dates
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Date Range</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={selectedPreset === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset.value)}
              className="touch-manipulation min-h-[44px] sm:min-h-0"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm">
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className="w-full justify-start text-left font-normal min-h-[44px] sm:min-h-0"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStartDate ? format(customStartDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={(date) => handleCustomDateChange(date, customEndDate)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm">
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className="w-full justify-start text-left font-normal min-h-[44px] sm:min-h-0"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEndDate ? format(customEndDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEndDate}
                onSelect={(date) => handleCustomDateChange(customStartDate, date)}
                disabled={(date) => {
                  // Disable dates before start date
                  if (customStartDate && date < customStartDate) {
                    return true;
                  }
                  return false;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {customStartDate && customEndDate && customEndDate < customStartDate && (
        <p className="text-sm text-red-500">End date cannot be before start date</p>
      )}
    </div>
  );
}
