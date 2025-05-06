import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DateTimePickerProps {
  value: string;
  onChange: (date: Date) => void;
  error?: string;
  className?: string;
}

const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ value, onChange, error, className }, ref) => {
    return (
      <div className="relative">
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange(new Date(e.target.value))}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          ref={ref}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';

export { DateTimePicker }; 