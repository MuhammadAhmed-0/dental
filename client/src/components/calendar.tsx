import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';

interface CalendarProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  showTimePicker?: boolean;
  className?: string;
}

const timeSlots = Array.from({ length: 24 }, (_, hour) => {
  return Array.from({ length: 2 }, (_, halfHour) => {
    const minutes = halfHour * 30;
    return {
      label: format(setMinutes(setHours(new Date(), hour), minutes), 'h:mm a'),
      hours: hour,
      minutes: minutes
    };
  });
}).flat();

export function Calendar({ date, onSelect, showTimePicker = false, className }: CalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(date);
  const [timeSlot, setTimeSlot] = useState<string | undefined>(
    date ? format(date, 'HH:mm') : undefined
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelected(undefined);
      onSelect?.(undefined);
      return;
    }

    let finalDate = newDate;
    if (timeSlot) {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      finalDate = setMinutes(setHours(newDate, hours), minutes);
    }

    setSelected(finalDate);
    onSelect?.(finalDate);
  };

  const handleTimeSelect = (time: string) => {
    if (!selected) return;

    const [hours, minutes] = time.split(':').map(Number);
    const newDate = setMinutes(setHours(selected, hours), minutes);

    setTimeSlot(time);
    setSelected(newDate);
    onSelect?.(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarUI
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {showTimePicker && selected && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !timeSlot && 'text-muted-foreground'
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {timeSlot ? format(setMinutes(setHours(new Date(), parseInt(timeSlot.split(':')[0])), parseInt(timeSlot.split(':')[1])), 'h:mm a') : <span>Pick a time</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start">
            <div className="h-60 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button
                  key={`${slot.hours}:${slot.minutes}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleTimeSelect(`${slot.hours.toString().padStart(2, '0')}:${slot.minutes.toString().padStart(2, '0')}`)}
                >
                  {slot.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}